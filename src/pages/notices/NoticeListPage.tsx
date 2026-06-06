import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Pin, Plus } from 'lucide-react';
import { ROUTES } from '@/shared/constants/routes';
import { formatDate } from '@/shared/lib/formatDate';
import { Button } from '@/shared/components/ui/button';
import { DataTable, type Column } from '@/shared/components/data-table/DataTable';
import { PaginationControl } from '@/shared/components/data-table/PaginationControl';
import { useNotices } from '@/features/notices/queries';
import { NoticeStatusBadge } from '@/features/notices/components/NoticeStatusBadge';
import type { NoticeListItem } from '@/features/notices/schemas';

/**
 * NOTICE_LIST (DS-02 §3, 01 §6-2-1, 03 §9-1). List Page: Page Header + DataTable + Pagination.
 * 검색·필터 없음(04 §2-2). 행 클릭→상세, [수정] stopPropagation(04 §10-7).
 * (Figma 8788:7557: 컬럼 '게시일'=publishedAt·실제 status 사용 — Figma 의 '생성일/예정'은 mockup.)
 */
export function NoticeListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useNotices(page);

  const columns: Array<Column<NoticeListItem>> = [
    {
      key: 'pinned',
      header: <Pin className="size-4 text-fg-muted" />,
      headerClassName: 'w-12',
      className: 'w-12',
      cell: (notice) => (notice.pinned ? <Pin className="size-4 text-primary" /> : null),
    },
    {
      key: 'title',
      header: '제목',
      cell: (notice) => <span className="line-clamp-1">{notice.title}</span>,
    },
    {
      key: 'status',
      header: '상태',
      headerClassName: 'w-28',
      className: 'w-28',
      cell: (notice) => <NoticeStatusBadge status={notice.status} />,
    },
    {
      key: 'publishedAt',
      header: '게시일',
      headerClassName: 'w-36',
      className: 'w-36',
      cell: (notice) =>
        notice.status === 'DRAFT' || !notice.publishedAt ? '-' : formatDate(notice.publishedAt),
    },
    {
      key: 'edit',
      header: '수정',
      headerClassName: 'w-20',
      className: 'w-20',
      cell: (notice) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(ROUTES.NOTICE_DETAIL(notice.noticeId));
          }}
        >
          수정
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-h1 text-foreground">공지 관리</h1>
          <p className="text-body text-fg-muted">공지를 등록하고 관리합니다.</p>
        </div>
        <Button onClick={() => navigate(ROUTES.NOTICE_NEW)}>
          <Plus />
          공지 작성
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.contents ?? []}
        rowKey={(notice) => notice.noticeId}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        emptyMessage="공지가 없습니다."
        onRowClick={(notice) => navigate(ROUTES.NOTICE_DETAIL(notice.noticeId))}
      />

      {data && data.totalPages > 1 && (
        <PaginationControl page={page} totalPages={data.totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
