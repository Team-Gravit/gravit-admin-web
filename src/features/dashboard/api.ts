import { apiClient } from '@/shared/api/client';
import { dashboardSummarySchema, type DashboardSummary } from '@/features/dashboard/schemas';

/** GET /dashboard/summary — 대시보드 위젯 카운트 (03 §4-1). 응답은 Zod 파싱. */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await apiClient.get('/dashboard/summary');
  return dashboardSummarySchema.parse(data);
}
