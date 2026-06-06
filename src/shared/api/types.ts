/** 공통 응답 타입 (03 §2-4, §2-5). */

/** 페이지네이션 응답 공통 구조 (백엔드 PageResponse). 페이지 크기 20 고정(서버). */
export interface PaginatedResponse<T> {
  page: number;
  totalPages: number;
  hasNext: boolean;
  contents: T[];
}

/**
 * 에러 응답 본문 (백엔드 ErrorResponse): { error, message }.
 * - error: 도메인 에러 코드(USER_4041 등). 표시는 message 우선 — error 코드 분기 비권장(코드 표기 불일치).
 * - message: 사용자 표시용 문자열. @Valid 검증 실패 시 dev 포맷 string[] → 토스트는 상태별 기본 문구로 폴백.
 */
export interface ErrorResponse {
  error: string;
  message: string | string[];
}
