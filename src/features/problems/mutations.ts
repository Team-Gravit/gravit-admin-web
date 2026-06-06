import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  updateObjectiveProblem,
  updateSubjectiveProblem,
  type UpdateObjectiveBody,
  type UpdateSubjectiveBody,
} from '@/features/problems/api';
import { problemKeys } from '@/features/problems/queries';

/** 객관식 문제 수정 (03 §7-13). 성공 시 문제 상세 invalidate. */
export function useUpdateObjectiveProblem(problemId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateObjectiveBody) => updateObjectiveProblem(problemId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: problemKeys.detail(problemId) });
    },
  });
}

/** 주관식 문제 수정 (03 §7-14, D1/D2). 성공 시 문제 상세 invalidate. */
export function useUpdateSubjectiveProblem(problemId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateSubjectiveBody) => updateSubjectiveProblem(problemId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: problemKeys.detail(problemId) });
    },
  });
}
