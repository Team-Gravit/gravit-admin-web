import { Check, ChevronRight } from 'lucide-react';
import { FLOW_ORDER, SPRINT_STATUS_LABELS } from '@/features/qa/labels';
import type { Sprint } from '@/features/qa/schemas';
import { StatusBadge } from '@/shared/components/status-badge/StatusBadge';

export function StageStepper({ sprint }: { sprint: Sprint }) {
  const position = FLOW_ORDER.indexOf(sprint.status);
  const failed = sprint.latestJob?.status === 'FAILED';
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-3" aria-label="진행 단계">
      {FLOW_ORDER.map((stage, i) => {
        const current = i === position;
        const done = position > i;
        return (
          <li
            key={stage}
            className="flex items-center gap-2"
            aria-current={current ? 'step' : undefined}
          >
            {i > 0 && <ChevronRight className="size-3.5 text-fg-disabled" aria-hidden />}
            <span
              className={`flex size-6 shrink-0 items-center justify-center rounded-full text-caption ${current ? 'bg-primary text-primary-foreground' : done ? 'bg-success-bg text-success-text' : 'bg-hover text-fg-muted'}`}
            >
              {done ? <Check className="size-3.5" aria-hidden /> : i + 1}
            </span>
            <span
              className={`whitespace-nowrap text-caption ${current ? 'font-medium text-foreground' : 'text-fg-muted'}`}
            >
              {SPRINT_STATUS_LABELS[stage]}
            </span>
            {current && failed && <StatusBadge variant="danger">실패</StatusBadge>}
          </li>
        );
      })}
    </ol>
  );
}
