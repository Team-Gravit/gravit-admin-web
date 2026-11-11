import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { QaConfirmModal } from '@/features/qa/components/QaConfirmModal';
import { QaNotice } from '@/features/qa/components/QaNotice';
import { ConnectionStatusCard } from '@/features/qa/components/ConnectionStatusCard';
import { ReflectionPanel } from '@/features/qa/components/ReflectionPanel';
import { SetupJobSteps } from '@/features/qa/components/SetupJobSteps';
import { hasRunningSetup } from '@/features/qa/queries';
import { useCancelJob, useStartSetupJob } from '@/features/qa/mutations';
import { NOTICE_COPY } from '@/features/qa/copy';
import type { Sprint } from '@/features/qa/schemas';

export function SetupPanel({ sprint }: { sprint: Sprint }) {
  const [confirm, setConfirm] = useState<'recollect' | 'cancel' | null>(null);
  const start = useStartSetupJob(sprint.id);
  const cancel = useCancelJob(sprint.id, sprint.latestJob?.id ?? -1);
  const waiting =
    sprint.pendingReflectionCount > 0 && sprint.setupSteps.some((s) => s.status === 'WAITING');
  const active = hasRunningSetup(sprint);
  const closed = sprint.status === 'CLOSED';
  const canStart =
    !closed && !active && (sprint.status === 'DRAFT' || sprint.latestJob?.status === 'FAILED');
  return (
    <div className="flex flex-col gap-6">
      <ConnectionStatusCard connections={sprint.connections} />
      <section
        aria-label="준비 작업"
        className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-h3 text-foreground">준비 작업</h2>
          <div className="flex gap-2">
            {!closed && active && (
              <Button
                variant="outline"
                size="sm"
                disabled={cancel.isPending || sprint.latestJob?.cancelRequested}
                onClick={() => setConfirm('cancel')}
              >
                작업 취소
              </Button>
            )}
            {!closed && waiting ? (
              <Button
                size="sm"
                variant="outline"
                disabled={start.isPending}
                onClick={() => setConfirm('recollect')}
              >
                다시 수집
              </Button>
            ) : canStart ? (
              <Button
                size="sm"
                disabled={start.isPending}
                aria-busy={start.isPending}
                onClick={() => start.mutate(sprint.version)}
              >
                {start.isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
                {sprint.latestJob?.status === 'FAILED' ? '다시 시도' : '시작'}
              </Button>
            ) : null}
          </div>
        </div>
        {active && <QaNotice>{NOTICE_COPY.SETUP_DURATION}</QaNotice>}
        {sprint.latestJob?.status === 'FAILED' && (
          <p role="alert" className="rounded-md bg-danger-bg px-4 py-3 text-body text-danger-text">
            {sprint.latestJob.lastError || '마지막 준비 작업에 실패했습니다.'}
          </p>
        )}
        <SetupJobSteps steps={sprint.setupSteps} />
      </section>
      <ReflectionPanel sprint={sprint} />
      <QaConfirmModal
        open={confirm === 'recollect'}
        onClose={() => setConfirm(null)}
        title="명세를 다시 수집할까요?"
        description={NOTICE_COPY.RECOLLECT}
        confirmLabel="다시 수집"
        pending={start.isPending}
        disabled={!waiting || closed}
        onConfirm={() => start.mutate(sprint.version, { onSuccess: () => setConfirm(null) })}
      />
      <QaConfirmModal
        open={confirm === 'cancel'}
        onClose={() => setConfirm(null)}
        title="준비 작업을 취소할까요?"
        description="진행 중인 단계가 끝나면 작업을 멈춥니다."
        confirmLabel="작업 취소"
        variant="destructive"
        pending={cancel.isPending}
        disabled={!active || closed}
        onConfirm={() => cancel.mutate(undefined, { onSuccess: () => setConfirm(null) })}
      />
    </div>
  );
}
