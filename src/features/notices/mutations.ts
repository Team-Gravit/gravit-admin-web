import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createNotice,
  deleteNotice,
  updateNotice,
  type CreateNoticeBody,
  type UpdateNoticeBody,
} from '@/features/notices/api';
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

/** 공지 수정 (03 §9-4). 성공 시 전체 invalidate(목록+상세). */
export function useUpdateNotice(noticeId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateNoticeBody) => updateNotice(noticeId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: noticeKeys.all });
    },
  });
}

/** 공지 삭제 (03 §9-5, soft delete). 성공 시 목록 invalidate. */
export function useDeleteNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (noticeId: number) => deleteNotice(noticeId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: noticeKeys.all });
    },
  });
}
