import { apiClient } from '@/shared/api/client';
import { dashboardSummarySchema, type DashboardSummary } from '@/features/dashboard/schemas';

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await apiClient.get('/dashboard/summary');
  return dashboardSummarySchema.parse(data);
}
