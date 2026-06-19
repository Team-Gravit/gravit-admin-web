import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getLesson, getLessonProblems } from '@/features/lessons/api';

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
