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

/**
 * PROBLEM_DETAIL (DS-02 §14, 01 §6-5-5, 03 §7-12/§7-13/§7-14). problemType 분기(객관식/주관식).
 * 헤더: [유형 배지] P-{id} + Ghost '편집'. 표시→ProblemView, 편집→유형별 폼(B 패턴).
 * 주관식은 D1(단일 콤마 정답), 객관식은 보기 4 고정·정답 1·전체 교체 PATCH.
 * Breadcrumb(…> {lesson} > P-{id}): 부모 lesson→unit→chapter 추가 GET 체인(04 §8-3-3).
 */
export function ProblemDetailPage() {
  const { problemId } = useParams();
  const id = Number(problemId);
  const { data: problem, isLoading, isError, refetch } = useProblem(id);
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  // breadcrumb (04 §8-3): 부모 레슨·유닛·챕터는 추가 GET 연쇄(§8-3-3).
  const lesson = useLesson(problem?.lessonId ?? NaN).data;
  const unit = useUnit(lesson?.unitId ?? NaN).data;
  const chapter = useChapter(unit?.chapterId ?? NaN).data;
  useSetBreadcrumb([
    { label: '학습 컨텐츠', href: ROUTES.CHAPTERS },
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
