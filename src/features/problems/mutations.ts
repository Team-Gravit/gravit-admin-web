import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  updateObjectiveProblem,
  updateSubjectiveProblem,
  type UpdateObjectiveBody,
  type UpdateSubjectiveBody,
} from '@/features/problems/api';
import { problemKeys } from '@/features/problems/queries';

export function useUpdateObjectiveProblem(problemId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateObjectiveBody) => updateObjectiveProblem(problemId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: problemKeys.detail(problemId) });
    },
  });
}

export function useUpdateSubjectiveProblem(problemId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateSubjectiveBody) => updateSubjectiveProblem(problemId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: problemKeys.detail(problemId) });
    },
  });
}
