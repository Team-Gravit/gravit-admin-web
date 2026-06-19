import { StatusBadge } from '@/shared/components/status-badge/StatusBadge';
import { userStatusBadgeVariant } from '@/shared/constants/badgeVariants';
import { userStatusLabels } from '@/shared/constants/labels';
import type { UserStatus } from '@/shared/constants/enums';

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return <StatusBadge variant={userStatusBadgeVariant[status]}>{userStatusLabels[status]}</StatusBadge>;
}
