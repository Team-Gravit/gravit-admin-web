import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Pencil } from 'lucide-react';
import { ROUTES } from '@/shared/constants/routes';
import { useSetBreadcrumb } from '@/shared/hooks/useBreadcrumb';
import { Button } from '@/shared/components/ui/button';
import { ErrorState } from '@/shared/components/states/ErrorState';
import { LoadingSkeleton } from '@/shared/components/states/LoadingSkeleton';
import { DataTable, type Column } from '@/shared/components/data-table/DataTable';
import { PaginationControl } from '@/shared/components/data-table/PaginationControl';
import { useChapter, useChapterStats, useChapterUnits } from '@/features/chapters/queries';
import { ChapterEditForm } from '@/features/chapters/components/ChapterEditForm';
import { ChapterStatsWidget } from '@/features/chapters/components/ChapterStatsWidget';
import type { ChapterUnitItem } from '@/features/chapters/schemas';

/**
 * CHAPTER_DETAIL (DS-02 §11, 01 §6-5-2, 03 §7-2/§7-3/§7-5). 정보 + 풀이 현황 위젯 + 유닛 목록.
 * B 패턴 편집: [편집] → 정보 카드만 편집 폼으로 전환(풀이현황·유닛 목록은 유지) → 저장/취소.
 * Breadcrumb(학습 컨텐츠 > {chapterTitle}): 전역 Header 로 발행(04 §8-3).
 */
export function ChapterDetailPage() {
  const { chapterId } = useParams();
  const id = Number(chapterId);
  const navigate = useNavigate();
  const { data: chapter, isLoading, isError, refetch } = useChapter(id);
  const stats = useChapterStats(id);
  const [page, setPage] = useState(1);
  const units = useChapterUnits(id, page);
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  // breadcrumb (04 §8-3-1): 학습 컨텐츠 > {chapterTitle}.
  useSetBreadcrumb([
    { label: '학습 컨텐츠', href: ROUTES.CHAPTERS },
    ...(chapter ? [{ label: chapter.title }] : []),
  ]);

  if (isLoading) return <LoadingSkeleton />;
  if (isError || !chapter) return <ErrorState onRetry={() => refetch()} />;

  const columns: Array<Column<ChapterUnitItem>> = [
    {
      key: 'title',
      header: '제목',
      headerClassName: 'w-80',
      className: 'w-80',
      cell: (unit) => <span className="line-clamp-1 font-medium text-foreground">{unit.title}</span>,
    },
    {
      key: 'description',
      header: '설명',
      cell: (unit) => <span className="line-clamp-1 text-fg-secondary">{unit.description}</span>,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {mode === 'edit' ? (
        <ChapterEditForm
          chapter={chapter}
          onCancel={() => setMode('view')}
          onSaved={() => setMode('view')}
        />
      ) : (
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-h1 text-foreground">{chapter.title}</h1>
            {chapter.description && <p className="text-body text-fg-muted">{chapter.description}</p>}
          </div>
          <Button variant="ghost" onClick={() => setMode('edit')}>
            <Pencil />
            편집
          </Button>
        </div>
      )}

      <ChapterStatsWidget
        stats={stats.data}
        isLoading={stats.isLoading}
        isError={stats.isError}
        onRetry={() => stats.refetch()}
      />

      <section className="flex flex-col gap-4">
        <h3 className="text-h3 text-foreground">유닛 (총 {chapter.unitCount}개)</h3>
        <DataTable
          columns={columns}
          data={units.data?.content ?? []}
          rowKey={(unit) => unit.unitId}
          isLoading={units.isLoading}
          isError={units.isError}
          onRetry={() => units.refetch()}
          emptyMessage="유닛이 없습니다."
          onRowClick={(unit) => navigate(ROUTES.UNIT_DETAIL(unit.unitId))}
        />
        {units.data && units.data.totalPages > 1 && (
          <PaginationControl
            page={page}
            totalPages={units.data.totalPages}
            onPageChange={setPage}
          />
        )}
      </section>
    </div>
  );
}
