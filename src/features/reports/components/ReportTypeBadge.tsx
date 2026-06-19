import { StatusBadge } from '@/shared/components/status-badge/StatusBadge';
import { reportTypeBadgeVariant } from '@/shared/constants/badgeVariants';
import { reportTypeLabels } from '@/shared/constants/labels';
import type { ReportType } from '@/shared/constants/enums';

export function ReportTypeBadge({ type }: { type: ReportType }) {
  return (
    <StatusBadge variant={reportTypeBadgeVariant[type]}>{reportTypeLabels[type]}</StatusBadge>
  );
}
