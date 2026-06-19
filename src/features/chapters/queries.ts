import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  getChapter,
  getChapters,
  getChapterStats,
  getChapterUnits,
} from '@/features/chapters/api';

export const chapterKeys = {
  all: ['chapters'] as const,
  lists: () => [...chapterKeys.all, 'list'] as const,
  list: (page: number) => [...chapterKeys.lists(), page] as const,
  details: () => [...chapterKeys.all, 'detail'] as const,
  detail: (chapterId: number | string) => [...chapterKeys.details(), chapterId] as const,
  stats: (chapterId: number | string) => [...chapterKeys.detail(chapterId), 'stats'] as const,
  unitLists: (chapterId: number | string) => [...chapterKeys.detail(chapterId), 'units'] as const,
  unitList: (chapterId: number | string, page: number) =>
    [...chapterKeys.unitLists(chapterId), page] as const,
};

export function useChapters(page: number) {
  return useQuery({
    queryKey: chapterKeys.list(page),
    queryFn: () => getChapters(page),
    placeholderData: keepPreviousData,
  });
}

export function useChapter(chapterId: number) {
  return useQuery({
    queryKey: chapterKeys.detail(chapterId),
    queryFn: () => getChapter(chapterId),
    enabled: Number.isFinite(chapterId),
  });
}

export function useChapterStats(chapterId: number) {
  return useQuery({
    queryKey: chapterKeys.stats(chapterId),
    queryFn: () => getChapterStats(chapterId),
    enabled: Number.isFinite(chapterId),
  });
}

export function useChapterUnits(chapterId: number, page: number) {
  return useQuery({
    queryKey: chapterKeys.unitList(chapterId, page),
    queryFn: () => getChapterUnits(chapterId, page),
    enabled: Number.isFinite(chapterId),
    placeholderData: keepPreviousData,
  });
}
