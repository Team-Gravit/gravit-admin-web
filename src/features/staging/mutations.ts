import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateStagingLesson } from '@/features/staging/api';
import { stagingKeys } from '@/features/staging/queries';

/** 스테이징 레슨 수정 (03 §8-3). 성공 시 라벨 상세 invalidate. */
export function useUpdateStagingLesson(lessonId: number, label: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { title: string }) => updateStagingLesson(lessonId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: stagingKeys.detail(label) });
    },
  });
}
