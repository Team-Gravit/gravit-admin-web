import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { z } from 'zod';
import { env } from '@/env';
import { reissueAccessToken } from '@/shared/api/client';
import { tokenManager } from '@/shared/api/tokenManager';

/**
 * QA(gravit-qa) 전용 axios 인스턴스 (decisions D9-2·D9-3).
 * 별도 서비스라 apiClient 와 Base·오류 본문·인증 실패 매핑이 다르다.
 * - 401: **공유 재발급 절차**(`reissueAccessToken`)로 갱신 후 1회만 재시도한다. 여기서 재발급을
 *   따로 구현하면 refresh Rotation 때문에 apiClient 인터셉터와 서로의 토큰을 무효화한다(D8-3).
 * - 403: ADMIN 아님 — 종착. 재시도하지 않는다.
 * - 503: 인증 서버 판정 불가 — **401 로 다루지 않는다**(재발급·로그아웃 금지).
 * 실패는 모두 `QaApiError` 로 바꿔 던진다. 화면은 HTTP 상태로만 분기한다(오류 코드 목록 미확정, QA_SPEC G3).
 */
const TIMEOUT = 30_000;

export const qaApiClient = axios.create({ baseURL: env.VITE_QA_API_BASE, timeout: TIMEOUT });

/** QA_SPEC F-5 중 HTTP 계층 공통 문구. 도메인 문구(Notion 미발견·중복 등)는 features/qa 가 가진다. */
export const QA_ERROR_MESSAGES = {
  AUTH_UNAVAILABLE: '인증 서버 응답이 없어 권한을 확인하지 못했습니다. 잠시 후 다시 시도하세요.',
  FORBIDDEN: 'QA 메뉴를 사용할 권한이 없습니다.',
  DEFAULT: '요청을 처리하지 못했습니다. 잠시 후 다시 시도하세요.',
} as const;

/** 오류 본문 `{ error, message }` (QA_SPEC A-0). message 는 문자열·배열·필드별 객체. */
const qaErrorBodySchema = z.object({
  error: z.string(),
  message: z.union([z.string(), z.array(z.string()), z.record(z.unknown())]),
});

export class QaApiError extends Error {
  constructor(
    /** HTTP 상태. 응답이 없으면(네트워크·타임아웃) null. */
    readonly status: number | null,
    /** 토스트·오류 상태에 그대로 쓸 문구. */
    message: string,
    /** 서버가 준 문자열 message. 객체(필드별 오류)거나 없으면 null. */
    readonly serverMessage: string | null,
  ) {
    super(message);
    this.name = 'QaApiError';
  }
}

function toQaApiError(error: unknown): QaApiError {
  if (!(error instanceof AxiosError) || !error.response) {
    return new QaApiError(null, QA_ERROR_MESSAGES.DEFAULT, null);
  }
  const { status, data } = error.response;
  const body = qaErrorBodySchema.safeParse(data);
  const serverMessage =
    body.success && typeof body.data.message === 'string' && body.data.message.length > 0
      ? body.data.message
      : null;

  if (status === 503) return new QaApiError(status, QA_ERROR_MESSAGES.AUTH_UNAVAILABLE, serverMessage);
  if (status === 403) return new QaApiError(status, QA_ERROR_MESSAGES.FORBIDDEN, serverMessage);
  return new QaApiError(status, serverMessage ?? QA_ERROR_MESSAGES.DEFAULT, serverMessage);
}

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

qaApiClient.interceptors.request.use((config) => {
  const accessToken = tokenManager.getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

qaApiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const original =
      error instanceof AxiosError ? (error.config as RetryableRequest | undefined) : undefined;

    if (error instanceof AxiosError && error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      // 재발급 실패면 reissueAccessToken 이 강제 로그아웃까지 마친 상태다.
      const accessToken = await reissueAccessToken();
      if (!accessToken) return Promise.reject(toQaApiError(error));

      original.headers.Authorization = `Bearer ${accessToken}`;
      return qaApiClient.request(original);
    }
    return Promise.reject(toQaApiError(error));
  },
);

/**
 * QA 조회 재시도 정책 (TanStack Query `retry`).
 * 응답이 있는 4xx 와 503 은 다시 묻지 않는다 — 403 은 종착, 503 은 사용자가 다시 시도한다(D9-3).
 * 응답 파싱 실패도 다시 물어 봐야 같으므로 제외. 네트워크 오류·그 밖의 5xx 만 1회.
 */
export function qaQueryRetry(failureCount: number, error: unknown): boolean {
  if (!(error instanceof QaApiError)) return false;
  if (error.status !== null && (error.status < 500 || error.status === 503)) return false;
  return failureCount < 1;
}
