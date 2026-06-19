import { apiClient } from '@/shared/api/client';
import {
  noticeDetailSchema,
  noticeListResponseSchema,
  type NoticeDetail,
  type NoticeEditFormValues,
  type NoticeFormValues,
  type NoticeListResponse,
} from '@/features/notices/schemas';

export async function getNotices(page: number): Promise<NoticeListResponse> {
  const { data } = await apiClient.get('/notices', { params: { page } });
  return noticeListResponseSchema.parse(data);
}

export async function getNotice(noticeId: number): Promise<NoticeDetail> {
  const { data } = await apiClient.get(`/notices/${noticeId}`);
  return noticeDetailSchema.parse(data);
}

export interface CreateNoticeBody extends NoticeFormValues {
  status: 'DRAFT' | 'PUBLISHED';
}

export async function createNotice(body: CreateNoticeBody): Promise<void> {
  await apiClient.post('/notices', body);
}

export type UpdateNoticeBody = NoticeEditFormValues;

export async function updateNotice(noticeId: number, body: UpdateNoticeBody): Promise<void> {
  await apiClient.patch(`/notices/${noticeId}`, body);
}

export async function deleteNotice(noticeId: number): Promise<void> {
  await apiClient.delete(`/notices/${noticeId}`);
}
