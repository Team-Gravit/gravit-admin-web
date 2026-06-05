import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateLesson, type UpdateLessonBody } from '@/features/lessons/api';
import { lessonKeys } from '@/features/lessons/queries';

/** 레슨 수정 (03 §7-10). 성공 시 레슨 상세 invalidate(제목 갱신). */
export function useUpdateLesson(lessonId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateLessonBody) => updateLesson(lessonId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: lessonKeys.detail(lessonId) });
    },
  });
}
