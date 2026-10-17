import { useEffect, useRef } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { qaQueryRetry } from '@/shared/api/qaClient';
import { getJob, getSprint, listSprints } from '@/features/qa/api';
import type { JobStatus, SprintStatus } from '@/features/qa/schemas';

export const qaKeys = {
  all: ['qa'] as const,
  sprintLists: () => [...qaKeys.all, 'sprints', 'list'] as const,
  sprintList: (status: SprintStatus | undefined) =>
    [...qaKeys.sprintLists(), status ?? 'ALL'] as const,
  sprints: () => [...qaKeys.all, 'sprints', 'detail'] as const,
  sprint: (sprintId: number) => [...qaKeys.sprints(), sprintId] as const,
  job: (jobId: number) => [...qaKeys.all, 'jobs', jobId] as const,
  checklist: (sprintId: number) => [...qaKeys.all, 'checklists', sprintId] as const,
};

/** 작업 polling 간격 (QA_SPEC 결정 #7). */
const JOB_POLL_INTERVAL_MS = 3_000;

export function isJobActive(status: JobStatus | undefined): boolean {
  return status === 'QUEUED' || status === 'RUNNING';
}

export function useSprints(status: SprintStatus | undefined) {
  return useQuery({
    queryKey: qaKeys.sprintList(status),
    queryFn: () => listSprints(status),
    placeholderData: keepPreviousData,
    retry: qaQueryRetry,
  });
}

/** 공통 상단·하위 화면이 같은 쿼리를 공유한다 (QA_SPEC B-1). */
export function useSprint(sprintId: number) {
  return useQuery({
    queryKey: qaKeys.sprint(sprintId),
    queryFn: () => getSprint(sprintId),
    enabled: Number.isFinite(sprintId),
    retry: qaQueryRetry,
  });
}

/**
 * 준비 작업. QUEUED·RUNNING 동안 3초 간격 polling — 화면을 떠나면(언마운트·탭 숨김) 멈추고 돌아오면 재개.
 * 실행 중이던 작업이 끝나면(SUCCEEDED·FAILED·CANCELLED) 스프린트·체크리스트를 무효화한다 (결정 #7).
 */
export function useSetupJob(sprintId: number, jobId: number | null) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: qaKeys.job(jobId ?? -1),
    queryFn: () => getJob(jobId ?? -1),
    enabled: jobId !== null,
    retry: qaQueryRetry,
    // 조회가 실패한 동안은 멈춘다 — 실패해도 이전 data(RUNNING)가 남아 있어 그대로 두면 403·503 을 3초마다
    // 다시 묻고 토스트를 반복한다(D9-3: 403 종착, 503 은 사용자가 다시 시도). [다시 시도]가 성공하면 재개된다.
    refetchInterval: (q) =>
      q.state.status !== 'error' && isJobActive(q.state.data?.status)
        ? JOB_POLL_INTERVAL_MS
        : false,
  });

  const status = query.data?.status;
  const prevStatus = useRef(status);
  useEffect(() => {
    const wasActive = isJobActive(prevStatus.current);
    prevStatus.current = status;
    if (wasActive && status && !isJobActive(status)) {
      void queryClient.invalidateQueries({ queryKey: qaKeys.sprint(sprintId) });
      void queryClient.invalidateQueries({ queryKey: qaKeys.checklist(sprintId) });
      void queryClient.invalidateQueries({ queryKey: qaKeys.sprintLists() });
    }
  }, [status, sprintId, queryClient]);

  return query;
}
