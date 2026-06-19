import { StatusBadge } from '@/shared/components/status-badge/StatusBadge';
import { inquiryStatusBadgeVariant } from '@/shared/constants/badgeVariants';
import { inquiryStatusLabels } from '@/shared/constants/labels';
import type { InquiryStatus } from '@/shared/constants/enums';

/** 문의 처리상태 뱃지: 대기=warning, 답변완료=success. 운영자 직접변경 없음(읽기 표시). */
export function InquiryStatusBadge({ status }: { status: InquiryStatus }) {
  return (
    <StatusBadge variant={inquiryStatusBadgeVariant[status]}>
      {inquiryStatusLabels[status]}
    </StatusBadge>
  );
}
