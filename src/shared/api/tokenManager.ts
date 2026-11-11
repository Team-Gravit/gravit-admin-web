/**
 * accessToken은 메모리, refreshToken은 서버의 HttpOnly 쿠키에 둔다.
 * localStorage에는 세션 복원을 시도할지 알려주는 힌트만 저장한다.
 * 힌트는 인증 증거가 아니며, 새로고침 시 쿠키 재발급 결과로 세션을 판정한다.
 */
const SESSION_HINT_KEY = 'gravit_admin_session';
const LEGACY_REFRESH_TOKEN_KEY = 'gravit_admin_refresh_token';

let accessTokenInMemory: string | null = null;

export const tokenManager = {
  getAccessToken: (): string | null => accessTokenInMemory,
  setAccessToken: (token: string): void => {
    accessTokenInMemory = token;
    localStorage.setItem(SESSION_HINT_KEY, 'true');
    localStorage.removeItem(LEGACY_REFRESH_TOKEN_KEY);
  },

  hasSession: (): boolean => localStorage.getItem(SESSION_HINT_KEY) === 'true',

  clear: (): void => {
    accessTokenInMemory = null;
    localStorage.removeItem(SESSION_HINT_KEY);
    localStorage.removeItem(LEGACY_REFRESH_TOKEN_KEY);
  },
};
