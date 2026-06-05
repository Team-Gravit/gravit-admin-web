import { http, HttpResponse } from 'msw';

/**
 * MSW 목 핸들러 (dev 전용 — 백엔드/OAuth 없이 로컬 동작).
 * 경로는 호스트 무관 와일드카드(`*​/api/v1/admin/...`)로 매칭. 화면 추가 시 핸들러도 추가.
 */
const MOCK_TOKENS = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
};

export const handlers = [
  // 인증 (03 §3)
  http.post('*/api/v1/admin/auth/login', () => HttpResponse.json(MOCK_TOKENS)),
  http.post('*/api/v1/admin/auth/refresh', () => HttpResponse.json(MOCK_TOKENS)),
  http.post('*/api/v1/admin/auth/logout', () => new HttpResponse(null, { status: 204 })),

  // 대시보드 (03 §4-1)
  http.get('*/api/v1/admin/dashboard/summary', () =>
    HttpResponse.json({
      totalUsers: 12345,
      pendingLabelsCount: 8,
      unresolvedReportsCount: 24,
    }),
  ),
];
