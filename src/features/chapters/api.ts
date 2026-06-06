import { apiClient } from '@/shared/api/client';
import {
  chapterDetailSchema,
  chapterListResponseSchema,
  chapterStatsSchema,
  chapterUnitListResponseSchema,
  type ChapterDetail,
  type ChapterListResponse,
  type ChapterStats,
  type ChapterUnitListResponse,
} from '@/features/chapters/schemas';

/** GET /chapters?page=n — 챕터 목록 (03 §7-1). 페이지 크기 20 고정(서버). */
export async function getChapters(page: number): Promise<ChapterListResponse> {
  const { data } = await apiClient.get('/chapters', { params: { page } });
  return chapterListResponseSchema.parse(data);
}

/** GET /chapters/{chapterId} — 챕터 상세 (03 §7-2). */
export async function getChapter(chapterId: number): Promise<ChapterDetail> {
  const { data } = await apiClient.get(`/chapters/${chapterId}`);
  return chapterDetailSchema.parse(data);
}

/** GET /chapters/{chapterId}/stats — 챕터 풀이 현황 (03 §7-3). */
export async function getChapterStats(chapterId: number): Promise<ChapterStats> {
  const { data } = await apiClient.get(`/chapters/${chapterId}/stats`);
  return chapterStatsSchema.parse(data);
}

/** GET /chapters/{chapterId}/units?page=n — 유닛 목록 (03 §7-5). 페이지 크기 20 고정(서버). */
export async function getChapterUnits(
  chapterId: number,
  page: number,
): Promise<ChapterUnitListResponse> {
  const { data } = await apiClient.get(`/chapters/${chapterId}/units`, { params: { page } });
  return chapterUnitListResponseSchema.parse(data);
}

/** PATCH /chapters/{chapterId} 본문 (03 §7-4). title/description 부분 업데이트. */
export interface UpdateChapterBody {
  title: string;
  description: string;
}

/** PATCH /chapters/{chapterId} — 챕터 수정 (03 §7-4). */
export async function updateChapter(chapterId: number, body: UpdateChapterBody): Promise<void> {
  await apiClient.patch(`/chapters/${chapterId}`, body);
}
