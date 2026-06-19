import { StatusBadge } from '@/shared/components/status-badge/StatusBadge';
import { userRoleBadgeVariant } from '@/shared/constants/badgeVariants';
import { userRoleLabels } from '@/shared/constants/labels';
import type { UserRole } from '@/shared/constants/enums';

export function UserRoleBadge({ role }: { role: UserRole }) {
  return <StatusBadge variant={userRoleBadgeVariant[role]}>{userRoleLabels[role]}</StatusBadge>;
}
