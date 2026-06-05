import { StatusBadge } from '@/shared/components/status-badge/StatusBadge';
import { userRoleBadgeVariant } from '@/shared/constants/badgeVariants';
import { userRoleLabels } from '@/shared/constants/labels';
import type { UserRole } from '@/shared/constants/enums';

/** 유저 역할 뱃지 (01 §6-3-1, 04 §9-8): ADMIN=primary(보라 뱃지), USER=muted. */
export function UserRoleBadge({ role }: { role: UserRole }) {
  return <StatusBadge variant={userRoleBadgeVariant[role]}>{userRoleLabels[role]}</StatusBadge>;
}
