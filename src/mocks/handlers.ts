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

  // 공지 작성 (03 §9-3, 201)
  http.post('*/api/v1/admin/notices', () =>
    HttpResponse.json(
      {
        noticeId: 999,
        title: '새 공지',
        summary: '',
        content: '',
        status: 'DRAFT',
        pinned: false,
        publishedAt: null,
        createdAt: '2026-06-05T00:00:00Z',
      },
      { status: 201 },
    ),
  ),

  // 공지 상세 (03 §9-2)
  http.get('*/api/v1/admin/notices/:noticeId', ({ params }) =>
    HttpResponse.json({
      noticeId: Number(params.noticeId),
      title: '서비스 점검 안내 (5월 11일)',
      summary: '정기 점검으로 인한 서비스 이용 제한 안내',
      content:
        '## 점검 안내\n\n안녕하세요. Gravit 운영팀입니다.\n\n- 일시: 2026-05-11 02:00 ~ 04:00 (KST)\n- 대상: 전체 서비스\n\n이용에 참고 부탁드립니다.',
      status: 'PUBLISHED',
      pinned: true,
      publishedAt: '2026-04-25T00:00:00Z',
      createdAt: '2026-04-24T05:30:00Z',
    }),
  ),

  // 공지 수정 (03 §9-4, 200)
  http.patch('*/api/v1/admin/notices/:noticeId', () => new HttpResponse(null, { status: 200 })),

  // 공지 삭제 (03 §9-5, 204 soft delete)
  http.delete('*/api/v1/admin/notices/:noticeId', () => new HttpResponse(null, { status: 204 })),

  // 챕터 목록 (03 §7-1)
  http.get('*/api/v1/admin/chapters', () =>
    HttpResponse.json({
      page: 1,
      totalPages: 1,
      hasNextPage: false,
      content: [
        {
          chapterId: 1,
          title: '자료구조 기초',
          description: '배열, 리스트, 스택, 큐, 트리, 그래프 등 기본 자료구조',
        },
        {
          chapterId: 2,
          title: '알고리즘 입문',
          description: '정렬, 탐색, 재귀, 분할정복 등 기본 알고리즘',
        },
        {
          chapterId: 3,
          title: '운영체제',
          description: '프로세스, 스레드, 스케줄링, 메모리 관리',
        },
      ],
    }),
  ),
];
