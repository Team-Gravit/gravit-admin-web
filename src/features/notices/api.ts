import { apiClient } from '@/shared/api/client';
import {
  noticeListResponseSchema,
  type NoticeFormValues,
  type NoticeListResponse,
} from '@/features/notices/schemas';

/** GET /notices?page=n — 공지 목록 (03 §9-1). 페이지 크기 20 고정(서버). */
export async function getNotices(page: number): Promise<NoticeListResponse> {
  const { data } = await apiClient.get('/notices', { params: { page } });
  return noticeListResponseSchema.parse(data);
}

/** 공지 작성 body (03 §9-3). 작성 시 status 는 DRAFT|PUBLISHED 만(ARCHIVED 불가). */
export interface CreateNoticeBody extends NoticeFormValues {
  status: 'DRAFT' | 'PUBLISHED';
}

/** POST /notices — 공지 작성 (03 §9-3, 201). */
export async function createNotice(body: CreateNoticeBody): Promise<void> {
  await apiClient.post('/notices', body);
}
