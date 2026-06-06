import { useQuery } from '@tanstack/react-query';
import { getProblem } from '@/features/problems/api';

/** 문제 queryKey 팩토리 (04 §9-1). */
export const problemKeys = {
  all: ['problems'] as const,
  details: () => [...problemKeys.all, 'detail'] as const,
  detail: (problemId: number | string) => [...problemKeys.details(), problemId] as const,
};

export function useProblem(problemId: number) {
  return useQuery({
    queryKey: problemKeys.detail(problemId),
    queryFn: () => getProblem(problemId),
    enabled: Number.isFinite(problemId),
  });
}
