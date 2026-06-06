import { apiClient } from '@/shared/api/client';
import type { StagingStatus } from '@/shared/constants/enums';
import {
  stagingLabelDetailSchema,
  stagingLabelListResponseSchema,
  type StagingLabelDetail,
  type StagingLabelListResponse,
} from '@/features/staging/schemas';

/**
 * GET /staging/labels?page&status — 스테이징 라벨 목록 (03 §8-1).
 * status 미지정 시 전체. 클라이언트 기본 진입은 PENDING.
 */
export async function getStagingLabels(
  page: number,
  status?: StagingStatus,
): Promise<StagingLabelListResponse> {
  const params: Record<string, string | number> = { page };
  if (status) params.status = status;
  const { data } = await apiClient.get('/staging/labels', { params });
  return stagingLabelListResponseSchema.parse(data);
}

/** GET /staging/labels/{label} — 라벨 상세 그루핑 (03 §8-2, 04 §10-2-1). 레슨 1 + 문제 6. */
export async function getStagingLabel(label: string): Promise<StagingLabelDetail> {
  const { data } = await apiClient.get(`/staging/labels/${label}`);
  return stagingLabelDetailSchema.parse(data);
}

/** PATCH /staging/lessons/{lessonId} — 스테이징 레슨 수정 (03 §8-3). title 만. 라벨 COMPLETED 시 409. */
export async function updateStagingLesson(lessonId: number, body: { title: string }): Promise<void> {
  await apiClient.patch(`/staging/lessons/${lessonId}`, body);
}

/** PATCH /staging/problems/{problemId} — 스테이징 문제 수정 (03 §8-4). 부분 업데이트(변경 필드만). */
export async function updateStagingProblem(
  problemId: number,
  body: { instruction?: string; content?: string },
): Promise<void> {
  await apiClient.patch(`/staging/problems/${problemId}`, body);
}

/** PATCH /staging/options/{optionId} — 스테이징 객관식 옵션 개별 수정 (03 §8-5). 부분 업데이트. */
export async function updateStagingOption(
  optionId: number,
  body: { content?: string; explanation?: string; isAnswer?: boolean },
): Promise<void> {
  await apiClient.patch(`/staging/options/${optionId}`, body);
}

/** PATCH /staging/answers/{answerId} — 스테이징 주관식 정답 개별 수정 (03 §8-6, D1 단일). content/explanation. */
export async function updateStagingAnswer(
  answerId: number,
  body: { content?: string; explanation?: string },
): Promise<void> {
  await apiClient.patch(`/staging/answers/${answerId}`, body);
}
