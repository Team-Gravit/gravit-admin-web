import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { qaQueryRetry } from '@/shared/api/qaClient';
import {
  getChecklist,
  getDesignHistory,
  getDesignReview,
  getFixReports,
  getJob,
  getReflections,
  getSprint,
  listCheckCellHistory,
  listSprints,
} from '@/features/qa/api';
import type { Job, JobStatus, Part, Round, SetupStepKey, Sprint } from '@/features/qa/schemas';

export const qaKeys = {
  all: ['qa'] as const,
  sprintLists: () => ['qa', 'sprints', 'list'] as const,
  sprint: (id: number) => ['qa', 'sprints', 'detail', id] as const,
  job: (id: number) => ['qa', 'jobs', id] as const,
  checklists: (id: number) => ['qa', 'checklists', id] as const,
  checklist: (id: number, round: Round) => ['qa', 'checklists', id, round] as const,
  design: (id: number) => ['qa', 'design', id] as const,
  reflections: (id: number) => ['qa', 'reflections', id] as const,
  cellHistory: (id: number, part: Part) => ['qa', 'cellHistory', id, part] as const,
  designHistory: (id: number) => ['qa', 'designHistory', id] as const,
  fixReports: (id: number) => ['qa', 'fixReports', id] as const,
};
export const isJobActive = (status: JobStatus | undefined) =>
  status === 'QUEUED' || status === 'RUNNING';
export const hasRunningSetup = (sprint: Sprint) => isJobActive(sprint.latestJob?.status);
export function isStageRunning(sprint: Sprint, keys: readonly SetupStepKey[]) {
  return (
    hasRunningSetup(sprint) &&
    sprint.setupSteps.some((step) => keys.includes(step.key) && step.status === 'RUNNING')
  );
}
export function useSprints() {
  return useQuery({ queryKey: qaKeys.sprintLists(), queryFn: listSprints, retry: qaQueryRetry });
}
export function useSprint(id: number) {
  return useQuery({
    queryKey: qaKeys.sprint(id),
    queryFn: () => getSprint(id),
    enabled: Number.isSafeInteger(id) && id > 0,
    retry: qaQueryRetry,
  });
}
/** One observer in the sprint layout keeps every tab in sync with the setup worker. */
export function useSetupJob(sprintId: number, latestJob: Job | null) {
  const client = useQueryClient();
  const id = latestJob?.id ?? -1;
  const query = useQuery({
    queryKey: qaKeys.job(id),
    queryFn: () => getJob(id),
    enabled: id > 0,
    initialData: latestJob ?? undefined,
    staleTime: 3_000,
    retry: qaQueryRetry,
    refetchInterval: (q) =>
      q.state.status !== 'error' && isJobActive(q.state.data?.status) ? 3_000 : false,
  });
  const job = query.data;
  const updatedAt = query.dataUpdatedAt;
  useEffect(() => {
    if (!job || !updatedAt) return;
    void client.invalidateQueries({ queryKey: qaKeys.sprint(sprintId) });
    void client.invalidateQueries({ queryKey: qaKeys.sprintLists() });
    void client.invalidateQueries({ queryKey: qaKeys.checklists(sprintId) });
    void client.invalidateQueries({ queryKey: qaKeys.design(sprintId) });
    void client.invalidateQueries({ queryKey: qaKeys.reflections(sprintId) });
    void client.invalidateQueries({ queryKey: qaKeys.fixReports(sprintId) });
  }, [job, updatedAt, sprintId, client]);
  return query;
}
export function useChecklist(id: number, round: Round, enabled = true) {
  return useQuery({
    queryKey: qaKeys.checklist(id, round),
    queryFn: () => getChecklist(id, round),
    enabled,
    retry: qaQueryRetry,
  });
}
export function useFixReports(id: number) {
  return useQuery({
    queryKey: qaKeys.fixReports(id),
    queryFn: () => getFixReports(id),
    retry: qaQueryRetry,
  });
}
export function useDesignReview(id: number, enabled = true) {
  return useQuery({
    queryKey: qaKeys.design(id),
    queryFn: () => getDesignReview(id),
    enabled,
    retry: qaQueryRetry,
  });
}
export function useReflections(id: number) {
  return useQuery({
    queryKey: qaKeys.reflections(id),
    queryFn: () => getReflections(id),
    retry: qaQueryRetry,
    refetchInterval: (q) =>
      q.state.status !== 'error' && q.state.data?.some((r) => r.state === 'APPROVED')
        ? 3_000
        : false,
  });
}
export function useCellHistory(id: number, part: Part) {
  return useQuery({
    queryKey: qaKeys.cellHistory(id, part),
    queryFn: () => listCheckCellHistory(id, part),
    retry: qaQueryRetry,
  });
}
export function useDesignHistory(id: number) {
  return useQuery({
    queryKey: qaKeys.designHistory(id),
    queryFn: () => getDesignHistory(id),
    retry: qaQueryRetry,
  });
}
