import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getReport, getReports, type ReportListFilters } from '@/features/reports/api';

export const reportKeys = {
  all: ['reports'] as const,
  lists: () => [...reportKeys.all, 'list'] as const,
  list: (filters: ReportListFilters) => [...reportKeys.lists(), filters] as const,
  details: () => [...reportKeys.all, 'detail'] as const,
  detail: (reportId: number | string) => [...reportKeys.details(), reportId] as const,
};

export function useReports(filters: ReportListFilters) {
  return useQuery({
    queryKey: reportKeys.list(filters),
    queryFn: () => getReports(filters),
    placeholderData: keepPreviousData,
  });
}

export function useReport(reportId: number) {
  return useQuery({
    queryKey: reportKeys.detail(reportId),
    queryFn: () => getReport(reportId),
    enabled: Number.isFinite(reportId),
  });
}
