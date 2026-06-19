import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getInquiries, getInquiry, type InquiryListFilters } from '@/features/inquiries/api';

/** 문의 queryKey 팩토리. 답변 등록/수정/삭제 시 detail+lists invalidate(상태 전환 반영). */
export const inquiryKeys = {
  all: ['inquiries'] as const,
  lists: () => [...inquiryKeys.all, 'list'] as const,
  list: (filters: InquiryListFilters) => [...inquiryKeys.lists(), filters] as const,
  details: () => [...inquiryKeys.all, 'detail'] as const,
  detail: (inquiryId: number | string) => [...inquiryKeys.details(), inquiryId] as const,
};

export function useInquiries(filters: InquiryListFilters) {
  return useQuery({
    queryKey: inquiryKeys.list(filters),
    queryFn: () => getInquiries(filters),
    placeholderData: keepPreviousData,
  });
}

export function useInquiry(inquiryId: number) {
  return useQuery({
    queryKey: inquiryKeys.detail(inquiryId),
    queryFn: () => getInquiry(inquiryId),
    enabled: Number.isFinite(inquiryId),
  });
}
