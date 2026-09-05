import { apiClient } from '@/shared/api/client';
import {
  dashboardSummarySchema,
  dailyActiveUsersSchema,
  monthlyActiveUsersSchema,
  type DashboardSummary,
  type DailyActiveUsers,
  type MonthlyActiveUsers,
} from '@/features/dashboard/schemas';

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await apiClient.get('/dashboard/summary');
  return dashboardSummarySchema.parse(data);
}

// 파라미터 생략 = 서버 기본값 days=30 (D7 권장)
export async function getDailyActiveUsers(): Promise<DailyActiveUsers> {
  const { data } = await apiClient.get('/dashboard/active-users/daily');
  return dailyActiveUsersSchema.parse(data);
}

// 파라미터 생략 = 서버 기본값 months=12 (D7 권장)
export async function getMonthlyActiveUsers(): Promise<MonthlyActiveUsers> {
  const { data } = await apiClient.get('/dashboard/active-users/monthly');
  return monthlyActiveUsersSchema.parse(data);
}
