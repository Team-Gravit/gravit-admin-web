import { apiClient } from '@/shared/api/client';
import {
  unitDetailSchema,
  unitLessonListResponseSchema,
  type UnitDetail,
  type UnitLessonListResponse,
} from '@/features/units/schemas';

/** GET /units/{unitId} — 유닛 상세 (03 §7-6). */
export async function getUnit(unitId: number): Promise<UnitDetail> {
  const { data } = await apiClient.get(`/units/${unitId}`);
  return unitDetailSchema.parse(data);
}

/** GET /units/{unitId}/lessons?page=n — 레슨 목록 (03 §7-8). 페이지 크기 20 고정(서버). */
export async function getUnitLessons(
  unitId: number,
  page: number,
): Promise<UnitLessonListResponse> {
  const { data } = await apiClient.get(`/units/${unitId}/lessons`, { params: { page } });
  return unitLessonListResponseSchema.parse(data);
}

/** PATCH /units/{unitId} 본문 (03 §7-7). title/description. */
export interface UpdateUnitBody {
  title: string;
  description: string;
}

/** PATCH /units/{unitId} — 유닛 수정 (03 §7-7). */
export async function updateUnit(unitId: number, body: UpdateUnitBody): Promise<void> {
  await apiClient.patch(`/units/${unitId}`, body);
}
