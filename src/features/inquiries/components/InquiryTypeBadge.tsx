import { StatusBadge } from '@/shared/components/status-badge/StatusBadge';
import { inquiryTypeBadgeVariant } from '@/shared/constants/badgeVariants';
import { inquiryTypeLabels } from '@/shared/constants/labels';
import type { InquiryType } from '@/shared/constants/enums';

/** 문의 유형 뱃지 (4종). ProblemTypeBadge 선례와 동일하게 유형을 시맨틱 variant 로 매핑. */
export function InquiryTypeBadge({ type }: { type: InquiryType }) {
  return (
    <StatusBadge variant={inquiryTypeBadgeVariant[type]}>{inquiryTypeLabels[type]}</StatusBadge>
  );
}
