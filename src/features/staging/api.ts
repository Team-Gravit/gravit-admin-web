import { apiClient } from '@/shared/api/client';
import type { StagingStatus } from '@/shared/constants/enums';
import {
  stagingLabelDetailSchema,
  stagingLabelListResponseSchema,
  type StagingLabelDetail,
  type StagingLabelListResponse,
} from '@/features/staging/schemas';

export async function getStagingLabels(
  page: number,
  status?: StagingStatus,
): Promise<StagingLabelListResponse> {
  const params: Record<string, string | number> = { page };
  if (status) params.status = status;
  const { data } = await apiClient.get('/staging/labels', { params });
  return stagingLabelListResponseSchema.parse(data);
}

export async function getStagingLabel(label: string): Promise<StagingLabelDetail> {
  const { data } = await apiClient.get(`/staging/labels/${label}`);
  return stagingLabelDetailSchema.parse(data);
}

export async function updateStagingLesson(lessonId: number, body: { title: string }): Promise<void> {
  await apiClient.patch(`/staging/lessons/${lessonId}`, body);
}

export async function updateStagingProblem(
  problemId: number,
  body: { instruction?: string; content?: string },
): Promise<void> {
  await apiClient.patch(`/staging/problems/${problemId}`, body);
}

export async function updateStagingOption(
  optionId: number,
  body: { content?: string; explanation?: string; isAnswer?: boolean },
): Promise<void> {
  await apiClient.patch(`/staging/options/${optionId}`, body);
}

export async function updateStagingAnswer(
  answerId: number,
  body: { content?: string; explanation?: string },
): Promise<void> {
  await apiClient.patch(`/staging/answers/${answerId}`, body);
}

/**
 * PATCH /staging/labels/{label}/status — 라벨 promote (03 §8-7). PENDING→COMPLETED.
 * ⚠️ 가장 위험·비가역(prod INSERT). 실제 실행은 사람 위임 — 코드 구조만(StrictMatch 게이트 경유).
 */
export async function promoteStagingLabel(label: string): Promise<void> {
  await apiClient.patch(`/staging/labels/${label}/status`, { status: 'COMPLETED' });
}
