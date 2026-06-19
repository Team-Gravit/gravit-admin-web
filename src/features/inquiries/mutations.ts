import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createInquiryAnswer,
  deleteInquiryAnswer,
  updateInquiryAnswer,
} from '@/features/inquiries/api';
import { inquiryKeys } from '@/features/inquiries/queries';
import type { InquiryDetail } from '@/features/inquiries/schemas';

/**
 * 답변 등록 (inquiry-handoff A-2-4). 성공 시 201 상세객체로 detail 캐시 갱신(status→RESOLVED 즉시 반영)
 * + lists invalidate(목록 상태배지 갱신).
 */
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

/** 답변 수정 (inquiry-handoff A-2-4). 성공 시 200 상세객체로 detail 캐시 갱신(status 유지). */
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

/** 답변 삭제 (inquiry-handoff A-2-4). 204 무본문 → status→PENDING. detail+lists invalidate. */
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
