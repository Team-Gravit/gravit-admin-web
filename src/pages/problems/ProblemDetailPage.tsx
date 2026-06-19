import { useState } from 'react';
import { useParams } from 'react-router';
import { Pencil } from 'lucide-react';
import { ROUTES } from '@/shared/constants/routes';
import { useSetBreadcrumb } from '@/shared/hooks/useBreadcrumb';
import { Button } from '@/shared/components/ui/button';
import { ErrorState } from '@/shared/components/states/ErrorState';
import { LoadingSkeleton } from '@/shared/components/states/LoadingSkeleton';
import { ProblemTypeBadge } from '@/shared/components/status-badge/ProblemTypeBadge';
import { useChapter } from '@/features/chapters/queries';
import { useUnit } from '@/features/units/queries';
import { useLesson } from '@/features/lessons/queries';
import { useProblem } from '@/features/problems/queries';
import { ProblemView } from '@/features/problems/components/ProblemView';
import { ObjectiveProblemEditForm } from '@/features/problems/components/ObjectiveProblemEditForm';
import { SubjectiveProblemEditForm } from '@/features/problems/components/SubjectiveProblemEditForm';

export function ProblemDetailPage() {
  const { problemId } = useParams();
  const id = Number(problemId);
  const { data: problem, isLoading, isError, refetch } = useProblem(id);
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  const lesson = useLesson(problem?.lessonId ?? NaN).data;
  const unit = useUnit(lesson?.unitId ?? NaN).data;
  const chapter = useChapter(unit?.chapterId ?? NaN).data;
  useSetBreadcrumb([
    { label: '컨텐츠 관리', href: ROUTES.CHAPTERS },
    ...(chapter ? [{ label: chapter.title, href: ROUTES.CHAPTER_DETAIL(chapter.chapterId) }] : []),
    ...(unit ? [{ label: unit.title, href: ROUTES.UNIT_DETAIL(unit.unitId) }] : []),
    ...(lesson ? [{ label: lesson.title, href: ROUTES.LESSON_DETAIL(lesson.lessonId) }] : []),
    ...(problem ? [{ label: `P-${problem.problemId}` }] : []),
  ]);

  if (isLoading) return <LoadingSkeleton />;
  if (isError || !problem) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <ProblemTypeBadge problemType={problem.problemType} />
          <h1 className="text-h1 text-foreground">P-{problem.problemId}</h1>
        </div>
        {mode === 'view' && (
          <Button variant="ghost" onClick={() => setMode('edit')}>
            <Pencil />
            편집
          </Button>
        )}
      </div>

      {mode === 'view' ? (
        <ProblemView problem={problem} />
      ) : problem.problemType === 'OBJECTIVE' ? (
        <ObjectiveProblemEditForm
          problem={problem}
          onCancel={() => setMode('view')}
          onSaved={() => setMode('view')}
        />
      ) : (
        <SubjectiveProblemEditForm
          problem={problem}
          onCancel={() => setMode('view')}
          onSaved={() => setMode('view')}
        />
      )}
    </div>
  );
}
