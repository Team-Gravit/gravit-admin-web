/** 인증 도메인 타입 (03 §3, 04 §7-2). */

/** OAuth provider 식별자 (UI/식별용 대문자, URL 경로는 소문자화). */
export type ProviderId = 'GOOGLE' | 'KAKAO' | 'NAVER';

/** 운영자 권한 (로그인 응답 role). */
export type Role = 'ADMIN' | 'USER';

/**
 * 운영자 프로필 (04 §7-2, §10-6).
 * ⚠️ GET /admin/me 미구현(D4) → 현재 admin 은 항상 null. 엔드포인트 추가 시 채운다.
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
