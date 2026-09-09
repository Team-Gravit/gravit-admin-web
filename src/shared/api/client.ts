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

/**
 * 401 재발급 **단일 절차** (04 §6-4, decisions D8-3).
 * axios 인터셉터와 Ravvit fetch 클라이언트가 이 함수를 **공유**한다 — 각자 재발급하면
 * refresh Rotation 때문에 서로가 방금 받은 토큰을 무효화한다. 복제 금지.
 * 반환: 새 accessToken. 실패 시 강제 로그아웃까지 수행하고 null.
 */
export async function reissueAccessToken(): Promise<string | null> {
  // 이미 다른 요청이 재발급 중이면 그 결과를 기다린다(단일 비행).
  if (reissueQueue.isReissuing) {
    return reissueQueue.subscribe();
  }

  reissueQueue.begin();
  try {
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) throw new Error('NO_REFRESH_TOKEN');

    const { data } = await authApiClient.post('/auth/reissue', { refreshToken });
    const { accessToken } = reissueResponseSchema.parse(data);
    tokenManager.setAccessToken(accessToken);
    reissueQueue.publish(accessToken);
    return accessToken;
  } catch {
    reissueQueue.publish(null);
    forceLogout();
    return null;
  } finally {
    reissueQueue.end();
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableRequest | undefined;

    if (error.response?.status !== 401 || !original || original._retry) {
      return Promise.reject(error);
    }
    original._retry = true;

    const accessToken = await reissueAccessToken();
    if (!accessToken) return Promise.reject(error);

    original.headers.Authorization = `Bearer ${accessToken}`;
    return apiClient.request(original);
  },
);
