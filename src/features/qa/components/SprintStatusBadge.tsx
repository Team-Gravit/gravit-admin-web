import { StatusBadge } from '@/shared/components/status-badge/StatusBadge';
import { SPRINT_STATUS_LABELS } from '@/features/qa/labels';
import type { SprintStatus } from '@/features/qa/schemas';

export function SprintStatusBadge({ status }: { status: SprintStatus }) {
  return (
    <StatusBadge variant={status === 'CLOSED' ? 'success' : 'muted'}>
      {SPRINT_STATUS_LABELS[status]}
    </StatusBadge>
  );
}
