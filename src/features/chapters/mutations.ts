import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateChapter, type UpdateChapterBody } from '@/features/chapters/api';
import { chapterKeys } from '@/features/chapters/queries';

/** 챕터 수정 (03 §7-4). 성공 시 챕터 상세 invalidate(제목·설명 갱신). */
export function useUpdateChapter(chapterId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateChapterBody) => updateChapter(chapterId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chapterKeys.detail(chapterId) });
    },
  });
}
