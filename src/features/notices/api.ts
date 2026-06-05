import { apiClient } from '@/shared/api/client';
import {
  noticeDetailSchema,
  noticeListResponseSchema,
  type NoticeDetail,
  type NoticeEditFormValues,
  type NoticeFormValues,
  type NoticeListResponse,
} from '@/features/notices/schemas';

/** GET /notices?page=n — 공지 목록 (03 §9-1). 페이지 크기 20 고정(서버). */
export async function getNotices(page: number): Promise<NoticeListResponse> {
  const { data } = await apiClient.get('/notices', { params: { page } });
  return noticeListResponseSchema.parse(data);
}

/** GET /notices/{id} — 공지 상세 (03 §9-2). */
export async function getNotice(noticeId: number): Promise<NoticeDetail> {
  const { data } = await apiClient.get(`/notices/${noticeId}`);
  return noticeDetailSchema.parse(data);
}

/** 공지 작성 body (03 §9-3). 작성 시 status 는 DRAFT|PUBLISHED 만(ARCHIVED 불가). */
export interface CreateNoticeBody extends NoticeFormValues {
  status: 'DRAFT' | 'PUBLISHED';
}

/** POST /notices — 공지 작성 (03 §9-3, 201). */
export async function createNotice(body: CreateNoticeBody): Promise<void> {
  await apiClient.post('/notices', body);
}

/** 공지 수정 body (03 §9-4). 상태 전이 제약은 백엔드가 검증(409). */
export type UpdateNoticeBody = NoticeEditFormValues;

/** PATCH /notices/{id} — 공지 수정 (03 §9-4). */
export async function updateNotice(noticeId: number, body: UpdateNoticeBody): Promise<void> {
  await apiClient.patch(`/notices/${noticeId}`, body);
}

/** DELETE /notices/{id} — 공지 삭제 (03 §9-5, 204 soft delete). */
export async function deleteNotice(noticeId: number): Promise<void> {
  await apiClient.delete(`/notices/${noticeId}`);
}
