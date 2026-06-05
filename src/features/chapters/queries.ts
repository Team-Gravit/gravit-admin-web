import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getChapters } from '@/features/chapters/api';

/** 챕터 queryKey 팩토리 (04 §9-1). */
export const chapterKeys = {
  all: ['chapters'] as const,
  lists: () => [...chapterKeys.all, 'list'] as const,
  list: (page: number) => [...chapterKeys.lists(), page] as const,
  details: () => [...chapterKeys.all, 'detail'] as const,
  detail: (chapterId: number | string) => [...chapterKeys.details(), chapterId] as const,
};

export function useChapters(page: number) {
  return useQuery({
    queryKey: chapterKeys.list(page),
    queryFn: () => getChapters(page),
    placeholderData: keepPreviousData,
  });
}
