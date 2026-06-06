import { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { ROUTES } from '@/shared/constants/routes';
import { cn } from '@/shared/lib/cn';
import { formatDate } from '@/shared/lib/formatDate';
import { Button } from '@/shared/components/ui/button';
import { ErrorState } from '@/shared/components/states/ErrorState';
import { LoadingSkeleton } from '@/shared/components/states/LoadingSkeleton';
import { ProblemTypeBadge } from '@/shared/components/status-badge/ProblemTypeBadge';
import { StrictMatchModal } from '@/shared/components/modals/StrictMatchModal';
import { UnsavedChangesModal } from '@/shared/components/modals/UnsavedChangesModal';
import { useUnsavedChangesGuard } from '@/shared/hooks/useUnsavedChangesGuard';
import { useSetBreadcrumb } from '@/shared/hooks/useBreadcrumb';
import { dashboardKeys } from '@/features/dashboard/queries';
import { StagingStatusBadge } from '@/features/staging/components/StagingStatusBadge';
import { StagingLessonForm } from '@/features/staging/components/StagingLessonForm';
import { StagingObjectiveForm } from '@/features/staging/components/StagingObjectiveForm';
import { StagingSubjectiveForm } from '@/features/staging/components/StagingSubjectiveForm';
import { useStagingLabel } from '@/features/staging/queries';
import { usePromoteStagingLabel } from '@/features/staging/mutations';

/** 활성 항목: 레슨 1 또는 문제(problems 배열 index). */
type ActiveItem = { type: 'lesson' } | { type: 'problem'; index: number };

/** 미저장 변경 표시 점 (DS-02 §16-3, Primary). */
function DirtyDot() {
  return <span className="size-2 shrink-0 rounded-full bg-primary" aria-label="미저장 변경" />;
}

/** COMPLETED 안내 배너 (DS-02 §16-2, Banner Success). */
function CompletedBanner() {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-success-bg px-4 py-3 text-success-text">
      <CheckCircle2 className="size-4 shrink-0" />
      <span className="text-body">
        이 라벨은 prod에 반영 완료되었습니다. 더 이상 수정할 수 없습니다.
      </span>
    </div>
  );
}

/**
 * STAGING_DETAIL (DS-02 §16, 04 §10-2, 03 §8-2). 헤더 + 좌측 280px 항목 리스트(레슨 1 + 문제 6) + 우측 항목별 편집 폼.
 * 항목별 독립 form(항상 mount + hidden, 미저장 보존) · 변경표시(●/4px) · 변경 필드만 다중 PATCH(allSettled, 부분실패) ·
 * promote(StrictMatch, 비가역=사람) · COMPLETED read-only · 미저장 이탈 보호(beforeunload+useBlocker).
 * Breadcrumb(스테이징 > {label}): 전역 Header 로 발행(04 §8-3).
 */
export function StagingDetailPage() {
  const { label = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useStagingLabel(label);
  const [active, setActive] = useState<ActiveItem>({ type: 'lesson' });
  // 항목별 dirty 상태 lift-up — 좌측 리스트 ● 표시(04 §10-2-4).
  const [dirtyMap, setDirtyMap] = useState<Record<string, boolean>>({});
  const setItemDirty = useCallback((key: string, dirty: boolean) => {
    setDirtyMap((prev) => (prev[key] === dirty ? prev : { ...prev, [key]: dirty }));
  }, []);
  const [promoteOpen, setPromoteOpen] = useState(false);
  const promote = usePromoteStagingLabel(label);

  // breadcrumb (04 §8-3-1): 스테이징 > {label}.
  useSetBreadcrumb([{ label: '스테이징', href: ROUTES.STAGING_LABELS }, { label }]);

  const readOnly = data?.status === 'COMPLETED'; // 04 §10-2-9
  const unsavedCount = Object.values(dirtyMap).filter(Boolean).length;
  const hasUnsaved = unsavedCount > 0;
  // 미저장 항목 1개 이상 시 이탈 보호(04 §11-7 6-9). COMPLETED 는 변경 불가라 미작동.
  const blocker = useUnsavedChangesGuard(hasUnsaved && !readOnly);

  if (isLoading) return <LoadingSkeleton />;
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />;

  // ⚠️ promote 비가역(03 §8-7, prod INSERT). StrictMatch 게이트 통과 후에만 실행. 04 §10-2-8 흐름.
  const handlePromote = () => {
    promote.mutate(undefined, {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: dashboardKeys.summary() });
        toast.success('라벨이 반영되었습니다.');
        navigate(ROUTES.STAGING_LABELS);
      },
      onError: () => {
        setPromoteOpen(false);
        toast.error('반영에 실패했습니다. 잠시 후 다시 시도해주세요.');
      },
    });
  };

  const itemClass = (isActive: boolean) =>
    cn(
      'flex w-full items-center justify-between gap-2 border-b border-l-3 border-border px-5 py-4 text-left text-body transition-colors',
      isActive
        ? 'border-l-primary bg-primary-subtle font-medium text-primary'
        : 'border-l-transparent text-foreground hover:bg-hover',
    );

  return (
    <div className="flex flex-col gap-6">
      {/* 헤더 (DS-02 §16-1). [반영 완료 처리]: PENDING 한정, 미저장 ● 있으면 비활성+툴팁(04 §10-2-6). COMPLETED 숨김은 6-8. */}
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <StagingStatusBadge status={data.status} />
            <h1 className="font-mono text-h1 text-foreground">{data.label}</h1>
          </div>
          {data.status === 'PENDING' && (
            <span title={hasUnsaved ? `저장하지 않은 항목이 있습니다 (${unsavedCount}건)` : undefined}>
              <Button
                variant="destructive"
                disabled={hasUnsaved}
                onClick={() => setPromoteOpen(true)}
              >
                반영 완료 처리
              </Button>
            </span>
          )}
        </div>
        <p className="text-caption text-fg-muted">
          U-{data.unitId} · {data.description} · 생성일 {formatDate(data.createdAt)}
        </p>
      </div>

      {/* COMPLETED 안내 배너 (DS-02 §16-2, 04 §10-2-9). */}
      {readOnly && <CompletedBanner />}

      {/* 좌측 리스트 + 우측 편집 영역 (DS-02 §16-3/§16-4) */}
      <div className="flex overflow-hidden rounded-lg border border-border bg-surface">
        <nav className="w-72 shrink-0 border-r border-border" aria-label="스테이징 항목">
          <button
            type="button"
            className={itemClass(active.type === 'lesson')}
            onClick={() => setActive({ type: 'lesson' })}
          >
            <span>레슨</span>
            {!readOnly && dirtyMap.lesson && <DirtyDot />}
          </button>
          {data.problems.map((problem, index) => (
            <button
              type="button"
              key={problem.problemId}
              className={itemClass(active.type === 'problem' && active.index === index)}
              onClick={() => setActive({ type: 'problem', index })}
            >
              <span>문제 {index + 1}</span>
              <span className="flex items-center gap-2">
                <ProblemTypeBadge problemType={problem.problemType} />
                {!readOnly && dirtyMap[`problem-${problem.problemId}`] && <DirtyDot />}
              </span>
            </button>
          ))}
        </nav>

        <div className="flex-1 p-6">
          {/* 레슨 폼 — 항상 mount, 비활성 시 hidden(미저장 입력 보존, 04 §10-2-3). */}
          <StagingLessonForm
            lesson={data.lesson}
            label={data.label}
            hidden={active.type !== 'lesson'}
            onDirtyChange={(dirty) => setItemDirty('lesson', dirty)}
            readOnly={readOnly}
          />
          {/* 문제 폼: 객관식=StagingObjectiveForm(6-3), 주관식=StagingSubjectiveForm(6-4). 항상 mount+hidden. */}
          {data.problems.map((problem, index) => {
            const isActiveItem = active.type === 'problem' && active.index === index;
            const onDirtyChange = (dirty: boolean) =>
              setItemDirty(`problem-${problem.problemId}`, dirty);
            return problem.problemType === 'OBJECTIVE' ? (
              <StagingObjectiveForm
                key={problem.problemId}
                problem={problem}
                problemNumber={index + 1}
                label={data.label}
                hidden={!isActiveItem}
                onDirtyChange={onDirtyChange}
                readOnly={readOnly}
              />
            ) : (
              <StagingSubjectiveForm
                key={problem.problemId}
                problem={problem}
                problemNumber={index + 1}
                label={data.label}
                hidden={!isActiveItem}
                onDirtyChange={onDirtyChange}
                readOnly={readOnly}
              />
            );
          })}
        </div>
      </div>

      {/* promote Strict Match Modal (DS-01 §5-6 480px, 03 §8-7). 비가역 — 라벨명 정확 입력 시에만 [반영]. */}
      <StrictMatchModal
        open={promoteOpen}
        onOpenChange={setPromoteOpen}
        label={data.label}
        description="이 작업은 되돌릴 수 없습니다. 라벨의 레슨·문제가 운영(prod)에 반영됩니다."
        loading={promote.isPending}
        onConfirm={handlePromote}
      />

      {/* 미저장 항목 이탈 보호 (04 §11-7 6-9): beforeunload + useBlocker. */}
      {blocker.state === 'blocked' && (
        <UnsavedChangesModal
          open
          message={`저장하지 않은 항목이 ${unsavedCount}건 있습니다. 페이지를 나가시겠습니까?`}
          onConfirm={() => blocker.proceed()}
          onCancel={() => blocker.reset()}
        />
      )}
    </div>
  );
}
