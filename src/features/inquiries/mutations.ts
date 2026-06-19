import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createInquiryAnswer,
  deleteInquiryAnswer,
  updateInquiryAnswer,
} from '@/features/inquiries/api';
import { inquiryKeys } from '@/features/inquiries/queries';
import type { InquiryDetail } from '@/features/inquiries/schemas';

export function useCreateInquiryAnswer(inquiryId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => createInquiryAnswer(inquiryId, content),
    onSuccess: (detail: InquiryDetail) => {
      queryClient.setQueryData(inquiryKeys.detail(inquiryId), detail);
      void queryClient.invalidateQueries({ queryKey: inquiryKeys.lists() });
    },
  });
}

export function useUpdateInquiryAnswer(inquiryId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => updateInquiryAnswer(inquiryId, content),
    onSuccess: (detail: InquiryDetail) => {
      queryClient.setQueryData(inquiryKeys.detail(inquiryId), detail);
      void queryClient.invalidateQueries({ queryKey: inquiryKeys.lists() });
    },
  });
}

export function useDeleteInquiryAnswer(inquiryId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteInquiryAnswer(inquiryId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: inquiryKeys.detail(inquiryId) });
      void queryClient.invalidateQueries({ queryKey: inquiryKeys.lists() });
    },
  });
}
