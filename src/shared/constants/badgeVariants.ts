import type {
  InquiryStatus,
  InquiryType,
  NoticeStatus,
  ProblemType,
  ReportType,
  StagingStatus,
  UserRole,
  UserStatus,
} from '@/shared/constants/enums';

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
  ADMIN: 'primary',
  USER: 'muted',
};

export const reportResolvedBadgeVariant = {
  unresolved: 'danger',
  resolved: 'success',
} satisfies Record<'unresolved' | 'resolved', BadgeVariant>;

export const reportTypeBadgeVariant: Record<ReportType, BadgeVariant> = {
  TYPO_ERROR: 'info',
  CONTENT_ERROR: 'warning',
  ANSWER_ERROR: 'accent',
  OTHER_ERROR: 'muted',
};

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

export const inquiryStatusBadgeVariant: Record<InquiryStatus, BadgeVariant> = {
  PENDING: 'warning',
  RESOLVED: 'success',
};

export const inquiryTypeBadgeVariant: Record<InquiryType, BadgeVariant> = {
  BUG_REPORT: 'danger',
  CONTENT_ERROR: 'info',
  FEATURE_SUGGESTION: 'accent',
  OTHER: 'muted',
};
