import { apiClient } from '@/shared/api/client';
import type { InquiryStatus } from '@/shared/constants/enums';
import {
  inquiryDetailSchema,
  inquiryListResponseSchema,
  type InquiryDetail,
  type InquiryListResponse,
} from '@/features/inquiries/schemas';

/** 문의 목록 필터 (inquiry-handoff A-2-1). 진입 기본은 status=PENDING(대기). page 1-base. */
export interface InquiryListFilters {
  page: number;
  status?: InquiryStatus;
}

/** GET /inquiries?page&status — 문의 목록 (inquiry-handoff A-2-1). */
export async function getInquiries(filters: InquiryListFilters): Promise<InquiryListResponse> {
  const params: Record<string, string | number> = { page: filters.page };
  if (filters.status) params.status = filters.status;
  const { data } = await apiClient.get('/inquiries', { params });
  return inquiryListResponseSchema.parse(data);
}

/** GET /inquiries/{id} — 문의 상세 (inquiry-handoff A-2-2). */
export async function getInquiry(inquiryId: number): Promise<InquiryDetail> {
  const { data } = await apiClient.get(`/inquiries/${inquiryId}`);
  return inquiryDetailSchema.parse(data);
}

/** POST /inquiries/{id}/answer — 답변 등록 (inquiry-handoff A-2-4). 201 + 상세객체, status→RESOLVED. */
export async function createInquiryAnswer(
  inquiryId: number,
  content: string,
): Promise<InquiryDetail> {
  const { data } = await apiClient.post(`/inquiries/${inquiryId}/answer`, { content });
  return inquiryDetailSchema.parse(data);
}

/** PUT /inquiries/{id}/answer — 답변 수정 (inquiry-handoff A-2-4). 200 + 상세객체, status 유지. */
export async function updateInquiryAnswer(
  inquiryId: number,
  content: string,
): Promise<InquiryDetail> {
  const { data } = await apiClient.put(`/inquiries/${inquiryId}/answer`, { content });
  return inquiryDetailSchema.parse(data);
}

/** DELETE /inquiries/{id}/answer — 답변 삭제 (inquiry-handoff A-2-4). 204, status→PENDING 복구. */
export async function deleteInquiryAnswer(inquiryId: number): Promise<void> {
  await apiClient.delete(`/inquiries/${inquiryId}/answer`);
}
