import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { z } from 'zod';
import { toast } from 'sonner';
import { env } from '@/env';
import { ROUTES } from '@/shared/constants/routes';
import { tokenManager } from '@/shared/api/tokenManager';
import { reissueQueue } from '@/shared/api/reissueQueue';

const API_V1 = `${env.VITE_API_HOST}/api/v1`;
const TIMEOUT = 30_000;

export const authApiClient = axios.create({
  baseURL: API_V1,
  timeout: TIMEOUT,
  withCredentials: true,
});
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
 * 반환: 새 accessToken. 복원 실패는 호출부에서 로그인으로 이동하도록 null을 반환한다.
 */
export async function refreshAccessToken(): Promise<string | null> {
  // 이미 다른 요청이 재발급 중이면 그 결과를 기다린다(단일 비행).
  if (reissueQueue.isReissuing) {
    return reissueQueue.subscribe();
  }

  reissueQueue.begin();
  try {
    // 웹은 본문 없이 HttpOnly refreshToken 쿠키로 재발급한다.
    const { data } = await authApiClient.post('/auth/reissue');
    const { accessToken } = reissueResponseSchema.parse(data);
    tokenManager.setAccessToken(accessToken);
    reissueQueue.publish(accessToken);
    return accessToken;
  } catch {
    reissueQueue.publish(null);
    return null;
  } finally {
    reissueQueue.end();
  }
}

/** 보호 API의 401 처리. 부팅 시 복원과 같은 재발급 큐를 사용한다. */
export async function reissueAccessToken(): Promise<string | null> {
  const accessToken = await refreshAccessToken();
  if (!accessToken) forceLogout();
  return accessToken;
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
