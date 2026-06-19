/**
 * API enum 값 유니온 (03 §5 / 01 §8). 값 추가·변경 금지.
 *
 * shared/constants 의 labels·badgeVariants 가 참조하므로 enum 의 단일 홈을 shared 에 둔다.
 * (shared 는 features 를 import 할 수 없으므로 — features/{domain} 는 여기서 import 한다: features→shared 합법.)
 */
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';
export type UserRole = 'ADMIN' | 'USER';
export type ReportType = 'TYPO_ERROR' | 'CONTENT_ERROR' | 'ANSWER_ERROR' | 'OTHER_ERROR';
export type ProblemType = 'OBJECTIVE' | 'SUBJECTIVE';
export type NoticeStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type StagingStatus = 'PENDING' | 'COMPLETED';
export type InquiryStatus = 'PENDING' | 'RESOLVED';
export type InquiryType = 'BUG_REPORT' | 'CONTENT_ERROR' | 'FEATURE_SUGGESTION' | 'OTHER';
