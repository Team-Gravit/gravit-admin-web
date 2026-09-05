import { useQuery } from '@tanstack/react-query';
import {
  getDashboardSummary,
  getDailyActiveUsers,
  getMonthlyActiveUsers,
} from '@/features/dashboard/api';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  summary: () => [...dashboardKeys.all, 'summary'] as const,
  dailyActiveUsers: () => [...dashboardKeys.all, 'active-users', 'daily'] as const,
  monthlyActiveUsers: () => [...dashboardKeys.all, 'active-users', 'monthly'] as const,
};

export function useDashboardSummary() {
  return useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: getDashboardSummary,
  });
}

export function useDailyActiveUsers() {
  return useQuery({
    queryKey: dashboardKeys.dailyActiveUsers(),
    queryFn: getDailyActiveUsers,
  });
}

export function useMonthlyActiveUsers() {
  return useQuery({
    queryKey: dashboardKeys.monthlyActiveUsers(),
    queryFn: getMonthlyActiveUsers,
  });
}
