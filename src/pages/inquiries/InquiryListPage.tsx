import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ROUTES } from '@/shared/constants/routes';
import { formatDateTime } from '@/shared/lib/formatDate';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { DataTable, type Column } from '@/shared/components/data-table/DataTable';
import { PaginationControl } from '@/shared/components/data-table/PaginationControl';
import type { InquiryStatus } from '@/shared/constants/enums';
import { useInquiries } from '@/features/inquiries/queries';
import { InquiryStatusBadge } from '@/features/inquiries/components/InquiryStatusBadge';
import { InquiryTypeBadge } from '@/features/inquiries/components/InquiryTypeBadge';
import type { InquiryListItem } from '@/features/inquiries/schemas';

type StatusFilter = InquiryStatus | 'ALL';

/**
 * INQUIRY_LIST (inquiry-handoff A-2-1, B). status 필터만(키워드 검색 없음), 진입 기본 = PENDING(대기).
 * 컬럼: ID / 유형(badge) / 제목 / 작성자(닉네임, 탈퇴=null) / 상태(badge) / 작성일. 행클릭→상세.
 */
export function InquiryListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1); // ⚠️ 1-base (백오피스 공통)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('PENDING');

  const { data, isLoading, isError, refetch } = useInquiries({
    page,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
  });

  const handleStatusChange = (value: string) => {
    setStatusFilter(value as StatusFilter);
    setPage(1);
  };

  const columns: Array<Column<InquiryListItem>> = [
    {
      key: 'inquiryId',
      header: 'ID',
      headerClassName: 'w-20',
      className: 'w-20',
      cell: (inquiry) => `#${inquiry.inquiryId}`,
    },
    {
      key: 'type',
      header: '유형',
      headerClassName: 'w-32',
      className: 'w-32 whitespace-nowrap',
      cell: (inquiry) => <InquiryTypeBadge type={inquiry.type} />,
    },
    {
      key: 'title',
      header: '제목',
      cell: (inquiry) => <span className="line-clamp-1">{inquiry.title}</span>,
    },
    {
      key: 'submitter',
      header: '작성자',
      headerClassName: 'w-32',
      className: 'w-32',
      cell: (inquiry) =>
        inquiry.submitterNickname ?? <span className="text-fg-muted">(탈퇴한 사용자)</span>,
    },
    {
      key: 'status',
      header: '상태',
      headerClassName: 'w-28',
      className: 'w-28',
      cell: (inquiry) => <InquiryStatusBadge status={inquiry.status} />,
    },
    {
      key: 'createdAt',
      header: '작성일',
      headerClassName: 'w-40',
      className: 'w-40 whitespace-nowrap',
      cell: (inquiry) => formatDateTime(inquiry.createdAt),
    },
  ];

  const isFiltered = statusFilter !== 'ALL';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-h1 text-foreground">문의 관리</h1>
        <p className="text-body text-fg-muted">유저가 제출한 문의에 답변합니다.</p>
      </div>

      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="처리상태" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">처리상태 전체</SelectItem>
            <SelectItem value="PENDING">대기</SelectItem>
            <SelectItem value="RESOLVED">답변완료</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={data?.contents ?? []}
        rowKey={(inquiry) => inquiry.inquiryId}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        emptyMessage={isFiltered ? '조건에 맞는 문의가 없습니다.' : '문의가 없습니다.'}
        onRowClick={(inquiry) => navigate(ROUTES.INQUIRY_DETAIL(inquiry.inquiryId))}
      />

      {data && data.totalPages > 1 && (
        <PaginationControl page={page} totalPages={data.totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
