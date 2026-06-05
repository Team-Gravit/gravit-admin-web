/**
 * 토큰 저장 (04 §6-5).
 * - accessToken: 메모리(모듈 변수) — XSS 표면 축소.
 * - refreshToken: localStorage — 새로고침 후 세션 유지.
 *
 * ⚠️ 보안 트레이드오프(04 §6-5): refresh 를 localStorage 에 두면 XSS 시 노출 가능.
 *   내부 운영자 대상 + Bearer 방식 한계 내 UX 절충. 향후 httpOnly 쿠키 재설계 권장.
 */
const REFRESH_TOKEN_KEY = 'gravit_admin_refresh_token';

let accessTokenInMemory: string | null = null;

export const tokenManager = {
  getAccessToken: (): string | null => accessTokenInMemory,
  setAccessToken: (token: string): void => {
    accessTokenInMemory = token;
  },

  getRefreshToken: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string): void => {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  /** 로그인/재발급(Rotation) 시 access+refresh 동시 저장. */
  setTokens: (access: string, refresh: string): void => {
    accessTokenInMemory = access;
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  },

  clear: (): void => {
    accessTokenInMemory = null;
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
