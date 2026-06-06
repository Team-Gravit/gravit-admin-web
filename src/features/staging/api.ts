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
