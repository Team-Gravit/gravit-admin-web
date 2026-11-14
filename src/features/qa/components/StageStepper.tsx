import { Check, ChevronRight, X } from 'lucide-react';
import { FLOW_ORDER, SPRINT_STATUS_LABELS } from '@/features/qa/labels';
import type { Sprint } from '@/features/qa/schemas';

export function StageStepper({ sprint }: { sprint: Sprint }) {
  const position = FLOW_ORDER.indexOf(sprint.status);
  const failed = sprint.latestJob?.status === 'FAILED';
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-3" aria-label="진행 단계">
      {FLOW_ORDER.map((stage, i) => {
        const done = sprint.status === 'CLOSED' || position > i;
        const current = !done && i === position;
        const failure = current && failed;
        return (
          <li
            key={stage}
            className="flex items-center gap-2"
            aria-current={current ? 'step' : undefined}
            aria-label={`${SPRINT_STATUS_LABELS[stage]} ${done ? '완료' : failure ? '실패' : current ? '현재 단계' : '대기'}`}
          >
            {i > 0 && <ChevronRight className="size-3.5 text-fg-disabled" aria-hidden />}
            <span
              className={`flex size-6 shrink-0 items-center justify-center rounded-full text-caption tabular-nums ${done ? 'bg-success-bg text-success-text' : failure ? 'bg-danger-bg text-danger-text' : current ? 'bg-primary text-primary-foreground' : 'border border-dashed border-border bg-hover text-fg-muted'}`}
            >
              {done ? (
                <Check className="size-3.5" aria-hidden />
              ) : failure ? (
                <X className="size-3.5" aria-hidden />
              ) : (
                i + 1
              )}
            </span>
            <span
              className={`whitespace-nowrap text-caption ${current ? 'font-medium text-foreground' : 'text-fg-muted'}`}
            >
              {SPRINT_STATUS_LABELS[stage]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
