/**
 * 라우트 경로 상수 (04 §8-1).
 * 모든 라우팅·링크는 이 상수를 참조한다. 하드코딩된 경로 문자열 금지.
 */
export const ROUTES = {
  LOGIN: '/login',
  /** OAuth 콜백 (provider 가 ?code= 로 복귀). 라이브 web 미러 — BACKEND_ADMIN_API_SPEC §8. */
  OAUTH_CALLBACK_PATTERN: '/login/oauth2/code/:provider',
  OAUTH_CALLBACK: (provider: string) => `/login/oauth2/code/${provider}`,
  DASHBOARD: '/',
  USERS: '/users',
  USER_DETAIL: (userId: number | string) => `/users/${userId}`,
  REPORTS: '/reports',
  REPORT_DETAIL: (reportId: number | string) => `/reports/${reportId}`,
  INQUIRIES: '/inquiries',
  INQUIRY_DETAIL: (inquiryId: number | string) => `/inquiries/${inquiryId}`,
  CHAPTERS: '/chapters',
  CHAPTER_DETAIL: (chapterId: number | string) => `/chapters/${chapterId}`,
  UNIT_DETAIL: (unitId: number | string) => `/units/${unitId}`,
  LESSON_DETAIL: (lessonId: number | string) => `/lessons/${lessonId}`,
  PROBLEM_DETAIL: (problemId: number | string) => `/problems/${problemId}`,
  STAGING_LABELS: '/staging/labels',
  STAGING_LABEL_DETAIL: (label: string) => `/staging/labels/${label}`,
  NOTICES: '/notices',
  NOTICE_NEW: '/notices/new',
  NOTICE_DETAIL: (noticeId: number | string) => `/notices/${noticeId}`,
} as const;
