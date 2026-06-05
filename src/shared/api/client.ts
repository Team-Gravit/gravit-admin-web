import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { z } from 'zod';
import { toast } from 'sonner';
import { env } from '@/env';
import { ROUTES } from '@/shared/constants/routes';
import { tokenManager } from '@/shared/api/tokenManager';
import { reissueQueue } from '@/shared/api/reissueQueue';

/**
 * axios 인스턴스 2개 (04 §6-2, 03 §2-1·§3).
 * - 모든 엔드포인트(인증 포함)는 base `/api/v1/admin` (03 §2-1, §3 요청 예시).
 * - authApiClient: 인터셉터 없음 — login/refresh/logout 처럼 401 reissue 사이클을 타면 안 되는 호출용.
 * - apiClient: 요청 인터셉터(Bearer) + 응답 인터셉터(401 → refresh 단일비행 → retry).
 */
const BASE_URL = `${env.VITE_API_HOST}/api/v1/admin`;
const TIMEOUT = 30_000;

export const authApiClient = axios.create({ baseURL: BASE_URL, timeout: TIMEOUT });
export const apiClient = axios.create({ baseURL: BASE_URL, timeout: TIMEOUT });

// 재발급 응답(03 §3-2): Rotation 으로 access+refresh 둘 다 신규 발급 → 둘 다 저장.
const tokenPairSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// (1) 요청 인터셉터: Authorization 헤더 부착
apiClient.interceptors.request.use((config) => {
  const accessToken = tokenManager.getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

/** refresh 실패 → 로컬 토큰 정리 후 로그인으로 하드 이동 + 토스트. */
function forceLogout(): void {
  tokenManager.clear();
  toast.error('다시 로그인해주세요.');
  window.location.href = ROUTES.LOGIN;
}

// (2) 응답 인터셉터: 401 → reissue 단일 비행 큐
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableRequest | undefined;
    const status = error.response?.status;

    // 401 외(403/404/409/500 등)는 그대로 throw. 이미 재시도한 요청도 throw.
    if (status !== 401 || !original || original._retry) {
      return Promise.reject(error);
    }
    original._retry = true;

    // 이미 재발급 진행 중 → 큐에서 대기
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

      const { data } = await authApiClient.post('/auth/refresh', { refreshToken });
      const { accessToken, refreshToken: rotatedRefresh } = tokenPairSchema.parse(data);
      tokenManager.setTokens(accessToken, rotatedRefresh);
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
