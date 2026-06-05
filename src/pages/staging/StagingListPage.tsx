import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ROUTES } from '@/shared/constants/routes';
import { formatDate } from '@/shared/lib/formatDate';
import { DataTable, type Column } from '@/shared/components/data-table/DataTable';
import { PaginationControl } from '@/shared/components/data-table/PaginationControl';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import type { StagingStatus } from '@/shared/constants/enums';
import { useStagingLabels } from '@/features/staging/queries';
import { StagingStatusBadge } from '@/features/staging/components/StagingStatusBadge';
import type { StagingLabelListItem } from '@/features/staging/schemas';

type StatusFilter = StagingStatus | 'ALL';

/**
 * STAGING_LIST (DS-02, 01 §6-6-1, 03 §8-1). List Page + 상태 필터(기본 PENDING).
 * 필터 변경 → 즉시 refetch(새 queryKey) + 1페이지 리셋. 목록에서 promote 불가(상세만).
 */
export function StagingListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('PENDING');
  const status = statusFilter === 'ALL' ? undefined : statusFilter;
  const { data, isLoading, isError, refetch } = useStagingLabels(page, status);

  const columns: Array<Column<StagingLabelListItem>> = [
    {
      key: 'label',
      header: '라벨',
      headerClassName: 'w-48',
      className: 'w-48',
      cell: (item) => <span className="font-mono">{item.label}</span>,
    },
    {
      key: 'unit',
      header: '유닛',
      headerClassName: 'w-20',
      className: 'w-20',
      cell: (item) => `U-${item.unitId}`,
    },
    {
      key: 'description',
      header: '설명',
      cell: (item) => <span className="line-clamp-1">{item.description}</span>,
    },
    {
      key: 'status',
      header: '상태',
      headerClassName: 'w-28',
      className: 'w-28',
      cell: (item) => <StagingStatusBadge status={item.status} />,
    },
    {
      key: 'createdAt',
      header: '생성일',
      headerClassName: 'w-32',
      className: 'w-32',
      cell: (item) => formatDate(item.createdAt),
    },
  ];

  const handleFilterChange = (value: string) => {
    setStatusFilter(value as StatusFilter);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-h1 text-foreground">스테이징</h1>
        <p className="text-body text-fg-muted">자동 생성된 컨텐츠를 검수하고 운영에 반영합니다.</p>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-body text-fg-secondary">상태</span>
        <Select value={statusFilter} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">전체</SelectItem>
            <SelectItem value="PENDING">검수 대기</SelectItem>
            <SelectItem value="COMPLETED">반영 완료</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={data?.content ?? []}
        rowKey={(item) => item.label}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        emptyMessage={statusFilter === 'ALL' ? '라벨이 없습니다.' : '조건에 맞는 라벨이 없습니다.'}
        onRowClick={(item) => navigate(ROUTES.STAGING_LABEL_DETAIL(item.label))}
      />

      {data && data.totalPages > 1 && (
        <PaginationControl page={page} totalPages={data.totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
