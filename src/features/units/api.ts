import { apiClient } from '@/shared/api/client';
import {
  unitDetailSchema,
  unitLessonListResponseSchema,
  type UnitDetail,
  type UnitLessonListResponse,
} from '@/features/units/schemas';

export async function getUnit(unitId: number): Promise<UnitDetail> {
  const { data } = await apiClient.get(`/units/${unitId}`);
  return unitDetailSchema.parse(data);
}

export async function getUnitLessons(
  unitId: number,
  page: number,
): Promise<UnitLessonListResponse> {
  const { data } = await apiClient.get(`/units/${unitId}/lessons`, { params: { page } });
  return unitLessonListResponseSchema.parse(data);
}

export interface UpdateUnitBody {
  title: string;
  description: string;
}

export async function updateUnit(unitId: number, body: UpdateUnitBody): Promise<void> {
  await apiClient.patch(`/units/${unitId}`, body);
}
