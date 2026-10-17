import { useIsMutating, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { QaApiError } from '@/shared/api/qaClient';
import { cancelJob, createSprint, startSetupJob } from '@/features/qa/api';
import { qaKeys } from '@/features/qa/queries';
import { TOAST_COPY } from '@/features/qa/copy';
import type { Job, Sprint } from '@/features/qa/schemas';

/**
 * 스프린트 등록. 404·409·400 은 모달 입력 아래에 표시하므로(QA_SPEC A-3) 전역 토스트를 끈다 —
 * 그 밖의 상태는 화면이 토스트로 알린다.
 */
export function useCreateSprint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notionPageUrl: string) => createSprint(notionPageUrl),
    meta: { skipGlobalErrorToast: true },
    onSuccess: (sprint: Sprint) => {
      queryClient.setQueryData(qaKeys.sprint(sprint.id), sprint);
      void queryClient.invalidateQueries({ queryKey: qaKeys.sprintLists() });
    },
  });
}

const startSetupKey = (sprintId: number) => ['qa', 'startSetupJob', sprintId] as const;

/**
 * QA 준비하기 (A-2 #5). 공통 상단 배너에서도 호출되고 그 직후 화면이 바뀌어 호출한 컴포넌트가
 * 언마운트될 수 있으므로, 캐시 갱신·토스트는 훅 수준 콜백에 둔다.
 * 받은 Job 을 캐시에 넣고 스프린트의 latestSetupJobId 를 그 작업으로 가리켜 곧바로 polling 을 시작한다.
 * 409(실행 중 작업 있음·상태 불가)는 스프린트를 다시 조회한다(A-3). 오류 문구는 전역 토스트.
 */
export function useStartSetupJob(sprintId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: startSetupKey(sprintId),
    mutationFn: () => startSetupJob(sprintId),
    onSuccess: (job: Job) => {
      queryClient.setQueryData(qaKeys.job(job.id), job);
      queryClient.setQueryData<Sprint>(qaKeys.sprint(sprintId), (prev) =>
        prev ? { ...prev, latestSetupJobId: job.id } : prev,
      );
      void queryClient.invalidateQueries({ queryKey: qaKeys.sprint(sprintId) });
      void queryClient.invalidateQueries({ queryKey: qaKeys.sprintLists() });
      toast.success(TOAST_COPY.SETUP_STARTED);
    },
    onError: (error) => {
      if (error instanceof QaApiError && error.status === 409) {
        void queryClient.invalidateQueries({ queryKey: qaKeys.sprint(sprintId) });
      }
    },
  });
}

/** 배너와 준비 화면의 시작 버튼이 서로의 진행 중 상태를 보도록 — 두 번 눌러 409 가 나지 않게 한다. */
export function useIsStartingSetupJob(sprintId: number): boolean {
  return useIsMutating({ mutationKey: startSetupKey(sprintId) }) > 0;
}

/** 작업 취소 (A-2 #7). 409 = 이미 끝난 작업 → 작업을 다시 조회한다(A-3). */
export function useCancelJob(jobId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => cancelJob(jobId),
    onSuccess: (job: Job) => {
      queryClient.setQueryData(qaKeys.job(job.id), job);
      toast.success(TOAST_COPY.JOB_CANCEL_REQUESTED);
    },
    onError: (error) => {
      if (error instanceof QaApiError && error.status === 409) {
        void queryClient.invalidateQueries({ queryKey: qaKeys.job(jobId) });
      }
    },
  });
}
