import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createNotice,
  deleteNotice,
  updateNotice,
  type CreateNoticeBody,
  type UpdateNoticeBody,
} from '@/features/notices/api';
import { noticeKeys } from '@/features/notices/queries';

export function useCreateNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateNoticeBody) => createNotice(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: noticeKeys.all });
    },
  });
}

export function useUpdateNotice(noticeId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateNoticeBody) => updateNotice(noticeId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: noticeKeys.all });
    },
  });
}

export function useDeleteNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (noticeId: number) => deleteNotice(noticeId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: noticeKeys.all });
    },
  });
}
