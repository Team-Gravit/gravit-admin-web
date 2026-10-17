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

const toMs = (iso: string) => new Date(iso).getTime();

function formatSeconds(ms: number): string {
  const sec = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(sec / 60);
  return m > 0 ? `${m}분 ${sec % 60}초` : `${sec}초`;
}

/**
 * 끝난 단계 = finishedAt - startedAt, 진행 중 단계 = now - startedAt(경과 시간, polling 마다 갱신).
 * 시작 전이면 표시하지 않는다.
 */
function stepTime(step: JobStep, now: number): string | null {
  if (!step.startedAt) return null;
  if (step.finishedAt) return formatSeconds(toMs(step.finishedAt) - toMs(step.startedAt));
  if (step.status === 'RUNNING') return formatSeconds(now - toMs(step.startedAt));
  return null;
}

/** message 는 실패·건너뜀 사유만 온다(B-2). 실패는 실패 톤으로, 건너뜀은 흐린 글자로 펼쳐 둔다. */
function StepMessage({ step }: { step: JobStep }) {
  if (!step.message) return null;
  if (step.status === 'FAILED') {
    return (
      <p className="whitespace-pre-wrap break-all rounded-md bg-danger-bg px-3 py-2 text-caption text-danger-text">
        {step.message}
      </p>
    );
  }
  return <p className="whitespace-pre-wrap text-caption text-fg-secondary">{step.message}</p>;
}

/**
 * 셋업 단계 세로 목록 (QA_SPEC B-2) — 상태 아이콘 · 라벨 · message · 걸린 시간.
 * 진행 수(예 12/53)는 서버가 주지 않으므로 진행 막대를 만들지 않는다. now = 마지막 조회 시각(ms).
 */
export function SetupJobSteps({ steps, now }: { steps: JobStep[]; now: number }) {
  const ordered = [...steps].sort((a, b) => a.seq - b.seq);

  return (
    <ol className="flex flex-col divide-y divide-border">
      {ordered.map((step) => {
        const { icon: Icon, className } = STEP_ICON[step.status];
        const took = stepTime(step, now);
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
