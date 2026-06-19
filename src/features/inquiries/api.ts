import { apiClient } from '@/shared/api/client';
import type { InquiryStatus } from '@/shared/constants/enums';
import {
  inquiryDetailSchema,
  inquiryListResponseSchema,
  type InquiryDetail,
  type InquiryListResponse,
} from '@/features/inquiries/schemas';

export interface InquiryListFilters {
  page: number;
  status?: InquiryStatus;
}

export async function getInquiries(filters: InquiryListFilters): Promise<InquiryListResponse> {
  const params: Record<string, string | number> = { page: filters.page };
  if (filters.status) params.status = filters.status;
  const { data } = await apiClient.get('/inquiries', { params });
  return inquiryListResponseSchema.parse(data);
}

export async function getInquiry(inquiryId: number): Promise<InquiryDetail> {
  const { data } = await apiClient.get(`/inquiries/${inquiryId}`);
  return inquiryDetailSchema.parse(data);
}

export async function createInquiryAnswer(
  inquiryId: number,
  content: string,
): Promise<InquiryDetail> {
  const { data } = await apiClient.post(`/inquiries/${inquiryId}/answer`, { content });
  return inquiryDetailSchema.parse(data);
}

export async function updateInquiryAnswer(
  inquiryId: number,
  content: string,
): Promise<InquiryDetail> {
  const { data } = await apiClient.put(`/inquiries/${inquiryId}/answer`, { content });
  return inquiryDetailSchema.parse(data);
}

export async function deleteInquiryAnswer(inquiryId: number): Promise<void> {
  await apiClient.delete(`/inquiries/${inquiryId}/answer`);
}
