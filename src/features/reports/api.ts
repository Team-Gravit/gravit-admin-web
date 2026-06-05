import { apiClient } from '@/shared/api/client';
import type { ReportType } from '@/shared/constants/enums';
import {
  reportDetailSchema,
  reportListResponseSchema,
  type ReportDetail,
  type ReportListResponse,
} from '@/features/reports/schemas';

/** 신고 목록 필터 (03 §6-1). 클라이언트 기본 진입은 isResolved=false(미해결). */
export interface ReportListFilters {
  page: number;
  reportType?: ReportType;
  isResolved?: boolean;
}

/** GET /reports?page&reportType&isResolved — 신고 목록 (03 §6-1). */
export async function getReports(filters: ReportListFilters): Promise<ReportListResponse> {
  const params: Record<string, string | number | boolean> = { page: filters.page };
  if (filters.reportType) params.reportType = filters.reportType;
  if (filters.isResolved !== undefined) params.isResolved = filters.isResolved;
  const { data } = await apiClient.get('/reports', { params });
  return reportListResponseSchema.parse(data);
}

/** GET /reports/{id} — 신고 상세 (03 §6-2). */
export async function getReport(reportId: number): Promise<ReportDetail> {
  const { data } = await apiClient.get(`/reports/${reportId}`);
  return reportDetailSchema.parse(data);
}

/** PATCH /reports/{id}/status — 처리 상태 변경 (03 §6-3). */
export async function updateReportStatus(reportId: number, isResolved: boolean): Promise<void> {
  await apiClient.patch(`/reports/${reportId}/status`, { isResolved });
}
