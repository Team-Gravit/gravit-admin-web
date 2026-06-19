import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { z } from 'zod';
import { toast } from 'sonner';
import { env } from '@/env';
import { ROUTES } from '@/shared/constants/routes';
import { tokenManager } from '@/shared/api/tokenManager';
import { reissueQueue } from '@/shared/api/reissueQueue';

const API_V1 = `${env.VITE_API_HOST}/api/v1`;
const TIMEOUT = 30_000;

export const authApiClient = axios.create({ baseURL: API_V1, timeout: TIMEOUT });
export const apiClient = axios.create({ baseURL: `${API_V1}/admin`, timeout: TIMEOUT });

const reissueResponseSchema = z.object({
  accessToken: z.string().min(1),
});

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

apiClient.interceptors.request.use((config) => {
  const accessToken = tokenManager.getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

function forceLogout(): void {
  tokenManager.clear();
  toast.error('다시 로그인해주세요.');
  window.location.href = ROUTES.LOGIN;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableRequest | undefined;
    const status = error.response?.status;

    if (status !== 401 || !original || original._retry) {
      return Promise.reject(error);
    }
    original._retry = true;

    if (reissueQueue.isReissuing) {
      const newToken = await reissueQueue.subscribe();
      if (!newToken) return Promise.reject(error);
      original.headers.Authorization = `Bearer ${newToken}`;
      return apiClient.request(original);
    }

    // 재발급 시작 (단일 비행)
    reissueQueue.begin();
    try {
      const refreshToken = tokenManager.getRefreshToken();
      if (!refreshToken) throw new Error('NO_REFRESH_TOKEN');

      const { data } = await authApiClient.post('/auth/reissue', { refreshToken });
      const { accessToken } = reissueResponseSchema.parse(data);
      tokenManager.setAccessToken(accessToken);
      reissueQueue.publish(accessToken);

      original.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient.request(original);
    } catch (reissueError) {
      reissueQueue.publish(null);
      forceLogout();
      return Promise.reject(reissueError);
    } finally {
      reissueQueue.end();
    }
  },
);
