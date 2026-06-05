import { authApiClient } from '@/shared/api/client';
import { tokenManager } from '@/shared/api/tokenManager';
import { tokenPairSchema, type TokenPairResponse } from '@/features/auth/schemas';
import type { LoginRequest } from '@/features/auth/types';

/**
 * 인증 API (03 §3). login/refresh/logout 은 인터셉터 없는 authApiClient 사용
 * (401 reissue 사이클 회피). refresh 는 client.ts 인터셉터 내부에서 직접 호출.
 */
export const authApi = {
  /** POST /auth/login — OAuth idToken 으로 토큰 쌍 발급 (03 §3-1). */
  login: async (body: LoginRequest): Promise<TokenPairResponse> => {
    const { data } = await authApiClient.post('/auth/login', body);
    return tokenPairSchema.parse(data);
  },

  /**
   * POST /auth/logout — refreshToken 무효화 (03 §3-3, 204).
   * Bearer 필요하나 best-effort 이므로 manual 헤더로 호출(인터셉터 미경유).
   */
  logout: async (refreshToken: string): Promise<void> => {
    const accessToken = tokenManager.getAccessToken();
    await authApiClient.post(
      '/auth/logout',
      { refreshToken },
      accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined,
    );
  },
};
