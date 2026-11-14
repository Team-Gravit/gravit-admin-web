import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ROUTES } from '@/shared/constants/routes';
import { DataTable, type Column } from '@/shared/components/data-table/DataTable';
import { PaginationControl } from '@/shared/components/data-table/PaginationControl';
import { useChapters } from '@/features/chapters/queries';
import type { ChapterListItem } from '@/features/chapters/schemas';

export function ChapterListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useChapters(page);

  const columns: Array<Column<ChapterListItem>> = [
    {
      key: 'title',
      header: '제목',
      headerClassName: 'w-80',
      className: 'w-80',
      cell: (chapter) => <span className="line-clamp-1 font-medium text-foreground">{chapter.title}</span>,
    },
    {
      key: 'description',
      header: '설명',
      cell: (chapter) => <span className="line-clamp-1 text-fg-secondary">{chapter.description}</span>,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex min-h-16 flex-col gap-1">
        <h1 className="text-h1 text-foreground">컨텐츠 관리</h1>
      </div>

      <DataTable
        columns={columns}
        data={data?.contents ?? []}
        rowKey={(chapter) => chapter.chapterId}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        emptyMessage="챕터가 없어요."
        onRowClick={(chapter) => navigate(ROUTES.CHAPTER_DETAIL(chapter.chapterId))}
      />

      {data && data.totalPages > 1 && (
        <PaginationControl page={page} totalPages={data.totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
