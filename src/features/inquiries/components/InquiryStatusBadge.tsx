import { StatusBadge } from '@/shared/components/status-badge/StatusBadge';
import { inquiryStatusBadgeVariant } from '@/shared/constants/badgeVariants';
import { inquiryStatusLabels } from '@/shared/constants/labels';
import type { InquiryStatus } from '@/shared/constants/enums';

export function InquiryStatusBadge({ status }: { status: InquiryStatus }) {
  return (
    <StatusBadge variant={inquiryStatusBadgeVariant[status]}>
      {inquiryStatusLabels[status]}
    </StatusBadge>
  );
}
