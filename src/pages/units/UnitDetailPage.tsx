import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Pencil } from 'lucide-react';
import { ROUTES } from '@/shared/constants/routes';
import { Button } from '@/shared/components/ui/button';
import { ErrorState } from '@/shared/components/states/ErrorState';
import { LoadingSkeleton } from '@/shared/components/states/LoadingSkeleton';
import { DataTable, type Column } from '@/shared/components/data-table/DataTable';
import { PaginationControl } from '@/shared/components/data-table/PaginationControl';
import { useUnit, useUnitLessons } from '@/features/units/queries';
import { UnitEditForm } from '@/features/units/components/UnitEditForm';
import type { UnitLessonItem } from '@/features/units/schemas';

/**
 * UNIT_DETAIL (DS-02 §12, 01 §6-5-3, 03 §7-6/§7-8). 정보(제목·설명) + 레슨 목록.
 * B 패턴 편집: [편집] → 정보 카드만 편집 폼으로 전환(레슨 목록은 유지) → 저장/취소.
 * Breadcrumb(학습 컨텐츠 > 챕터 > 유닛)은 전역 Header handle 일괄 배선까지 이연 — 페이지 h1 제목으로 대체.
 */
export function UnitDetailPage() {
  const { unitId } = useParams();
  const id = Number(unitId);
  const navigate = useNavigate();
  const { data: unit, isLoading, isError, refetch } = useUnit(id);
  const [page, setPage] = useState(1);
  const lessons = useUnitLessons(id, page);
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  if (isLoading) return <LoadingSkeleton />;
  if (isError || !unit) return <ErrorState onRetry={() => refetch()} />;

  const columns: Array<Column<UnitLessonItem>> = [
    {
      key: 'title',
      header: '제목',
      cell: (lesson) => <span className="font-medium text-foreground">{lesson.title}</span>,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {mode === 'edit' ? (
        <UnitEditForm unit={unit} onCancel={() => setMode('view')} onSaved={() => setMode('view')} />
      ) : (
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-h1 text-foreground">{unit.title}</h1>
            {unit.description && <p className="text-body text-fg-muted">{unit.description}</p>}
          </div>
          <Button variant="ghost" onClick={() => setMode('edit')}>
            <Pencil />
            편집
          </Button>
        </div>
      )}

      <section className="flex flex-col gap-4">
        <h3 className="text-h3 text-foreground">레슨 (총 {unit.lessonCount}개)</h3>
        <DataTable
          columns={columns}
          data={lessons.data?.content ?? []}
          rowKey={(lesson) => lesson.lessonId}
          isLoading={lessons.isLoading}
          isError={lessons.isError}
          onRetry={() => lessons.refetch()}
          emptyMessage="레슨이 없습니다."
          onRowClick={(lesson) => navigate(ROUTES.LESSON_DETAIL(lesson.lessonId))}
        />
        {lessons.data && lessons.data.totalPages > 1 && (
          <PaginationControl
            page={page}
            totalPages={lessons.data.totalPages}
            onPageChange={setPage}
          />
        )}
      </section>
    </div>
  );
}
