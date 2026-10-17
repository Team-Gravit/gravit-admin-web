import { delay, http, HttpResponse } from 'msw';
import { env } from '@/env';

/**
 * QA(gravit-qa) MSW 핸들러 (decisions D9-4, QA_SPEC 결정 #6·E절 MSW 시나리오).
 * QA 서버가 배포되기 전까지 개발·화면 검증은 이 목업으로 한다. 메모리 DB 라 새로고침하면 초기 픽스처로 돌아간다.
 *
 * 시나리오 전환 — 페이지 URL 에 `?qaMock=` 를 붙인다(그 페이지의 QA 요청 전체에 적용):
 *   empty → 스프린트 0개 / 403 → ADMIN 아님 / 503 → 인증 서버 판정 불가
 *   401once → 첫 QA 요청만 401(토큰 만료) — 공유 재발급 후 1회 재시도 경로 확인용
 * 스프린트 등록: URL 에 32자리 hex 페이지 ID 가 없으면 400, ID 가 `0000` 으로 시작하면 404(Notion 미발견),
 *   이미 등록된 페이지 ID 면 409.
 * 오류 본문의 `error` 값은 목업이다(실제 코드 목록 미확정, QA_SPEC G3). 프론트는 HTTP 상태로만 분기한다.
 */
const QA = env.VITE_QA_API_BASE;

type Part = 'SERVER' | 'WEB' | 'APP';
type SprintStatus = 'DRAFT' | 'PREPARING' | 'PREPARE_FAILED' | 'REVIEW' | 'IN_PROGRESS' | 'CLOSED';
type Stage = 'PREPARE' | 'REVIEW' | 'CHECK' | 'CLOSE' | 'DONE';

interface MockBlocker {
  code: string;
  count: number | null;
  part: Part | null;
}

interface MockBaselineRepo {
  repo: 'gravit-server' | 'gravit-web' | 'gravit-aos';
  branch: string;
  commitSha: string;
  previousCommitSha: string | null;
  compareUrl: string | null;
  aosVersionCode: number | null;
  aosVersionName: string | null;
  versionCodeWarning: boolean;
}

interface MockSprint {
  id: number;
  sprintKey: string;
  periodStart: string | null;
  periodEnd: string | null;
  status: SprintStatus;
  progress: Array<{
    part: Part;
    total: number;
    pass: number;
    fail: number;
    unchecked: number;
    notApplicable: number;
  }>;
  guide: {
    stage: Stage;
    stageIndex: number;
    stageCount: number;
    nextAction: string;
    blockers: MockBlocker[];
  };
  notionPageId: string;
  figmaFileKey: string | null;
  baseline: {
    id: number;
    previousBaselineId: number | null;
    createdAt: string;
    repos: MockBaselineRepo[];
  } | null;
  latestSetupJobId: number | null;
  preparedAt: string | null;
  confirmedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  createdBy: number;
  version: number;
}

// ---------- 픽스처 헬퍼 ----------
type Counts = [pass: number, fail: number, unchecked: number, notApplicable: number];

function progress(rows: Record<Part, Counts>): MockSprint['progress'] {
  return (['SERVER', 'WEB', 'APP'] as const).map((part) => {
    const [pass, fail, unchecked, notApplicable] = rows[part];
    return { part, total: pass + fail + unchecked, pass, fail, unchecked, notApplicable };
  });
}

const EMPTY_PROGRESS = progress({ SERVER: [0, 0, 0, 0], WEB: [0, 0, 0, 0], APP: [0, 0, 0, 0] });

function guide(
  stage: Stage,
  nextAction: string,
  blockers: MockBlocker[] = [],
): MockSprint['guide'] {
  const stageIndex = { PREPARE: 1, REVIEW: 2, CHECK: 3, CLOSE: 4, DONE: 5 }[stage];
  return { stage, stageIndex, stageCount: 5, nextAction, blockers };
}

function repo(
  name: MockBaselineRepo['repo'],
  commitSha: string,
  previousCommitSha: string | null,
  aos?: { code: number; name: string; warning: boolean },
): MockBaselineRepo {
  return {
    repo: name,
    branch: 'release',
    commitSha,
    previousCommitSha,
    compareUrl: previousCommitSha
      ? `https://github.com/Team-Gravit/${name}/compare/${previousCommitSha.slice(0, 7)}...${commitSha.slice(0, 7)}`
      : null,
    aosVersionCode: aos?.code ?? null,
    aosVersionName: aos?.name ?? null,
    versionCodeWarning: aos?.warning ?? false,
  };
}

const SHA = {
  server1: 'a3f9c210d4b6e8f01234567890abcdef12345678',
  server2: 'e8b17a94c2d03f5a6b7c8d9e0f1a2b3c4d5e6f70',
  web1: '5c0de1f2a3b4c5d6e7f8091a2b3c4d5e6f708192',
  web2: '9d2e4f60718293a4b5c6d7e8f90a1b2c3d4e5f60',
  aos1: '0b1c2d3e4f5061728394a5b6c7d8e9f00112233a',
  aos2: '7f6e5d4c3b2a19080706f5e4d3c2b1a098765432',
};

let sprints: MockSprint[] = [
  {
    id: 6,
    sprintKey: '3rd Agile',
    periodStart: '2026-07-01',
    periodEnd: '2026-10-23',
    status: 'DRAFT',
    progress: EMPTY_PROGRESS,
    guide: guide('PREPARE', 'START_SETUP'),
    notionPageId: '28a1c3e5-9f0b-4d7e-8a6c-2b4d6f8a0c1e',
    figmaFileKey: null,
    baseline: null,
    latestSetupJobId: null,
    preparedAt: null,
    confirmedAt: null,
    closedAt: null,
    createdAt: '2026-10-16T09:30:00+09:00',
    createdBy: 1002,
    version: 0,
  },
  {
    id: 5,
    sprintKey: '2nd Agile 핫픽스 2',
    periodStart: null,
    periodEnd: null,
    status: 'PREPARING',
    progress: EMPTY_PROGRESS,
    guide: guide('PREPARE', 'WAIT_SETUP', [{ code: 'SETUP_IN_PROGRESS', count: null, part: null }]),
    notionPageId: '1f3e5d7c-9b1a-4c2e-8d4f-6a8b0c2e4f61',
    figmaFileKey: 'hu4c6qCEMB62qHXk2v8Gsl',
    baseline: {
      id: 41,
      previousBaselineId: 31,
      createdAt: '2026-10-17T09:52:00+09:00',
      repos: [
        repo('gravit-server', SHA.server2, SHA.server1),
        repo('gravit-web', SHA.web2, SHA.web1),
        repo('gravit-aos', SHA.aos2, SHA.aos1, { code: 42, name: '1.4.2', warning: false }),
      ],
    },
    latestSetupJobId: 501,
    preparedAt: null,
    confirmedAt: null,
    closedAt: null,
    createdAt: '2026-10-15T14:10:00+09:00',
    createdBy: 1002,
    version: 2,
  },
  {
    id: 4,
    sprintKey: '2nd Agile 핫픽스 1',
    periodStart: null,
    periodEnd: null,
    status: 'PREPARE_FAILED',
    progress: EMPTY_PROGRESS,
    guide: guide('PREPARE', 'RETRY_SETUP', [
      { code: 'RELEASE_BRANCH_MISSING', count: null, part: null },
    ]),
    notionPageId: '0e2d4c6b-8a9f-4e1d-9c3b-5a7f9e1d3c5b',
    figmaFileKey: 'hu4c6qCEMB62qHXk2v8Gsl',
    baseline: null,
    latestSetupJobId: 401,
    preparedAt: null,
    confirmedAt: null,
    closedAt: null,
    createdAt: '2026-10-08T11:00:00+09:00',
    createdBy: 1002,
    version: 3,
  },
  {
    id: 3,
    sprintKey: '2nd Agile',
    periodStart: '2026-04-06',
    periodEnd: '2026-06-26',
    status: 'REVIEW',
    progress: progress({ SERVER: [0, 0, 18, 4], WEB: [0, 0, 15, 7], APP: [0, 0, 12, 10] }),
    guide: guide('REVIEW', 'REVIEW_ITEMS', [
      { code: 'PROPOSED_ITEMS_REMAINING', count: 7, part: null },
    ]),
    notionPageId: '9c8b7a6f-5e4d-4c3b-a291-807f6e5d4c3b',
    figmaFileKey: 'hu4c6qCEMB62qHXk2v8Gsl',
    baseline: {
      id: 31,
      previousBaselineId: 21,
      createdAt: '2026-06-24T16:20:00+09:00',
      repos: [
        repo('gravit-server', SHA.server1, null),
        repo('gravit-web', SHA.web1, null),
        repo('gravit-aos', SHA.aos1, null, { code: 41, name: '1.4.1', warning: true }),
      ],
    },
    latestSetupJobId: 301,
    preparedAt: '2026-06-24T16:41:00+09:00',
    confirmedAt: null,
    closedAt: null,
    createdAt: '2026-06-24T16:18:00+09:00',
    createdBy: 1002,
    version: 5,
  },
  {
    id: 2,
    sprintKey: '1st Agile 핫픽스',
    periodStart: null,
    periodEnd: null,
    status: 'IN_PROGRESS',
    progress: progress({ SERVER: [12, 2, 6, 4], WEB: [8, 1, 9, 6], APP: [3, 0, 13, 8] }),
    guide: guide('CHECK', 'CHECK_CELLS', [
      { code: 'UNCHECKED_CELLS_REMAINING', count: 6, part: 'SERVER' },
      { code: 'UNCHECKED_CELLS_REMAINING', count: 9, part: 'WEB' },
      { code: 'UNCHECKED_CELLS_REMAINING', count: 13, part: 'APP' },
    ]),
    notionPageId: '3b5d7f91-a2c4-4e6f-8b0d-2f4a6c8e0b2d',
    figmaFileKey: 'hu4c6qCEMB62qHXk2v8Gsl',
    baseline: {
      id: 21,
      previousBaselineId: 11,
      createdAt: '2026-04-01T10:05:00+09:00',
      repos: [
        repo('gravit-server', SHA.server1, null),
        repo('gravit-web', SHA.web1, null),
        repo('gravit-aos', SHA.aos1, null, { code: 40, name: '1.4.0', warning: false }),
      ],
    },
    latestSetupJobId: 201,
    preparedAt: '2026-04-01T10:31:00+09:00',
    confirmedAt: '2026-04-02T15:00:00+09:00',
    closedAt: null,
    createdAt: '2026-04-01T10:00:00+09:00',
    createdBy: 1002,
    version: 9,
  },
  {
    id: 1,
    sprintKey: '1st Agile',
    periodStart: '2026-01-05',
    periodEnd: '2026-03-27',
    status: 'CLOSED',
    progress: progress({ SERVER: [22, 1, 0, 3], WEB: [19, 0, 0, 6], APP: [17, 2, 0, 7] }),
    guide: guide('DONE', 'NONE'),
    notionPageId: '7e9a1c3e-5b7d-4f91-a3c5-e7092b4d6f80',
    figmaFileKey: 'hu4c6qCEMB62qHXk2v8Gsl',
    baseline: {
      id: 11,
      previousBaselineId: null,
      createdAt: '2026-03-20T09:00:00+09:00',
      repos: [
        repo('gravit-server', SHA.server1, null),
        repo('gravit-web', SHA.web1, null),
        repo('gravit-aos', SHA.aos1, null, { code: 39, name: '1.3.9', warning: false }),
      ],
    },
    latestSetupJobId: 101,
    preparedAt: '2026-03-20T09:24:00+09:00',
    confirmedAt: '2026-03-20T13:00:00+09:00',
    closedAt: '2026-03-27T18:30:00+09:00',
    createdAt: '2026-03-20T08:55:00+09:00',
    createdBy: 1002,
    version: 14,
  },
];

// ---------- 공통 ----------
function scenario(): string | null {
  return new URLSearchParams(window.location.search).get('qaMock');
}

function errorResponse(status: number, error: string, message: string) {
  return HttpResponse.json({ error, message }, { status });
}

let unauthorizedServed = false;

/** `?qaMock=403|503` 이면 모든 QA 요청을 그 상태로 실패시킨다. `401once` 는 첫 요청 한 번만 401. */
function forcedFailure() {
  const s = scenario();
  if (s === '401once' && !unauthorizedServed) {
    unauthorizedServed = true;
    return errorResponse(401, 'UNAUTHORIZED', '토큰이 만료되었습니다.');
  }
  if (s === '503') return errorResponse(503, 'AUTH_SERVER_UNAVAILABLE', '인증 서버 판정 불가');
  if (s === '403') return errorResponse(403, 'FORBIDDEN', 'ADMIN 권한이 필요합니다.');
  return null;
}

function toSummary(s: MockSprint) {
  const { id, sprintKey, periodStart, periodEnd, status, progress: p, guide: g } = s;
  return { id, sprintKey, periodStart, periodEnd, status, progress: p, guide: g };
}

/** QA 계약의 datetime 형태(`+09:00` 오프셋 ISO 8601)로 현재 시각. */
function nowKst(): string {
  return `${new Date(Date.now() + 9 * 3_600_000).toISOString().slice(0, 19)}+09:00`;
}

export const qaHandlers = [
  // #1 listSprints — 최신 생성순, status 필터
  http.get(`${QA}/sprints`, async ({ request }) => {
    await delay();
    const failure = forcedFailure();
    if (failure) return failure;
    if (scenario() === 'empty') return HttpResponse.json([]);

    const status = new URL(request.url).searchParams.get('status');
    const list = sprints
      .filter((s) => !status || s.status === status)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(toSummary);
    return HttpResponse.json(list);
  }),

  // #2 createSprint — Notion 페이지 URL 로 DRAFT 스프린트 생성
  http.post(`${QA}/sprints`, async ({ request }) => {
    await delay();
    const failure = forcedFailure();
    if (failure) return failure;

    const body = (await request.json()) as { notionPageUrl?: string };
    const pageId = body.notionPageUrl?.match(/[0-9a-f]{32}/i)?.[0]?.toLowerCase();
    if (!pageId) return errorResponse(400, 'INVALID_NOTION_URL', 'Notion 페이지 URL이 아닙니다.');
    if (pageId.startsWith('0000')) {
      return errorResponse(404, 'NOTION_PAGE_NOT_FOUND', 'Notion page not found');
    }
    if (sprints.some((s) => s.notionPageId.replace(/-/g, '') === pageId)) {
      return errorResponse(409, 'SPRINT_DUPLICATED', 'Sprint already exists');
    }

    const id = Math.max(...sprints.map((s) => s.id)) + 1;
    const notionPageId = [
      pageId.slice(0, 8),
      pageId.slice(8, 12),
      pageId.slice(12, 16),
      pageId.slice(16, 20),
      pageId.slice(20),
    ].join('-');
    const created: MockSprint = {
      id,
      sprintKey: `${id - 3}th Agile`,
      periodStart: null,
      periodEnd: null,
      status: 'DRAFT',
      progress: EMPTY_PROGRESS,
      guide: guide('PREPARE', 'START_SETUP'),
      notionPageId,
      figmaFileKey: null,
      baseline: null,
      latestSetupJobId: null,
      preparedAt: null,
      confirmedAt: null,
      closedAt: null,
      createdAt: nowKst(),
      createdBy: 1002,
      version: 0,
    };
    sprints = [created, ...sprints];
    return HttpResponse.json(created, { status: 201 });
  }),
];
