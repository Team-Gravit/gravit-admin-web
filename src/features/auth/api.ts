import { authApiClient } from '@/shared/api/client';
import { env } from '@/env';
import {
  loginUrlResponseSchema,
  oauthLoginResponseSchema,
  type OAuthLoginResponse,
} from '@/features/auth/schemas';
import type { ProviderId } from '@/features/auth/types';

/**
 * 인증 API (BACKEND_ADMIN_API_SPEC §8 — 기존 OAuth auth-code 흐름 재사용).
 * authApiClient(base `/api/v1`, 인터셉터 없음)로 호출. login/logout 전용 admin 엔드포인트 없음.
 * - provider 경로는 소문자(백엔드 case-insensitive, 라이브 web 관례).
 */
const providerPath = (provider: ProviderId): string => provider.toLowerCase();

export const authApi = {
  /** GET /oauth/login-url/{provider} — provider 인가 URL 획득(이후 리다이렉트). */
  getLoginUrl: async (provider: ProviderId): Promise<string> => {
    const { data } = await authApiClient.get(`/oauth/login-url/${providerPath(provider)}`, {
      params: { dest: env.VITE_OAUTH_DEST },
    });
    return loginUrlResponseSchema.parse(data).loginUrl;
  },

  /** POST /oauth/{provider} — authCode → 토큰 + role. */
  oauthLogin: async (provider: string, code: string): Promise<OAuthLoginResponse> => {
    const { data } = await authApiClient.post(
      `/oauth/${provider}`,
      { code },
      { params: { dest: env.VITE_OAUTH_DEST } },
    );
    return oauthLoginResponseSchema.parse(data);
  },
};
