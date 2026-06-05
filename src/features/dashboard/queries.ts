import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '@/features/dashboard/api';

/** 대시보드 queryKey 팩토리 (04 §9-1). promote 시 summary invalidate 대상. */
export const dashboardKeys = {
  all: ['dashboard'] as const,
  summary: () => [...dashboardKeys.all, 'summary'] as const,
};

/** 대시보드 요약 — 진입 시 1회 호출, 자동 갱신 없음(03 §4-1, 글로벌 refetchOnWindowFocus=false). */
export function useDashboardSummary() {
  return useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: getDashboardSummary,
  });
}
