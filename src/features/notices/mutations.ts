import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createNotice, type CreateNoticeBody } from '@/features/notices/api';
import { noticeKeys } from '@/features/notices/queries';

/** 공지 작성 (03 §9-3). 성공 시 목록 invalidate. 토스트·이동은 호출 페이지가 처리(status별 문구). */
export function useCreateNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateNoticeBody) => createNotice(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: noticeKeys.all });
    },
  });
}
