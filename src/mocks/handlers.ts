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

  // 스테이징 라벨 목록 (03 §8-1, status 필터)
  http.get('*/api/v1/admin/staging/labels', ({ request }) => {
    const status = new URL(request.url).searchParams.get('status');
    const all = [
      {
        label: '2026-04-25-update',
        unitId: 12,
        description: '배열 챕터 5번째 사이클',
        status: 'PENDING',
        createdAt: '2026-04-25T00:00:00Z',
      },
      {
        label: '2026-04-24-update',
        unitId: 13,
        description: '연결리스트 사이클',
        status: 'PENDING',
        createdAt: '2026-04-24T00:00:00Z',
      },
      {
        label: '2026-04-23-update',
        unitId: 14,
        description: '스택과 큐 사이클',
        status: 'COMPLETED',
        createdAt: '2026-04-23T00:00:00Z',
      },
    ];
    const content = status ? all.filter((label) => label.status === status) : all;
    return HttpResponse.json({ page: 1, totalPages: 1, hasNextPage: false, content });
  }),

  // 유저 목록 (03 §5-1, search/status/role 필터)
  http.get('*/api/v1/admin/users', ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.toLowerCase();
    const status = url.searchParams.get('status');
    const role = url.searchParams.get('role');
    const all = [
      { userId: 1001, email: 'gildong@example.com', nickname: '홍길동', handle: 'gildong', role: 'USER', status: 'ACTIVE', createdAt: '2026-01-15T03:22:00Z' },
      { userId: 1002, email: 'admin@gravit.com', nickname: '운영자', handle: 'admin', role: 'ADMIN', status: 'ACTIVE', createdAt: '2025-12-01T00:00:00Z' },
      { userId: 1003, email: 'suspended@example.com', nickname: '정지된유저', handle: 'onhold', role: 'USER', status: 'SUSPENDED', createdAt: '2026-02-20T10:00:00Z' },
      { userId: 1004, email: 'left@example.com', nickname: '탈퇴유저', handle: 'gone', role: 'USER', status: 'DELETED', createdAt: '2026-03-05T08:30:00Z' },
    ];
    let content = all;
    if (search) {
      content = content.filter(
        (u) =>
          u.email.toLowerCase().includes(search) ||
          u.nickname.includes(search) ||
          u.handle.toLowerCase().includes(search),
      );
    }
    if (status) content = content.filter((u) => u.status === status);
    if (role) content = content.filter((u) => u.role === role);
    return HttpResponse.json({ page: 1, totalPages: 1, hasNextPage: false, content });
  }),

  // 유저 상세 (03 §5-2)
  http.get('*/api/v1/admin/users/:userId', ({ params }) =>
    HttpResponse.json({
      userId: Number(params.userId),
      email: 'gildong@example.com',
      nickname: '홍길동',
      handle: 'gildong',
      profileImgNumber: 3,
      role: 'USER',
      status: 'ACTIVE',
      level: 12,
      createdAt: '2026-01-15T03:22:00Z',
    }),
  ),
  // 유저 상태/역할 변경 (03 §5-3/§5-4, 200)
  http.patch('*/api/v1/admin/users/:userId/status', () => new HttpResponse(null, { status: 200 })),
  http.patch('*/api/v1/admin/users/:userId/role', () => new HttpResponse(null, { status: 200 })),

  // 신고 목록 (03 §6-1, reportType/isResolved 필터)
  http.get('*/api/v1/admin/reports', ({ request }) => {
    const url = new URL(request.url);
    const reportType = url.searchParams.get('reportType');
    const isResolved = url.searchParams.get('isResolved');
    const all = [
      { reportId: 1024, reportType: 'TYPO_ERROR', problemId: 512, isResolved: false, submittedAt: '2026-04-23T14:32:00Z' },
      { reportId: 1023, reportType: 'ANSWER_ERROR', problemId: 488, isResolved: false, submittedAt: '2026-04-22T09:10:00Z' },
      { reportId: 1020, reportType: 'CONTENT_ERROR', problemId: 471, isResolved: true, submittedAt: '2026-04-20T18:45:00Z' },
      { reportId: 1015, reportType: 'OTHER_ERROR', problemId: 450, isResolved: true, submittedAt: '2026-04-18T11:05:00Z' },
    ];
    let content = all;
    if (reportType) content = content.filter((r) => r.reportType === reportType);
    if (isResolved !== null) content = content.filter((r) => r.isResolved === (isResolved === 'true'));
    return HttpResponse.json({ page: 1, totalPages: 1, hasNextPage: false, content });
  }),

  // 신고 상세 (03 §6-2)
  http.get('*/api/v1/admin/reports/:reportId', ({ params }) =>
    HttpResponse.json({
      reportId: Number(params.reportId),
      reportType: 'TYPO_ERROR',
      problemId: 512,
      content: "두 번째 줄에서 '알고리듬'이 '알고리즘'으로 표기되어 있습니다. 오타로 보입니다.",
      isResolved: false,
      submittedAt: '2026-04-23T14:32:00Z',
    }),
  ),
  // 신고 처리상태 변경 (03 §6-3, 200)
  http.patch('*/api/v1/admin/reports/:reportId/status', () => new HttpResponse(null, { status: 200 })),
];
