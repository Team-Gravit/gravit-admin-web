import { StatusBadge } from '@/shared/components/status-badge/StatusBadge';
import { reportTypeBadgeVariant } from '@/shared/constants/badgeVariants';
import { reportTypeLabels } from '@/shared/constants/labels';
import type { ReportType } from '@/shared/constants/enums';

/** 신고 유형 뱃지 (4종). 목록 시각 강조용 — 처리상태 뱃지(danger/success)와 색 구분. */
export function ReportTypeBadge({ type }: { type: ReportType }) {
  return (
    <StatusBadge variant={reportTypeBadgeVariant[type]}>{reportTypeLabels[type]}</StatusBadge>
  );
}
