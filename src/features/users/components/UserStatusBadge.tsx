import { StatusBadge } from '@/shared/components/status-badge/StatusBadge';
import { userStatusBadgeVariant } from '@/shared/constants/badgeVariants';
import { userStatusLabels } from '@/shared/constants/labels';
import type { UserStatus } from '@/shared/constants/enums';

/** 유저 상태 뱃지 (01 §6-3-1, 04 §9-8): ACTIVE=success, SUSPENDED=warning, DELETED=muted. */
export function UserStatusBadge({ status }: { status: UserStatus }) {
  return <StatusBadge variant={userStatusBadgeVariant[status]}>{userStatusLabels[status]}</StatusBadge>;
}
