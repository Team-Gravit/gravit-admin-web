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
  ADMIN: 'muted',
  USER: 'muted',
};

export const reportResolvedBadgeVariant = {
  unresolved: 'danger',
  resolved: 'success',
} satisfies Record<'unresolved' | 'resolved', BadgeVariant>;

export const reportTypeBadgeVariant: Record<ReportType, BadgeVariant> = {
  TYPO_ERROR: 'muted',
  CONTENT_ERROR: 'muted',
  ANSWER_ERROR: 'muted',
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
  OBJECTIVE: 'muted',
  SUBJECTIVE: 'muted',
};

export const inquiryStatusBadgeVariant: Record<InquiryStatus, BadgeVariant> = {
  PENDING: 'warning',
  RESOLVED: 'success',
};

export const inquiryTypeBadgeVariant: Record<InquiryType, BadgeVariant> = {
  BUG_REPORT: 'muted',
  CONTENT_ERROR: 'muted',
  FEATURE_SUGGESTION: 'muted',
  OTHER: 'muted',
};
