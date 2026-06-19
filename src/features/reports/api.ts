import { apiClient } from '@/shared/api/client';
import type { ReportType } from '@/shared/constants/enums';
import {
  reportDetailSchema,
  reportListResponseSchema,
  type ReportDetail,
  type ReportListResponse,
} from '@/features/reports/schemas';

export interface ReportListFilters {
  page: number;
  reportType?: ReportType;
  isResolved?: boolean;
}

export async function getReports(filters: ReportListFilters): Promise<ReportListResponse> {
  const params: Record<string, string | number | boolean> = { page: filters.page };
  if (filters.reportType) params.reportType = filters.reportType;
  if (filters.isResolved !== undefined) params.isResolved = filters.isResolved;
  const { data } = await apiClient.get('/reports', { params });
  return reportListResponseSchema.parse(data);
}

export async function getReport(reportId: number): Promise<ReportDetail> {
  const { data } = await apiClient.get(`/reports/${reportId}`);
  return reportDetailSchema.parse(data);
}

export async function updateReportStatus(reportId: number, isResolved: boolean): Promise<void> {
  await apiClient.patch(`/reports/${reportId}/status`, { isResolved });
}
