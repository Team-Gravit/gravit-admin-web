import { StatusBadge } from '@/shared/components/status-badge/StatusBadge';
import { reportResolvedBadgeVariant } from '@/shared/constants/badgeVariants';

export function ReportStatusBadge({ isResolved }: { isResolved: boolean }) {
  return (
    <StatusBadge variant={isResolved ? reportResolvedBadgeVariant.resolved : reportResolvedBadgeVariant.unresolved}>
      {isResolved ? '해결됨' : '미해결'}
    </StatusBadge>
  );
}
