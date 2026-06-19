import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('*/api/v1/oauth/login-url/:provider', ({ params }) =>
    HttpResponse.json({
      loginUrl: `${window.location.origin}/login/oauth2/code/${params.provider}?code=mock-code`,
    }),
  ),
  http.post('*/api/v1/oauth/:provider', () =>
    HttpResponse.json({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      isOnboarded: true,
      role: 'ADMIN',
    }),
  ),
  http.post('*/api/v1/auth/reissue', () => HttpResponse.json({ accessToken: 'mock-access-token' })),

  http.get('*/api/v1/admin/me', () =>
    HttpResponse.json({
      adminId: 1002,
      nickname: '운영자',
      email: 'admin@gravit.com',
      profileImgNumber: 3,
    }),
  ),

  http.get('*/api/v1/admin/dashboard/summary', () =>
    HttpResponse.json({
      totalUsers: 12345,
      pendingLabelsCount: 8,
      unresolvedReportsCount: 24,
    }),
  ),

  http.get('*/api/v1/admin/notices', () =>
    HttpResponse.json({
      page: 1,
      totalPages: 1,
      hasNext: false,
      contents: [
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

  http.patch('*/api/v1/admin/notices/:noticeId', () => new HttpResponse(null, { status: 200 })),

  http.delete('*/api/v1/admin/notices/:noticeId', () => new HttpResponse(null, { status: 204 })),

  http.get('*/api/v1/admin/chapters', () =>
    HttpResponse.json({
      page: 1,
      totalPages: 1,
      hasNext: false,
      contents: [
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

  http.get('*/api/v1/admin/chapters/:chapterId/stats', () =>
    HttpResponse.json({
      units: [
        { unitId: 12, unitTitle: '배열 (Array)', averageProgress: 79, participantCount: 2300 },
        { unitId: 13, unitTitle: '연결 리스트', averageProgress: 64, participantCount: 1820 },
        { unitId: 14, unitTitle: '스택과 큐', averageProgress: 58, participantCount: 1540 },
      ],
    }),
  ),

  http.get('*/api/v1/admin/chapters/:chapterId/units', () =>
    HttpResponse.json({
      page: 1,
      totalPages: 1,
      hasNext: false,
      contents: [
        { unitId: 12, title: '배열', description: '배열의 개념과 활용' },
        { unitId: 13, title: '연결 리스트', description: '노드 기반 선형 자료구조' },
        { unitId: 14, title: '스택과 큐', description: 'LIFO/FIFO 자료구조' },
        { unitId: 15, title: '트리', description: '계층적 자료구조' },
      ],
    }),
  ),

  http.get('*/api/v1/admin/chapters/:chapterId', ({ params }) =>
    HttpResponse.json({
      chapterId: Number(params.chapterId),
      title: '자료구조 기초',
      description: '배열, 리스트, 스택, 큐, 트리, 그래프 등 기본 자료구조',
      unitCount: 4,
    }),
  ),

  http.patch('*/api/v1/admin/chapters/:chapterId', () => new HttpResponse(null, { status: 200 })),

  http.get('*/api/v1/admin/units/:unitId/lessons', () =>
    HttpResponse.json({
      page: 1,
      totalPages: 1,
      hasNext: false,
      contents: [
        { lessonId: 901, title: '배열이란 무엇인가' },
        { lessonId: 902, title: '배열의 시간 복잡도' },
      ],
    }),
  ),

  http.get('*/api/v1/admin/units/:unitId', ({ params }) =>
    HttpResponse.json({
      unitId: Number(params.unitId),
      chapterId: 1,
      title: '배열 (Array)',
      description: '배열의 기본 개념과 시간 복잡도',
      lessonCount: 2,
    }),
  ),

  http.patch('*/api/v1/admin/units/:unitId', () => new HttpResponse(null, { status: 200 })),

  http.get('*/api/v1/admin/lessons/:lessonId/problems', () =>
    HttpResponse.json({
      page: 1,
      totalPages: 1,
      hasNext: false,
      contents: [
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

  http.get('*/api/v1/admin/lessons/:lessonId', ({ params }) =>
    HttpResponse.json({
      lessonId: Number(params.lessonId),
      unitId: 12,
      title: '배열의 시간 복잡도',
      problemCount: 3,
    }),
  ),

  http.patch('*/api/v1/admin/lessons/:lessonId', () => new HttpResponse(null, { status: 200 })),

  http.get('*/api/v1/admin/problems/:problemId', ({ params }) => {
    const problemId = Number(params.problemId);
    if (problemId === 1003 || problemId === 513) {
      return HttpResponse.json({
        problemId,
        lessonId: 901,
        problemType: 'SUBJECTIVE',
        instruction: '배열에서 임의 위치에 요소를 삽입할 때의 시간 복잡도를 빅오 표기법으로 쓰시오.',
        content: '배열은 연속된 메모리에 저장되므로 중간 삽입 시 원소 이동이 발생한다.',
        answer: { answerId: 1, content: 'O(n),O(N),빅오 n', explanation: '평균적으로 n개 원소를 이동해야 합니다.' },
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

  http.patch('*/api/v1/admin/problems/:problemId/objective', () => new HttpResponse(null, { status: 200 })),
  http.patch('*/api/v1/admin/problems/:problemId/subjective', () => new HttpResponse(null, { status: 200 })),

  http.get('*/api/v1/admin/staging/labels', ({ request }) => {
    const status = new URL(request.url).searchParams.get('status');
    const all = [
      {
        label: '2026-04-25-a3f9',
        unitId: 12,
        description: '배열 챕터 5번째 사이클',
        status: 'PENDING',
        createdAt: '2026-04-25T00:00:00Z',
      },
      {
        label: '2026-04-24-b7c2',
        unitId: 13,
        description: '연결리스트 사이클',
        status: 'PENDING',
        createdAt: '2026-04-24T00:00:00Z',
      },
      {
        label: '2026-04-23-d4e1',
        unitId: 14,
        description: '스택과 큐 사이클',
        status: 'COMPLETED',
        createdAt: '2026-04-23T00:00:00Z',
      },
    ];
    const content = status ? all.filter((label) => label.status === status) : all;
    return HttpResponse.json({ page: 1, totalPages: 1, hasNext: false, contents: content });
  }),

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
        content: '0,영,zero',
        explanation: '배열 인덱스는 0부터 시작합니다.',
      },
    });
    const status = String(params.label) === '2026-04-23-d4e1' ? 'COMPLETED' : 'PENDING';
    return HttpResponse.json({
      label: String(params.label),
      unitId: 12,
      description: '배열 챕터 5번째 사이클',
      status,
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

  http.patch('*/api/v1/admin/staging/lessons/:lessonId', () => new HttpResponse(null, { status: 200 })),

  http.patch('*/api/v1/admin/staging/problems/:problemId', () => new HttpResponse(null, { status: 200 })),

  http.patch('*/api/v1/admin/staging/options/:optionId', () => new HttpResponse(null, { status: 200 })),

  http.patch('*/api/v1/admin/staging/answers/:answerId', () => new HttpResponse(null, { status: 200 })),

  // 스테이징 promote PENDING→COMPLETED (03 §8-7, 200). ⚠️ 실제 prod INSERT는 백엔드/사람 — 여기선 mock.
  http.patch('*/api/v1/admin/staging/labels/:label/status', () => new HttpResponse(null, { status: 200 })),

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
    return HttpResponse.json({ page: 1, totalPages: 1, hasNext: false, contents: content });
  }),

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
  http.patch('*/api/v1/admin/users/:userId/status', () => new HttpResponse(null, { status: 200 })),
  http.patch('*/api/v1/admin/users/:userId/role', () => new HttpResponse(null, { status: 200 })),

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
    return HttpResponse.json({ page: 1, totalPages: 1, hasNext: false, contents: content });
  }),

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
  http.patch('*/api/v1/admin/reports/:reportId/status', () => new HttpResponse(null, { status: 200 })),

  // 문의 목록 (inquiry-handoff A-2-1, status 필터). ⚠️ hasNext/contents/1-base, datetime Z 없음.
  http.get('*/api/v1/admin/inquiries', ({ request }) => {
    const status = new URL(request.url).searchParams.get('status');
    const all = [
      { inquiryId: 5004, title: '앱이 자꾸 튕겨요', type: 'BUG_REPORT', status: 'PENDING', submitterId: 1010, submitterNickname: '이버그', createdAt: '2026-06-18T20:30:00' },
      { inquiryId: 5003, title: '다크 모드도 만들어주세요', type: 'FEATURE_SUGGESTION', status: 'PENDING', submitterId: 1007, submitterNickname: null, createdAt: '2026-06-17T11:05:00' },
      { inquiryId: 5002, title: '3번 문제 정답이 이상합니다', type: 'CONTENT_ERROR', status: 'RESOLVED', submitterId: 1003, submitterNickname: '김코딩', createdAt: '2026-06-16T15:40:00' },
      { inquiryId: 5001, title: '결제했는데 코인이 안 들어와요', type: 'OTHER', status: 'PENDING', submitterId: 1001, submitterNickname: '홍길동', createdAt: '2026-06-15T09:12:00' },
    ];
    const contents = status ? all.filter((i) => i.status === status) : all;
    return HttpResponse.json({ page: 1, totalPages: 1, hasNext: false, contents });
  }),

  http.get('*/api/v1/admin/inquiries/:inquiryId', ({ params }) => {
    const inquiryId = Number(params.inquiryId);
    const resolved = inquiryId === 5002;
    const withdrawn = inquiryId === 5003;
    return HttpResponse.json({
      inquiryId,
      title: resolved ? '3번 문제 정답이 이상합니다' : '결제했는데 코인이 안 들어와요',
      type: resolved ? 'CONTENT_ERROR' : 'OTHER',
      content:
        '안녕하세요. 어제 10,000원 결제를 완료했는데 코인이 충전되지 않았습니다.\n주문번호는 ORD-20260615-0012 입니다. 확인 부탁드립니다.',
      status: resolved ? 'RESOLVED' : 'PENDING',
      submitterId: 1001,
      submitterNickname: withdrawn ? null : '홍길동',
      submitterEmail: withdrawn ? null : 'gildong@example.com',
      createdAt: '2026-06-15T09:12:00',
      updatedAt: '2026-06-15T09:12:00',
      answer: resolved
        ? {
            answerId: 8001,
            content: '확인 결과 정답 데이터에 오류가 있어 수정했습니다. 불편을 드려 죄송합니다.',
            adminId: 1002,
            answeredAt: '2026-06-16T16:00:00',
            updatedAt: '2026-06-16T16:00:00',
          }
        : null,
    });
  }),

  http.post('*/api/v1/admin/inquiries/:inquiryId/answer', async ({ params, request }) => {
    const inquiryId = Number(params.inquiryId);
    const body = (await request.json()) as { content: string };
    return HttpResponse.json(
      {
        inquiryId,
        title: '결제했는데 코인이 안 들어와요',
        type: 'OTHER',
        content: '안녕하세요. 어제 10,000원 결제를 완료했는데 코인이 충전되지 않았습니다.',
        status: 'RESOLVED',
        submitterId: 1001,
        submitterNickname: '홍길동',
        submitterEmail: 'gildong@example.com',
        createdAt: '2026-06-15T09:12:00',
        updatedAt: '2026-06-19T10:00:00',
        answer: {
          answerId: 8001,
          content: body.content,
          adminId: 1002,
          answeredAt: '2026-06-19T10:00:00',
          updatedAt: '2026-06-19T10:00:00',
        },
      },
      { status: 201 },
    );
  }),

  http.put('*/api/v1/admin/inquiries/:inquiryId/answer', async ({ params, request }) => {
    const inquiryId = Number(params.inquiryId);
    const body = (await request.json()) as { content: string };
    return HttpResponse.json({
      inquiryId,
      title: '결제했는데 코인이 안 들어와요',
      type: 'OTHER',
      content: '안녕하세요. 어제 10,000원 결제를 완료했는데 코인이 충전되지 않았습니다.',
      status: 'RESOLVED',
      submitterId: 1001,
      submitterNickname: '홍길동',
      submitterEmail: 'gildong@example.com',
      createdAt: '2026-06-15T09:12:00',
      updatedAt: '2026-06-19T11:00:00',
      answer: {
        answerId: 8001,
        content: body.content,
        adminId: 1002,
        answeredAt: '2026-06-19T10:00:00',
        updatedAt: '2026-06-19T11:00:00',
      },
    });
  }),

  http.delete('*/api/v1/admin/inquiries/:inquiryId/answer', () => new HttpResponse(null, { status: 204 })),
];
