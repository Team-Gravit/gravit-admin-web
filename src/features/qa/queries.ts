import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { qaQueryRetry } from '@/shared/api/qaClient';
import { listSprints } from '@/features/qa/api';
import type { SprintStatus } from '@/features/qa/schemas';

export const qaKeys = {
  all: ['qa'] as const,
  sprintLists: () => [...qaKeys.all, 'sprints', 'list'] as const,
  sprintList: (status: SprintStatus | undefined) =>
    [...qaKeys.sprintLists(), status ?? 'ALL'] as const,
  sprints: () => [...qaKeys.all, 'sprints', 'detail'] as const,
  sprint: (sprintId: number) => [...qaKeys.sprints(), sprintId] as const,
};

export function useSprints(status: SprintStatus | undefined) {
  return useQuery({
    queryKey: qaKeys.sprintList(status),
    queryFn: () => listSprints(status),
    placeholderData: keepPreviousData,
    retry: qaQueryRetry,
  });
}
