import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateLesson, type UpdateLessonBody } from '@/features/lessons/api';
import { lessonKeys } from '@/features/lessons/queries';

export function useUpdateLesson(lessonId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateLessonBody) => updateLesson(lessonId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: lessonKeys.detail(lessonId) });
    },
  });
}
