import { StatusBadge } from '@/shared/components/status-badge/StatusBadge';
import { stagingStatusBadgeVariant } from '@/shared/constants/badgeVariants';
import { stagingStatusLabels } from '@/shared/constants/labels';
import type { StagingStatus } from '@/shared/constants/enums';

export function StagingStatusBadge({ status }: { status: StagingStatus }) {
  return (
    <StatusBadge variant={stagingStatusBadgeVariant[status]}>
      {stagingStatusLabels[status]}
    </StatusBadge>
  );
}
