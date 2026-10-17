import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { formatDateTime } from '@/shared/lib/formatDate';
import { Button } from '@/shared/components/ui/button';
import { StatusBadge } from '@/shared/components/status-badge/StatusBadge';
import { ConfirmModal } from '@/shared/components/modals/ConfirmModal';
import { EmptyState } from '@/shared/components/states/EmptyState';
import { ErrorState } from '@/shared/components/states/ErrorState';
import { LoadingSkeleton } from '@/shared/components/states/LoadingSkeleton';
import { BaselineCard } from '@/features/qa/components/BaselineCard';
import { QaNotice } from '@/features/qa/components/QaNotice';
import { SetupJobSteps } from '@/features/qa/components/SetupJobSteps';
import { useCancelJob, useIsStartingSetupJob, useStartSetupJob } from '@/features/qa/mutations';
import { isJobActive, useSetupJob } from '@/features/qa/queries';
import { CONFIRM_COPY, NOTICE_COPY } from '@/features/qa/copy';
import { qaErrorView } from '@/features/qa/errorView';
import { JOB_STATUS_BADGE_VARIANT, JOB_STATUS_LABELS } from '@/features/qa/labels';
import type { Job, Sprint } from '@/features/qa/schemas';

/**
 * 준비 화면 본문 (QA_SPEC B-2): 기준점 카드 + 작업 카드 + 상태별 버튼.
 * 버튼 규칙: DRAFT [QA 준비하기] / PREPARE_FAILED [다시 준비하기] / REVIEW [다시 준비하기](확인 모달) /
 * 작업 QUEUED·RUNNING [작업 취소](확인 모달) / IN_PROGRESS·CLOSED 버튼 없음 + SETUP_LOCKED.
 */
export function SetupPanel({ sprint }: { sprint: Sprint }) {
  const jobQuery = useSetupJob(sprint.id, sprint.latestSetupJobId);
  const job = jobQuery.data;
  const active = isJobActive(job?.status);
  const locked = sprint.status === 'IN_PROGRESS' || sprint.status === 'CLOSED';

  return (
    <div className="flex flex-col gap-6">
      {locked && <QaNotice>{NOTICE_COPY.SETUP_LOCKED}</QaNotice>}

      <BaselineCard baseline={sprint.baseline} />

      <section className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-h3 text-foreground">준비 작업</h3>
          {!locked && <SetupActions sprint={sprint} job={job ?? null} active={active} />}
        </div>

        {sprint.latestSetupJobId === null ? (
          <EmptyState className="py-8" message={NOTICE_COPY.NO_JOB} />
        ) : jobQuery.isLoading ? (
          <LoadingSkeleton rows={4} />
        ) : jobQuery.isError || !job ? (
          <JobError error={jobQuery.error} onRetry={() => jobQuery.refetch()} />
        ) : (
          <JobBody job={job} active={active} />
        )}
      </section>

      {/* lastError 는 카드 아래 실패 톤 박스로 원문 표시 (B-2) */}
      {job?.lastError && !jobQuery.isError && (
        <pre className="whitespace-pre-wrap break-all rounded-md bg-danger-bg px-4 py-3 font-mono text-caption text-danger-text">
          {job.lastError}
        </pre>
      )}
    </div>
  );
}

function JobError({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const view = qaErrorView(error);
  return <ErrorState message={view.message} onRetry={view.retryable ? onRetry : undefined} />;
}

function JobBody({ job, active }: { job: Job; active: boolean }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-fg-secondary">
        <StatusBadge variant={JOB_STATUS_BADGE_VARIANT[job.status]}>
          {JOB_STATUS_LABELS[job.status]}
        </StatusBadge>
        <span>
          시도 {job.attempt}/{job.maxAttempts}
        </span>
        <span>시작 {formatDateTime(job.createdAt)}</span>
        {job.finishedAt && <span>종료 {formatDateTime(job.finishedAt)}</span>}
      </div>

      {job.status === 'QUEUED' && job.nextRunAt && (
        <QaNotice>{NOTICE_COPY.RETRY_WAIT(formatDateTime(job.nextRunAt))}</QaNotice>
      )}
      {active && <QaNotice>{NOTICE_COPY.SETUP_DURATION}</QaNotice>}

      <SetupJobSteps steps={job.steps} />
    </div>
  );
}

function SetupActions({
  sprint,
  job,
  active,
}: {
  sprint: Sprint;
  job: Job | null;
  active: boolean;
}) {
  const [confirm, setConfirm] = useState<'RE_SETUP' | 'CANCEL_JOB' | null>(null);
  const startSetup = useStartSetupJob(sprint.id);
  const starting = useIsStartingSetupJob(sprint.id);
  const cancel = useCancelJob(job?.id ?? -1);

  const start = () =>
    startSetup.mutate(undefined, {
      onSettled: () => setConfirm(null),
    });

  if (active && job) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          disabled={job.cancelRequested || cancel.isPending}
          onClick={() => setConfirm('CANCEL_JOB')}
        >
          작업 취소
        </Button>
        <ConfirmModal
          open={confirm === 'CANCEL_JOB'}
          onOpenChange={(open) => !open && setConfirm(null)}
          {...CONFIRM_COPY.CANCEL_JOB}
          variant="destructive"
          loading={cancel.isPending}
          onConfirm={() => cancel.mutate(undefined, { onSettled: () => setConfirm(null) })}
        />
      </>
    );
  }

  // 배너의 [QA 준비하기]가 진행 중이어도 막는다(같은 mutationKey).
  const pending = starting;
  if (sprint.status === 'DRAFT' || sprint.status === 'PREPARE_FAILED') {
    return (
      <Button size="sm" disabled={pending} onClick={start}>
        {pending && <Loader2 className="animate-spin" />}
        {sprint.status === 'DRAFT' ? 'QA 준비하기' : '다시 준비하기'}
      </Button>
    );
  }

  if (sprint.status === 'REVIEW') {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => setConfirm('RE_SETUP')}
        >
          다시 준비하기
        </Button>
        <ConfirmModal
          open={confirm === 'RE_SETUP'}
          onOpenChange={(open) => !open && setConfirm(null)}
          {...CONFIRM_COPY.RE_SETUP}
          loading={pending}
          onConfirm={start}
        />
      </>
    );
  }

  return null;
}
