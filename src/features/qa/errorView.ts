import { QaApiError } from '@/shared/api/qaClient';

/**
 * QA 조회 실패 → 오류 상태 표시 (QA_SPEC B-5, decisions D9-3).
 * 403·503 은 qaClient 가 정한 F-5 문구(FORBIDDEN·AUTH_UNAVAILABLE)를 그대로 보여 준다.
 * 403 은 종착이라 다시 시도 버튼을 두지 않는다. 그 밖은 ErrorState 기본 문구 + 다시 시도.
 */
export function qaErrorView(error: unknown): { message?: string; retryable: boolean } {
  if (error instanceof QaApiError) {
    if (error.status === 403) return { message: error.message, retryable: false };
    if (error.status === 503) return { message: error.message, retryable: true };
  }
  return { retryable: true };
}
