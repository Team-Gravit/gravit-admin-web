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

export async function getChapters(page: number): Promise<ChapterListResponse> {
  const { data } = await apiClient.get('/chapters', { params: { page } });
  return chapterListResponseSchema.parse(data);
}

export async function getChapter(chapterId: number): Promise<ChapterDetail> {
  const { data } = await apiClient.get(`/chapters/${chapterId}`);
  return chapterDetailSchema.parse(data);
}

export async function getChapterStats(chapterId: number): Promise<ChapterStats> {
  const { data } = await apiClient.get(`/chapters/${chapterId}/stats`);
  return chapterStatsSchema.parse(data);
}

export async function getChapterUnits(
  chapterId: number,
  page: number,
): Promise<ChapterUnitListResponse> {
  const { data } = await apiClient.get(`/chapters/${chapterId}/units`, { params: { page } });
  return chapterUnitListResponseSchema.parse(data);
}

export interface UpdateChapterBody {
  title: string;
  description: string;
}

export async function updateChapter(chapterId: number, body: UpdateChapterBody): Promise<void> {
  await apiClient.patch(`/chapters/${chapterId}`, body);
}
