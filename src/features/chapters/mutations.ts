import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateChapter, type UpdateChapterBody } from '@/features/chapters/api';
import { chapterKeys } from '@/features/chapters/queries';

export function useUpdateChapter(chapterId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateChapterBody) => updateChapter(chapterId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chapterKeys.detail(chapterId) });
    },
  });
}
