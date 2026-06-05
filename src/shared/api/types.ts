/** 공통 응답 타입 (03 §2-4, §2-5). */

/** 페이지네이션 응답 공통 구조. 페이지 크기 20 고정(서버). */
export interface PaginatedResponse<T> {
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  content: T[];
}

/** 통일 에러 응답 본문 (03 §2-5): { code, message }. */
export interface ErrorResponse {
  /** 도메인 기반 에러 코드 (USER_NOT_FOUND 등) */
  code: string;
  /** 사용자 표시용 메시지 — 토스트에 직접 노출 */
  message: string;
}
