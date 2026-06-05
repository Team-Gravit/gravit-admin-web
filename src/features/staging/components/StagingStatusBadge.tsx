import { StatusBadge } from '@/shared/components/status-badge/StatusBadge';
import { stagingStatusBadgeVariant } from '@/shared/constants/badgeVariants';
import { stagingStatusLabels } from '@/shared/constants/labels';
import type { StagingStatus } from '@/shared/constants/enums';

/** 스테이징 상태 뱃지 (01 §6-6-1, 04 §9-8): PENDING=warning(검수 대기), COMPLETED=success(반영 완료). */
export function StagingStatusBadge({ status }: { status: StagingStatus }) {
  return (
    <StatusBadge variant={stagingStatusBadgeVariant[status]}>
      {stagingStatusLabels[status]}
    </StatusBadge>
  );
}
