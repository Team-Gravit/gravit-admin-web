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

  // 공지 목록 (03 §9-1)
  http.get('*/api/v1/admin/notices', () =>
    HttpResponse.json({
      page: 1,
      totalPages: 1,
      hasNextPage: false,
      content: [
        {
          noticeId: 1,
          title: '서비스 점검 안내 (5월 11일)',
          status: 'PUBLISHED',
          pinned: true,
          publishedAt: '2026-04-25T00:00:00Z',
          createdAt: '2026-04-24T05:30:00Z',
        },
        {
          noticeId: 2,
          title: '신규 서비스 런칭 (6월 1일)',
          status: 'DRAFT',
          pinned: true,
          publishedAt: null,
          createdAt: '2026-05-20T05:30:00Z',
        },
        {
          noticeId: 3,
          title: '시스템 업데이트 (7월 15일)',
          status: 'ARCHIVED',
          pinned: false,
          publishedAt: '2026-06-30T00:00:00Z',
          createdAt: '2026-06-29T05:30:00Z',
        },
      ],
    }),
  ),
];
