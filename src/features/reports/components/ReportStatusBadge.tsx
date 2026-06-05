import { StatusBadge } from '@/shared/components/status-badge/StatusBadge';
import { reportResolvedBadgeVariant } from '@/shared/constants/badgeVariants';

/** 신고 처리상태 뱃지 (DS-02 §8, 04 §9-8): 미해결=danger, 해결됨=success. */
export function ReportStatusBadge({ isResolved }: { isResolved: boolean }) {
  return (
    <StatusBadge variant={isResolved ? reportResolvedBadgeVariant.resolved : reportResolvedBadgeVariant.unresolved}>
      {isResolved ? '해결됨' : '미해결'}
    </StatusBadge>
  );
}
