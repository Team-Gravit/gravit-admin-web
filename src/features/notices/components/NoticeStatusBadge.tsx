import { StatusBadge } from '@/shared/components/status-badge/StatusBadge';
import { noticeStatusBadgeVariant } from '@/shared/constants/badgeVariants';
import { noticeStatusLabels } from '@/shared/constants/labels';
import type { NoticeStatus } from '@/shared/constants/enums';

export function NoticeStatusBadge({ status }: { status: NoticeStatus }) {
  return <StatusBadge variant={noticeStatusBadgeVariant[status]}>{noticeStatusLabels[status]}</StatusBadge>;
}
