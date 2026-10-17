import { QaApiError } from '@/shared/api/qaClient';
import { ERROR_COPY } from '@/features/qa/copy';

/**
 * QA 조회 실패 → 오류 상태 표시 (QA_SPEC B-5, decisions D9-3).
 * 403·503 은 qaClient 가 정한 문구(403 = 서버 message 또는 F-5 FORBIDDEN, 503 = F-5 AUTH_UNAVAILABLE)를 그대로 보여 준다.
 * 403 은 종착이라 다시 시도 버튼을 두지 않는다. 그 밖은 ErrorState 기본 문구 + 다시 시도.
 */
export function qaErrorView(error: unknown): { message?: string; retryable: boolean } {
  if (error instanceof QaApiError) {
    if (error.status === 403) return { message: error.message, retryable: false };
    if (error.status === 503) return { message: error.message, retryable: true };
  }
  return { retryable: true };
}

/**
 * 항목 추가·수정의 422 (QA_SPEC A-3 #9·#10 — 422 는 오류 코드로 나눈다, D9-2).
 * `CHECKLIST_4221` 카탈로그에 없는 testRef → F-5 AUTO_NOT_ALLOWED(테스트 ID 칸),
 * `CHECKLIST_4222` 페르소나 키 오류 → 서버 message(페르소나 칸), 그 밖의 422 → 서버 message(칸 없음).
 * 422 가 아니면 null — 호출 쪽 공통 처리(409 STALE 등)에 맡긴다.
 */
export function itemRuleError(
  error: unknown,
): { field: 'testRef' | 'personaKey' | null; message: string } | null {
  if (!(error instanceof QaApiError) || error.status !== 422) return null;
  if (error.code === 'CHECKLIST_4221')
    return { field: 'testRef', message: ERROR_COPY.AUTO_NOT_ALLOWED };
  if (error.code === 'CHECKLIST_4222') return { field: 'personaKey', message: error.message };
  return { field: null, message: error.message };
}
