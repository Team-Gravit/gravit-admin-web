import { CheckCircle2, Circle, Loader2, MinusCircle, XCircle, type LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { STEP_STATUS_LABELS, stepNameLabel } from '@/features/qa/labels';
import type { JobStep, StepStatus } from '@/features/qa/schemas';

const STEP_ICON: Record<StepStatus, { icon: LucideIcon; className: string }> = {
  PENDING: { icon: Circle, className: 'text-fg-disabled' },
  RUNNING: { icon: Loader2, className: 'animate-spin text-primary' },
  DONE: { icon: CheckCircle2, className: 'text-success-text' },
  FAILED: { icon: XCircle, className: 'text-danger-text' },
  SKIPPED: { icon: MinusCircle, className: 'text-fg-muted' },
};

/** INTERPRET 의 `{처리 수}/{전체 수}` (QA_SPEC B-2). */
const FRACTION = /^(\d+)\/(\d+)$/;

/** 걸린 시간 = finishedAt - startedAt. 둘 중 하나라도 없으면 표시하지 않는다. */
function duration(step: JobStep): string | null {
  if (!step.startedAt || !step.finishedAt) return null;
  const sec = Math.max(
    0,
    Math.round((new Date(step.finishedAt).getTime() - new Date(step.startedAt).getTime()) / 1000),
  );
  const m = Math.floor(sec / 60);
  return m > 0 ? `${m}분 ${sec % 60}초` : `${sec}초`;
}

function StepMessage({ step }: { step: JobStep }) {
  if (!step.message) return null;

  if (step.status === 'FAILED') {
    return (
      <p className="whitespace-pre-wrap break-all rounded-md bg-danger-bg px-3 py-2 text-caption text-danger-text">
        {step.message}
      </p>
    );
  }

  const fraction = step.name === 'INTERPRET' ? FRACTION.exec(step.message) : null;
  if (fraction) {
    const done = Number(fraction[1]);
    const total = Number(fraction[2]);
    const pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
    return (
      <div className="flex items-center gap-3">
        <div className="h-1.5 w-48 overflow-hidden rounded-full bg-primary-subtle">
          <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-caption tabular-nums text-fg-secondary">{step.message}</span>
      </div>
    );
  }

  return <p className="text-caption text-fg-secondary">{step.message}</p>;
}

/** 셋업 단계 세로 목록 (QA_SPEC B-2) — 상태 아이콘 · 라벨 · message · 걸린 시간. */
export function SetupJobSteps({ steps }: { steps: JobStep[] }) {
  const ordered = [...steps].sort((a, b) => a.seq - b.seq);

  return (
    <ol className="flex flex-col divide-y divide-border">
      {ordered.map((step) => {
        const { icon: Icon, className } = STEP_ICON[step.status];
        const took = duration(step);
        return (
          <li key={step.seq} className="flex items-start gap-3 py-3">
            <Icon className={cn('mt-0.5 size-4 shrink-0', className)} aria-hidden />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex items-center justify-between gap-4">
                <span
                  className={`text-body ${
                    step.status === 'PENDING' || step.status === 'SKIPPED'
                      ? 'text-fg-muted'
                      : 'text-foreground'
                  }`}
                >
                  {stepNameLabel(step.name)}
                  <span className="sr-only"> — {STEP_STATUS_LABELS[step.status]}</span>
                </span>
                {took && (
                  <span className="shrink-0 text-caption tabular-nums text-fg-muted">{took}</span>
                )}
              </div>
              <StepMessage step={step} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
