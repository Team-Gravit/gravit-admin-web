import { StatusBadge } from '@/shared/components/status-badge/StatusBadge';
import {
  SETUP_LABELS,
  SETUP_ORDER,
  SETUP_STATUS_LABELS,
  SETUP_STATUS_VARIANTS,
} from '@/features/qa/labels';
import type { SetupStep } from '@/features/qa/schemas';
export function SetupJobSteps({ steps }: { steps: SetupStep[] }) {
  return (
    <ol className="divide-y divide-border">
      {SETUP_ORDER.map((key) => {
        const step = steps.find((s) => s.key === key);
        const status = step?.status ?? 'PENDING';
        return (
          <li key={key} className="flex flex-col gap-2 py-3">
            <div className="flex items-center gap-3">
              <span className="text-body font-medium text-foreground">{SETUP_LABELS[key]}</span>
              <StatusBadge variant={SETUP_STATUS_VARIANTS[status]}>
                {SETUP_STATUS_LABELS[status]}
              </StatusBadge>
              <span className="ml-auto text-caption text-fg-muted">
                시도 {step?.attempt ?? 0}회
              </span>
            </div>
            {step?.message && (
              <p
                className={`whitespace-pre-wrap rounded-md px-3 py-2 text-caption ${status === 'FAILED' ? 'bg-danger-bg text-danger-text' : 'bg-page text-fg-secondary'}`}
              >
                {step.message}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
