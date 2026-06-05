import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ROUTES } from '@/shared/constants/routes';
import { formatDateTime } from '@/shared/lib/formatDate';
import { reportTypeLabels } from '@/shared/constants/labels';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { DataTable, type Column } from '@/shared/components/data-table/DataTable';
import { PaginationControl } from '@/shared/components/data-table/PaginationControl';
import type { ReportType } from '@/shared/constants/enums';
import { useReports } from '@/features/reports/queries';
import { ReportStatusBadge } from '@/features/reports/components/ReportStatusBadge';
import type { ReportListItem } from '@/features/reports/schemas';

type TypeFilter = ReportType | 'ALL';
type ResolvedFilter = 'ALL' | 'false' | 'true';

/**
 * REPORT_LIST (DS-02 §8, 03 §6-1, 04 §2-2). 필터 2종(유형 + 처리상태, 기본 미해결).
 * 행클릭→/reports/:id. 문제ID=별도 링크(stopPropagation→문제상세, 04 §10-7). 유형=텍스트, 상태=Badge.
 */
export function ReportListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
  const [resolvedFilter, setResolvedFilter] = useState<ResolvedFilter>('false');

  const { data, isLoading, isError, refetch } = useReports({
    page,
    reportType: typeFilter === 'ALL' ? undefined : typeFilter,
    isResolved: resolvedFilter === 'ALL' ? undefined : resolvedFilter === 'true',
  });

  const handleTypeChange = (value: string) => {
    setTypeFilter(value as TypeFilter);
    setPage(1);
  };
  const handleResolvedChange = (value: string) => {
    setResolvedFilter(value as ResolvedFilter);
    setPage(1);
  };

  const columns: Array<Column<ReportListItem>> = [
    {
      key: 'reportId',
      header: 'ID',
      headerClassName: 'w-20',
      className: 'w-20',
      cell: (report) => `#${report.reportId}`,
    },
    {
      key: 'reportType',
      header: '유형',
      headerClassName: 'w-40',
      className: 'w-40',
      cell: (report) => reportTypeLabels[report.reportType],
    },
    {
      key: 'problemId',
      header: '문제ID',
      headerClassName: 'w-28',
      className: 'w-28',
      cell: (report) => (
        <button
          type="button"
          className="text-primary hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            navigate(ROUTES.PROBLEM_DETAIL(report.problemId));
          }}
        >
          P-{report.problemId}
        </button>
      ),
    },
    {
      key: 'status',
      header: '상태',
      headerClassName: 'w-28',
      className: 'w-28',
      cell: (report) => <ReportStatusBadge isResolved={report.isResolved} />,
    },
    {
      key: 'submittedAt',
      header: '제출일',
      headerClassName: 'w-40',
      className: 'w-40',
      cell: (report) => formatDateTime(report.submittedAt),
    },
  ];

  const isFiltered = typeFilter !== 'ALL' || resolvedFilter !== 'ALL';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-h1 text-foreground">신고 관리</h1>
        <p className="text-body text-fg-muted">유저가 제출한 문제 신고를 처리합니다.</p>
      </div>

      <div className="flex items-center gap-3">
        <Select value={typeFilter} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="유형" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">유형 전체</SelectItem>
            <SelectItem value="TYPO_ERROR">{reportTypeLabels.TYPO_ERROR}</SelectItem>
            <SelectItem value="CONTENT_ERROR">{reportTypeLabels.CONTENT_ERROR}</SelectItem>
            <SelectItem value="ANSWER_ERROR">{reportTypeLabels.ANSWER_ERROR}</SelectItem>
            <SelectItem value="OTHER_ERROR">{reportTypeLabels.OTHER_ERROR}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={resolvedFilter} onValueChange={handleResolvedChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="처리상태" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">처리상태 전체</SelectItem>
            <SelectItem value="false">미해결</SelectItem>
            <SelectItem value="true">해결됨</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={data?.content ?? []}
        rowKey={(report) => report.reportId}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        emptyMessage={isFiltered ? '조건에 맞는 신고가 없습니다.' : '신고가 없습니다.'}
        onRowClick={(report) => navigate(ROUTES.REPORT_DETAIL(report.reportId))}
      />

      {data && data.totalPages > 1 && (
        <PaginationControl page={page} totalPages={data.totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
