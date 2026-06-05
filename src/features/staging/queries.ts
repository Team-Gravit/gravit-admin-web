import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { StagingStatus } from '@/shared/constants/enums';
import { getStagingLabels } from '@/features/staging/api';

/** 스테이징 queryKey 팩토리 (04 §9-1). promote 시 stagingKeys.all + dashboard invalidate. */
export const stagingKeys = {
  all: ['staging'] as const,
  lists: () => [...stagingKeys.all, 'list'] as const,
  list: (page: number, status?: StagingStatus) =>
    [...stagingKeys.lists(), { page, status: status ?? 'ALL' }] as const,
  details: () => [...stagingKeys.all, 'detail'] as const,
  detail: (label: string) => [...stagingKeys.details(), label] as const,
};

export function useStagingLabels(page: number, status?: StagingStatus) {
  return useQuery({
    queryKey: stagingKeys.list(page, status),
    queryFn: () => getStagingLabels(page, status),
    placeholderData: keepPreviousData,
  });
}
