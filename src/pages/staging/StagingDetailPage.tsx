import { useState } from 'react';
import { useParams } from 'react-router';
import { cn } from '@/shared/lib/cn';
import { formatDate } from '@/shared/lib/formatDate';
import { ErrorState } from '@/shared/components/states/ErrorState';
import { LoadingSkeleton } from '@/shared/components/states/LoadingSkeleton';
import { ProblemTypeBadge } from '@/shared/components/status-badge/ProblemTypeBadge';
import { StagingStatusBadge } from '@/features/staging/components/StagingStatusBadge';
import { StagingLessonForm } from '@/features/staging/components/StagingLessonForm';
import { useStagingLabel } from '@/features/staging/queries';

/** 활성 항목: 레슨 1 또는 문제(problems 배열 index). */
type ActiveItem = { type: 'lesson' } | { type: 'problem'; index: number };

/**
 * STAGING_DETAIL (DS-02 §16, 04 §10-2, 03 §8-2). 6-1: 데이터 페칭 + 좌측 리스트 골격.
 * 헤더(라벨명 mono + Status Badge + 메타) + 좌측 280px 리스트(레슨 1 + 문제 6) + 활성 항목 전환.
 * 우측 편집 폼은 6-2~6-4, 변경 표시 6-5, 다중 PATCH 6-6, promote 6-7, COMPLETED read-only 6-8, 이탈 보호 6-9.
 * Breadcrumb(스테이징 > {label})은 전역 Header handle 배선까지 이연 — 헤더 라벨명으로 대체.
 */
export function StagingDetailPage() {
  const { label = '' } = useParams();
  const { data, isLoading, isError, refetch } = useStagingLabel(label);
  const [active, setActive] = useState<ActiveItem>({ type: 'lesson' });

  if (isLoading) return <LoadingSkeleton />;
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />;

  const activeProblem = active.type === 'problem' ? data.problems[active.index] : undefined;

  const itemClass = (isActive: boolean) =>
    cn(
      'flex w-full items-center justify-between gap-2 border-b border-l-3 border-border px-5 py-4 text-left text-body transition-colors',
      isActive
        ? 'border-l-primary bg-primary-subtle font-medium text-primary'
        : 'border-l-transparent text-foreground hover:bg-hover',
    );

  return (
    <div className="flex flex-col gap-6">
      {/* 헤더 (DS-02 §16-1). [반영 완료 처리] 버튼은 6-7. */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <StagingStatusBadge status={data.status} />
          <h1 className="font-mono text-h1 text-foreground">{data.label}</h1>
        </div>
        <p className="text-caption text-fg-muted">
          U-{data.unitId} · {data.description} · 생성일 {formatDate(data.createdAt)}
        </p>
      </div>

      {/* 좌측 리스트 + 우측 편집 영역 (DS-02 §16-3/§16-4) */}
      <div className="flex overflow-hidden rounded-lg border border-border bg-surface">
        <nav className="w-72 shrink-0 border-r border-border" aria-label="스테이징 항목">
          <button
            type="button"
            className={itemClass(active.type === 'lesson')}
            onClick={() => setActive({ type: 'lesson' })}
          >
            레슨
          </button>
          {data.problems.map((problem, index) => (
            <button
              type="button"
              key={problem.problemId}
              className={itemClass(active.type === 'problem' && active.index === index)}
              onClick={() => setActive({ type: 'problem', index })}
            >
              <span>문제 {index + 1}</span>
              <ProblemTypeBadge problemType={problem.problemType} />
            </button>
          ))}
        </nav>

        <div className="flex-1 p-6">
          {/* 레슨 폼 — 항상 mount, 비활성 시 hidden(미저장 입력 보존, 04 §10-2-3). */}
          <StagingLessonForm
            lesson={data.lesson}
            label={data.label}
            hidden={active.type !== 'lesson'}
          />
          {/* 문제 폼은 6-3(객관식)/6-4(주관식). 현재는 활성 문제 헤더 placeholder. */}
          {active.type === 'problem' && activeProblem && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-h3 text-foreground">문제 {active.index + 1}</h3>
                <ProblemTypeBadge problemType={activeProblem.problemType} />
              </div>
              <p className="text-caption text-fg-muted">ID: {activeProblem.problemId}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
