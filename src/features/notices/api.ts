import { apiClient } from '@/shared/api/client';
import { noticeListResponseSchema, type NoticeListResponse } from '@/features/notices/schemas';

/** GET /notices?page=n — 공지 목록 (03 §9-1). 페이지 크기 20 고정(서버). */
export async function getNotices(page: number): Promise<NoticeListResponse> {
  const { data } = await apiClient.get('/notices', { params: { page } });
  return noticeListResponseSchema.parse(data);
}
