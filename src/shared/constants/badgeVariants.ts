import type {
  NoticeStatus,
  ProblemType,
  StagingStatus,
  UserRole,
  UserStatus,
} from '@/shared/constants/enums';

/**
 * Status Badge variant 매핑 (04 §9-8, DS-01 §1-3).
 * variant → 토큰: success/warning/danger/info/accent/muted/primary(=ADMIN, primary-bg-badge).
 */
export type BadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'accent'
  | 'muted'
  | 'primary';

export const userStatusBadgeVariant: Record<UserStatus, BadgeVariant> = {
  ACTIVE: 'success',
  SUSPENDED: 'warning',
  DELETED: 'muted',
};

export const userRoleBadgeVariant: Record<UserRole, BadgeVariant> = {
  ADMIN: 'primary', // primary-bg-badge
  USER: 'muted',
};

export const reportResolvedBadgeVariant = {
  unresolved: 'danger',
  resolved: 'success',
} satisfies Record<'unresolved' | 'resolved', BadgeVariant>;

export const noticeStatusBadgeVariant: Record<NoticeStatus, BadgeVariant> = {
  DRAFT: 'muted',
  PUBLISHED: 'success',
  ARCHIVED: 'muted',
};

export const stagingStatusBadgeVariant: Record<StagingStatus, BadgeVariant> = {
  PENDING: 'warning',
  COMPLETED: 'success',
};

export const problemTypeBadgeVariant: Record<ProblemType, BadgeVariant> = {
  OBJECTIVE: 'info',
  SUBJECTIVE: 'accent',
};
