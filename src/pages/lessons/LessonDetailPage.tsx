import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Pencil } from 'lucide-react';
import { ROUTES } from '@/shared/constants/routes';
import { Button } from '@/shared/components/ui/button';
import { ErrorState } from '@/shared/components/states/ErrorState';
import { LoadingSkeleton } from '@/shared/components/states/LoadingSkeleton';
import { DataTable, type Column } from '@/shared/components/data-table/DataTable';
import { PaginationControl } from '@/shared/components/data-table/PaginationControl';
import { ProblemTypeBadge } from '@/shared/components/status-badge/ProblemTypeBadge';
import { useLesson, useLessonProblems } from '@/features/lessons/queries';
import { LessonEditForm } from '@/features/lessons/components/LessonEditForm';
import type { LessonProblemItem } from '@/features/lessons/schemas';

/**
 * LESSON_DETAIL (DS-02 §13, 01 §6-5-4, 03 §7-9/§7-11). 정보(제목) + 문제 목록.
 * B 패턴 편집: [편집] → 정보 카드만 편집 폼으로 전환(문제 목록은 유지) → 저장/취소. 레슨은 제목만 수정.
 * Breadcrumb(학습 컨텐츠 > 챕터 > 유닛 > 레슨)은 전역 Header handle 일괄 배선까지 이연 — 페이지 h1 제목으로 대체.
 */
export function LessonDetailPage() {
  const { lessonId } = useParams();
  const id = Number(lessonId);
  const navigate = useNavigate();
  const { data: lesson, isLoading, isError, refetch } = useLesson(id);
  const [page, setPage] = useState(1);
  const problems = useLessonProblems(id, page);
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  if (isLoading) return <LoadingSkeleton />;
  if (isError || !lesson) return <ErrorState onRetry={() => refetch()} />;

  const columns: Array<Column<LessonProblemItem>> = [
    {
      key: 'problemId',
      header: 'ID',
      headerClassName: 'w-24',
      className: 'w-24 font-medium text-foreground',
      cell: (problem) => `P-${problem.problemId}`,
    },
    {
      key: 'problemType',
      header: '유형',
      headerClassName: 'w-24',
      className: 'w-24',
      cell: (problem) => <ProblemTypeBadge problemType={problem.problemType} />,
    },
    {
      key: 'instruction',
      header: '지시문',
      cell: (problem) => (
        <span className="line-clamp-1 text-fg-secondary">{problem.instruction}</span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {mode === 'edit' ? (
        <LessonEditForm
          lesson={lesson}
          onCancel={() => setMode('view')}
          onSaved={() => setMode('view')}
        />
      ) : (
        <div className="flex items-start justify-between">
          <h1 className="text-h1 text-foreground">{lesson.title}</h1>
          <Button variant="ghost" onClick={() => setMode('edit')}>
            <Pencil />
            편집
          </Button>
        </div>
      )}

      <section className="flex flex-col gap-4">
        <h3 className="text-h3 text-foreground">문제 (총 {lesson.problemCount}개)</h3>
        <DataTable
          columns={columns}
          data={problems.data?.content ?? []}
          rowKey={(problem) => problem.problemId}
          isLoading={problems.isLoading}
          isError={problems.isError}
          onRetry={() => problems.refetch()}
          emptyMessage="문제가 없습니다."
          onRowClick={(problem) => navigate(ROUTES.PROBLEM_DETAIL(problem.problemId))}
        />
        {problems.data && problems.data.totalPages > 1 && (
          <PaginationControl
            page={page}
            totalPages={problems.data.totalPages}
            onPageChange={setPage}
          />
        )}
      </section>
    </div>
  );
}
