import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getLesson, getLessonProblems } from '@/features/lessons/api';

/** 레슨 queryKey 팩토리 (04 §9-1). 문제 목록은 레슨 상세 하위 키. */
export const lessonKeys = {
  all: ['lessons'] as const,
  details: () => [...lessonKeys.all, 'detail'] as const,
  detail: (lessonId: number | string) => [...lessonKeys.details(), lessonId] as const,
  problemLists: (lessonId: number | string) => [...lessonKeys.detail(lessonId), 'problems'] as const,
  problemList: (lessonId: number | string, page: number) =>
    [...lessonKeys.problemLists(lessonId), page] as const,
};

export function useLesson(lessonId: number) {
  return useQuery({
    queryKey: lessonKeys.detail(lessonId),
    queryFn: () => getLesson(lessonId),
    enabled: Number.isFinite(lessonId),
  });
}

export function useLessonProblems(lessonId: number, page: number) {
  return useQuery({
    queryKey: lessonKeys.problemList(lessonId, page),
    queryFn: () => getLessonProblems(lessonId, page),
    enabled: Number.isFinite(lessonId),
    placeholderData: keepPreviousData,
  });
}
