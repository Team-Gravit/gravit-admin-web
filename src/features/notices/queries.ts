import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getNotices } from '@/features/notices/api';

/** 공지 queryKey 팩토리 (04 §9-1). 생성/수정/삭제 시 noticeKeys.all invalidate. */
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
