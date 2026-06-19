import { apiClient, authApiClient } from '@/shared/api/client';
import { env } from '@/env';
import {
  adminMeResponseSchema,
  loginUrlResponseSchema,
  oauthLoginResponseSchema,
  reissueResponseSchema,
  type OAuthLoginResponse,
} from '@/features/auth/schemas';
import type { AdminProfile, ProviderId } from '@/features/auth/types';

const providerPath = (provider: ProviderId): string => provider.toLowerCase();

export const authApi = {
  getLoginUrl: async (provider: ProviderId): Promise<string> => {
    const { data } = await authApiClient.get(`/oauth/login-url/${providerPath(provider)}`, {
      params: { dest: env.VITE_OAUTH_DEST },
    });
    return loginUrlResponseSchema.parse(data).loginUrl;
  },

  oauthLogin: async (provider: string, code: string): Promise<OAuthLoginResponse> => {
    const { data } = await authApiClient.post(
      `/oauth/${provider}`,
      { code },
      { params: { dest: env.VITE_OAUTH_DEST } },
    );
    return oauthLoginResponseSchema.parse(data);
  },

  reissue: async (refreshToken: string): Promise<string> => {
    const { data } = await authApiClient.post('/auth/reissue', { refreshToken });
    return reissueResponseSchema.parse(data).accessToken;
  },

  me: async (): Promise<AdminProfile> => {
    const { data } = await apiClient.get('/me');
    return adminMeResponseSchema.parse(data);
  },
};
