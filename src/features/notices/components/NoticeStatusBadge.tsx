import { StatusBadge } from '@/shared/components/status-badge/StatusBadge';
import { noticeStatusBadgeVariant } from '@/shared/constants/badgeVariants';
import { noticeStatusLabels } from '@/shared/constants/labels';
import type { NoticeStatus } from '@/shared/constants/enums';

/** 공지 상태 뱃지 (DS-02 §3, 04 §9-8): DRAFT=muted, PUBLISHED=success, ARCHIVED=muted. */
export function NoticeStatusBadge({ status }: { status: NoticeStatus }) {
  return <StatusBadge variant={noticeStatusBadgeVariant[status]}>{noticeStatusLabels[status]}</StatusBadge>;
}
