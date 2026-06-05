import { apiClient } from '@/shared/api/client';
import {
  lessonDetailSchema,
  lessonProblemListResponseSchema,
  type LessonDetail,
  type LessonProblemListResponse,
} from '@/features/lessons/schemas';

/** GET /lessons/{lessonId} — 레슨 상세 (03 §7-9). */
export async function getLesson(lessonId: number): Promise<LessonDetail> {
  const { data } = await apiClient.get(`/lessons/${lessonId}`);
  return lessonDetailSchema.parse(data);
}

/** GET /lessons/{lessonId}/problems?page=n — 문제 목록 (03 §7-11). 페이지 크기 20 고정(서버). */
export async function getLessonProblems(
  lessonId: number,
  page: number,
): Promise<LessonProblemListResponse> {
  const { data } = await apiClient.get(`/lessons/${lessonId}/problems`, { params: { page } });
  return lessonProblemListResponseSchema.parse(data);
}

/** PATCH /lessons/{lessonId} 본문 (03 §7-10). title 만 수정 가능(description 필드 없음). */
export interface UpdateLessonBody {
  title: string;
}

/** PATCH /lessons/{lessonId} — 레슨 수정 (03 §7-10). */
export async function updateLesson(lessonId: number, body: UpdateLessonBody): Promise<void> {
  await apiClient.patch(`/lessons/${lessonId}`, body);
}
