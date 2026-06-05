import type {
  NoticeStatus,
  ProblemType,
  ReportType,
  StagingStatus,
  UserRole,
  UserStatus,
} from '@/shared/constants/enums';

/** enum → 한글 매핑 (04 §9-7). 모든 UI 문구는 한국어 하드코딩(04 §9-6). */
export const userStatusLabels: Record<UserStatus, string> = {
  ACTIVE: '활성',
  SUSPENDED: '정지',
  DELETED: '삭제됨',
};

export const userRoleLabels: Record<UserRole, string> = {
  ADMIN: '관리자',
  USER: '일반',
};

export const reportTypeLabels: Record<ReportType, string> = {
  TYPO_ERROR: '오타',
  CONTENT_ERROR: '내용 오류',
  ANSWER_ERROR: '정답 오류',
  OTHER_ERROR: '기타',
};

export const problemTypeLabels: Record<ProblemType, string> = {
  OBJECTIVE: '객관식',
  SUBJECTIVE: '주관식',
};

export const noticeStatusLabels: Record<NoticeStatus, string> = {
  DRAFT: '초안',
  PUBLISHED: '게시중',
  ARCHIVED: '보관됨',
};

export const stagingStatusLabels: Record<StagingStatus, string> = {
  PENDING: '검수 대기',
  COMPLETED: '반영 완료',
};
