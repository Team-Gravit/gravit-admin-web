import { apiClient } from '@/shared/api/client';
import {
  lessonDetailSchema,
  lessonProblemListResponseSchema,
  type LessonDetail,
  type LessonProblemListResponse,
} from '@/features/lessons/schemas';

export async function getLesson(lessonId: number): Promise<LessonDetail> {
  const { data } = await apiClient.get(`/lessons/${lessonId}`);
  return lessonDetailSchema.parse(data);
}

export async function getLessonProblems(
  lessonId: number,
  page: number,
): Promise<LessonProblemListResponse> {
  const { data } = await apiClient.get(`/lessons/${lessonId}/problems`, { params: { page } });
  return lessonProblemListResponseSchema.parse(data);
}

export interface UpdateLessonBody {
  title: string;
}

export async function updateLesson(lessonId: number, body: UpdateLessonBody): Promise<void> {
  await apiClient.patch(`/lessons/${lessonId}`, body);
}
