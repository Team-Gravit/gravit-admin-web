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

/** 신고 유형 뱃지(목록 시각 강조): 처리상태색(danger/success)과 겹치지 않게 info/warning/accent/muted. */
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

/** 문의 처리상태 뱃지: 대기=warning(검수대기와 동일 톤), 답변완료=success. */
export const inquiryStatusBadgeVariant: Record<InquiryStatus, BadgeVariant> = {
  PENDING: 'warning',
  RESOLVED: 'success',
};

/** 문의 유형 뱃지: 상태색(success/warning)과 겹치지 않도록 danger/info/accent/muted 배정. */
export const inquiryTypeBadgeVariant: Record<InquiryType, BadgeVariant> = {
  BUG_REPORT: 'danger',
  CONTENT_ERROR: 'info',
  FEATURE_SUGGESTION: 'accent',
  OTHER: 'muted',
};
