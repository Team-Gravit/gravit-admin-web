import { apiClient } from '@/shared/api/client';
import {
  chapterListResponseSchema,
  type ChapterListResponse,
} from '@/features/chapters/schemas';

/** GET /chapters?page=n — 챕터 목록 (03 §7-1). 페이지 크기 20 고정(서버). */
export async function getChapters(page: number): Promise<ChapterListResponse> {
  const { data } = await apiClient.get('/chapters', { params: { page } });
  return chapterListResponseSchema.parse(data);
}
