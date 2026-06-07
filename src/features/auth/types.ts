/** 인증 도메인 타입 (03 §3, 04 §7-2). */

/** OAuth provider 식별자 (UI/식별용 대문자, URL 경로는 소문자화). */
export type ProviderId = 'GOOGLE' | 'KAKAO' | 'NAVER';

/** 운영자 권한 (로그인 응답 role). */
export type Role = 'ADMIN' | 'USER';

/**
 * 운영자 프로필 (04 §7-2, §10-6, BACKEND_ADMIN_API_SPEC §4-0).
 * GET /admin/me 응답 매핑. protectedLoader(부트스트랩)에서 fetch → store.setAdmin.
 */
export interface AdminProfile {
  adminId: number;
  nickname: string;
  email: string;
  profileImgNumber: number;
}

export interface AuthState {
  admin: AdminProfile | null;
  isAuthenticated: boolean;
  setAdmin: (admin: AdminProfile) => void;
  reset: () => void;
}
