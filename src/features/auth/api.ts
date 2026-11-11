import { apiClient, authApiClient } from '@/shared/api/client';
import { env } from '@/env';
import {
  adminMeResponseSchema,
  loginUrlResponseSchema,
  oauthLoginResponseSchema,
  type LoginUrlResponse,
  type OAuthLoginResponse,
} from '@/features/auth/schemas';
import type { AdminProfile, ProviderId } from '@/features/auth/types';

const providerPath = (provider: ProviderId): string => provider.toLowerCase();

export const authApi = {
  getLoginUrl: async (provider: ProviderId): Promise<LoginUrlResponse> => {
    const { data } = await authApiClient.get(`/oauth/login-url/${providerPath(provider)}`, {
      params: { dest: env.VITE_OAUTH_DEST },
    });
    return loginUrlResponseSchema.parse(data);
  },

  oauthLogin: async (
    provider: ProviderId,
    code: string,
    state: string,
  ): Promise<OAuthLoginResponse> => {
    const { data } = await authApiClient.post(
      `/oauth/${providerPath(provider)}`,
      { code, state },
      { params: { dest: env.VITE_OAUTH_DEST } },
    );
    return oauthLoginResponseSchema.parse(data);
  },

  logout: async (): Promise<void> => {
    await authApiClient.post('/auth/logout');
  },

  me: async (): Promise<AdminProfile> => {
    const { data } = await apiClient.get('/me');
    return adminMeResponseSchema.parse(data);
  },
};
