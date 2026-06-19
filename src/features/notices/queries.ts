import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getNotice, getNotices } from '@/features/notices/api';

export const noticeKeys = {
  all: ['notices'] as const,
  lists: () => [...noticeKeys.all, 'list'] as const,
  list: (page: number) => [...noticeKeys.lists(), page] as const,
  details: () => [...noticeKeys.all, 'detail'] as const,
  detail: (noticeId: number | string) => [...noticeKeys.details(), noticeId] as const,
};

export function useNotices(page: number) {
  return useQuery({
    queryKey: noticeKeys.list(page),
    queryFn: () => getNotices(page),
    placeholderData: keepPreviousData,
  });
}

export function useNotice(noticeId: number) {
  return useQuery({
    queryKey: noticeKeys.detail(noticeId),
    queryFn: () => getNotice(noticeId),
    enabled: Number.isFinite(noticeId),
  });
}
