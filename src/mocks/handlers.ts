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

  // 챕터 풀이 현황 (03 §7-3) — :chapterId 보다 먼저(더 구체적 경로)
  http.get('*/api/v1/admin/chapters/:chapterId/stats', () =>
    HttpResponse.json({
      units: [
        { unitId: 12, unitTitle: '배열 (Array)', averageProgress: 79, participantCount: 2300 },
        { unitId: 13, unitTitle: '연결 리스트', averageProgress: 64, participantCount: 1820 },
        { unitId: 14, unitTitle: '스택과 큐', averageProgress: 58, participantCount: 1540 },
      ],
    }),
  ),

  // 챕터의 유닛 목록 (03 §7-5) — :chapterId 보다 먼저
  http.get('*/api/v1/admin/chapters/:chapterId/units', () =>
    HttpResponse.json({
      page: 1,
      totalPages: 1,
      hasNextPage: false,
      content: [
        { unitId: 12, title: '배열', description: '배열의 개념과 활용' },
        { unitId: 13, title: '연결 리스트', description: '노드 기반 선형 자료구조' },
        { unitId: 14, title: '스택과 큐', description: 'LIFO/FIFO 자료구조' },
        { unitId: 15, title: '트리', description: '계층적 자료구조' },
      ],
    }),
  ),

  // 챕터 상세 (03 §7-2)
  http.get('*/api/v1/admin/chapters/:chapterId', ({ params }) =>
    HttpResponse.json({
      chapterId: Number(params.chapterId),
      title: '자료구조 기초',
      description: '배열, 리스트, 스택, 큐, 트리, 그래프 등 기본 자료구조',
      unitCount: 4,
    }),
  ),

  // 챕터 수정 (03 §7-4, 200)
  http.patch('*/api/v1/admin/chapters/:chapterId', () => new HttpResponse(null, { status: 200 })),

  // 유닛의 레슨 목록 (03 §7-8) — :unitId 보다 먼저(더 구체적 경로)
  http.get('*/api/v1/admin/units/:unitId/lessons', () =>
    HttpResponse.json({
      page: 1,
      totalPages: 1,
      hasNextPage: false,
      content: [
        { lessonId: 901, title: '배열이란 무엇인가' },
        { lessonId: 902, title: '배열의 시간 복잡도' },
      ],
    }),
  ),

  // 유닛 상세 (03 §7-6)
  http.get('*/api/v1/admin/units/:unitId', ({ params }) =>
    HttpResponse.json({
      unitId: Number(params.unitId),
      chapterId: 1,
      title: '배열 (Array)',
      description: '배열의 기본 개념과 시간 복잡도',
      lessonCount: 2,
    }),
  ),

  // 유닛 수정 (03 §7-7, 200)
  http.patch('*/api/v1/admin/units/:unitId', () => new HttpResponse(null, { status: 200 })),

  // 레슨의 문제 목록 (03 §7-11) — :lessonId 보다 먼저(더 구체적 경로)
  http.get('*/api/v1/admin/lessons/:lessonId/problems', () =>
    HttpResponse.json({
      page: 1,
      totalPages: 1,
      hasNextPage: false,
      content: [
        {
          problemId: 1001,
          problemType: 'OBJECTIVE',
          instruction: '다음 중 배열의 임의 접근(random access) 시간 복잡도는?',
        },
        {
          problemId: 1002,
          problemType: 'OBJECTIVE',
          instruction: '정렬된 배열에서 특정 값을 탐색할 때 가장 효율적인 알고리즘의 시간 복잡도는?',
        },
        {
          problemId: 1003,
          problemType: 'SUBJECTIVE',
          instruction: '배열에서 임의 위치에 요소를 삽입할 때의 시간 복잡도를 빅오 표기법으로 쓰시오.',
        },
      ],
    }),
  ),

  // 레슨 상세 (03 §7-9)
  http.get('*/api/v1/admin/lessons/:lessonId', ({ params }) =>
    HttpResponse.json({
      lessonId: Number(params.lessonId),
      unitId: 12,
      title: '배열의 시간 복잡도',
      problemCount: 3,
    }),
  ),

  // 레슨 수정 (03 §7-10, 200)
  http.patch('*/api/v1/admin/lessons/:lessonId', () => new HttpResponse(null, { status: 200 })),

  // 문제 상세 (03 §7-12, problemType 분기). 1003·513 = 주관식(D1 단일 콤마), 그 외 객관식.
  http.get('*/api/v1/admin/problems/:problemId', ({ params }) => {
    const problemId = Number(params.problemId);
    if (problemId === 1003 || problemId === 513) {
      return HttpResponse.json({
        problemId,
        lessonId: 901,
        problemType: 'SUBJECTIVE',
        instruction: '배열에서 임의 위치에 요소를 삽입할 때의 시간 복잡도를 빅오 표기법으로 쓰시오.',
        content: '배열은 연속된 메모리에 저장되므로 중간 삽입 시 원소 이동이 발생한다.',
        answers: [
          { answerId: 1, content: 'O(n), O(N), 빅오 n', explanation: '평균적으로 n개 원소를 이동해야 합니다.' },
        ],
      });
    }
    return HttpResponse.json({
      problemId,
      lessonId: 901,
      problemType: 'OBJECTIVE',
      instruction: '다음 중 배열의 임의 접근(random access) 시간 복잡도는?',
      content: '배열은 인덱스를 통해 임의의 원소에 직접 접근할 수 있다.',
      options: [
        { optionId: 1, content: 'O(1)', explanation: '인덱스 계산으로 바로 접근 가능', isAnswer: true },
        { optionId: 2, content: 'O(log n)', explanation: '이진 탐색의 복잡도', isAnswer: false },
        { optionId: 3, content: 'O(n)', explanation: '선형 탐색의 복잡도', isAnswer: false },
        { optionId: 4, content: 'O(n²)', explanation: '이중 반복의 복잡도', isAnswer: false },
      ],
    });
  }),

  // 객관식/주관식 문제 수정 (03 §7-13/§7-14, 200)
  http.patch('*/api/v1/admin/problems/:problemId/objective', () => new HttpResponse(null, { status: 200 })),
  http.patch('*/api/v1/admin/problems/:problemId/subjective', () => new HttpResponse(null, { status: 200 })),

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

  // 라벨 상세 그루핑 (03 §8-2, 04 §10-2-1): 레슨 1 + 문제 6(객관식 4 + 주관식 2). 주관식=단일 answer 객체.
  http.get('*/api/v1/admin/staging/labels/:label', ({ params }) => {
    const objective = (problemId: number, instruction: string) => ({
      problemId,
      problemType: 'OBJECTIVE' as const,
      instruction,
      content: '아래 보기 중 옳은 것을 고르시오.',
      options: [
        { optionId: problemId * 10 + 1, content: 'O(1)', explanation: '인덱스로 바로 접근', isAnswer: true },
        { optionId: problemId * 10 + 2, content: 'O(log n)', explanation: '이진 탐색', isAnswer: false },
        { optionId: problemId * 10 + 3, content: 'O(n)', explanation: '선형 탐색', isAnswer: false },
        { optionId: problemId * 10 + 4, content: 'O(n²)', explanation: '이중 반복', isAnswer: false },
      ],
    });
    const subjective = (problemId: number, instruction: string) => ({
      problemId,
      problemType: 'SUBJECTIVE' as const,
      instruction,
      content: '빈칸에 들어갈 값을 쓰시오.',
      answer: {
        answerId: problemId * 10 + 1,
        content: '0, 영, zero',
        explanation: '배열 인덱스는 0부터 시작합니다.',
      },
    });
    return HttpResponse.json({
      label: String(params.label),
      unitId: 12,
      description: '배열 챕터 5번째 사이클',
      status: 'PENDING',
      createdAt: '2026-04-25T00:00:00Z',
      lesson: { lessonId: 901, title: '배열의 시간 복잡도 심화' },
      problems: [
        objective(1001, '배열의 임의 접근 시간 복잡도는?'),
        objective(1002, '정렬된 배열의 이진 탐색 시간 복잡도는?'),
        subjective(1003, '배열 인덱스가 시작하는 숫자를 쓰시오.'),
        objective(1004, '배열 끝 삽입의 평균 시간 복잡도는?'),
        subjective(1005, '연속된 메모리 구조의 이름을 쓰시오.'),
        objective(1006, '배열 중간 삽입의 시간 복잡도는?'),
      ],
    });
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
