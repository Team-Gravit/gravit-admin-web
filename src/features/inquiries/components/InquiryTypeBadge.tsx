import { StatusBadge } from '@/shared/components/status-badge/StatusBadge';
import { inquiryTypeBadgeVariant } from '@/shared/constants/badgeVariants';
import { inquiryTypeLabels } from '@/shared/constants/labels';
import type { InquiryType } from '@/shared/constants/enums';

export function InquiryTypeBadge({ type }: { type: InquiryType }) {
  return (
    <StatusBadge variant={inquiryTypeBadgeVariant[type]}>{inquiryTypeLabels[type]}</StatusBadge>
  );
}
