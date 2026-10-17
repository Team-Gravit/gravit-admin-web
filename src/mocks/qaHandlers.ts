import { delay, http, HttpResponse } from 'msw';
import { env } from '@/env';
import {
  TEST_CATALOG,
  buildChecklist,
  cellsFor,
  progressOf,
  toChecklistResponse,
  toItemResponse,
  type MockBlock,
  type MockItem,
} from '@/mocks/qaChecklist';

/**
 * QA(gravit-qa) MSW 핸들러 (decisions D9-4, QA_SPEC 결정 #6·E절 MSW 시나리오).
 * QA 서버가 배포되기 전까지 개발·화면 검증은 이 목업으로 한다. 메모리 DB 라 새로고침하면 초기 픽스처로 돌아간다.
 *
 * 시나리오 전환 — 페이지 URL 에 `?qaMock=` 를 붙인다(그 페이지의 QA 요청 전체에 적용):
 *   empty → 스프린트 0개 / 403 → ADMIN 아님 / 503 → 인증 서버 판정 불가
 *   401once → 첫 QA 요청만 401(토큰 만료) — 공유 재발급 후 1회 재시도 경로 확인용
 *   retrywait → 실행 중인 준비 작업을 '재시도 대기(QUEUED + nextRunAt)' 로 보여 준다
 *   stale → 항목·셀 변경과 체크리스트 확정을 409(다른 운영자가 먼저 변경)로 실패시킨다
 * 체크리스트(qaChecklist.ts): 분류 검토 #3 · 체크 진행 #2 · 종료 #1 픽스처, 준비가 끝난 스프린트는 새 초안.
 *   진행률·다음 할 일은 셀에서 다시 계산한다. 자동 분류 테스트 ID 는 TEST_CATALOG 에 있어야 한다(아니면 422).
 * 준비 작업은 GET /jobs/:id 를 받을 때마다 한 단계씩 진행한다(INTERPRET 은 13개씩). 끝나면 스프린트가 REVIEW 로 바뀐다.
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

/** message 는 문자열 또는 필드별 오류 객체 (QA_SPEC A-0). */
function errorResponse(status: number, error: string, message: string | Record<string, string>) {
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

// ---------- 준비 작업 ----------
type JobStatus = 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';
type StepStatus = 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED' | 'SKIPPED';

interface MockStep {
  seq: number;
  name: string;
  status: StepStatus;
  message: string | null;
  startedAt: string | null;
  finishedAt: string | null;
}

interface MockJob {
  id: number;
  type: 'SETUP';
  sprintId: number;
  status: JobStatus;
  attempt: number;
  maxAttempts: number;
  nextRunAt: string | null;
  cancelRequested: boolean;
  lastError: string | null;
  steps: MockStep[];
  createdAt: string;
  finishedAt: string | null;
}

const STEP_NAMES = [
  'BASELINE',
  'NOTION',
  'FIGMA',
  'DIFF',
  'OPENAPI',
  'INTERPRET',
  'VALIDATE',
  'APPLY',
];
const FEATURE_COUNT = 53;
const INTERPRET_CHUNK = 13;

/** 단계가 끝났을 때의 message (목업 값). */
const DONE_MESSAGE: Record<string, string> = {
  BASELINE: 'release 저장소 3개',
  NOTION: '기능 53개',
  FIGMA: '프레임 49개',
  DIFF: '커밋 61개',
  OPENAPI: '엔드포인트 87개',
  INTERPRET: `${FEATURE_COUNT}/${FEATURE_COUNT}`,
  VALIDATE: '항목 214개',
  APPLY: '검토 전 항목 214개',
};

const pad = (n: number) => String(n).padStart(2, '0');

/** 전부 끝난 단계 목록 — 단계마다 1분 30초. */
function finishedSteps(date: string): MockStep[] {
  return STEP_NAMES.map((name, i) => ({
    seq: i + 1,
    name,
    status: 'DONE',
    message: DONE_MESSAGE[name] ?? null,
    startedAt: `${date}T10:${pad(i * 2)}:00+09:00`,
    finishedAt: `${date}T10:${pad(i * 2 + 1)}:30+09:00`,
  }));
}

function succeededJob(id: number, sprintId: number, date: string): MockJob {
  return {
    id,
    type: 'SETUP',
    sprintId,
    status: 'SUCCEEDED',
    attempt: 1,
    maxAttempts: 3,
    nextRunAt: null,
    cancelRequested: false,
    lastError: null,
    steps: finishedSteps(date),
    createdAt: `${date}T09:59:40+09:00`,
    finishedAt: `${date}T10:15:30+09:00`,
  };
}

const pendingSteps = (fromSeq: number): MockStep[] =>
  STEP_NAMES.slice(fromSeq - 1).map((name, i) => ({
    seq: fromSeq + i,
    name,
    status: 'PENDING',
    message: null,
    startedAt: null,
    finishedAt: null,
  }));

const jobs: MockJob[] = [
  succeededJob(101, 1, '2026-03-20'),
  succeededJob(201, 2, '2026-04-01'),
  succeededJob(301, 3, '2026-06-24'),
  {
    // 셋업 FAILED — BASELINE 에서 release 브랜치 없음(RELEASE_BRANCH_MISSING), 3회 모두 실패
    id: 401,
    type: 'SETUP',
    sprintId: 4,
    status: 'FAILED',
    attempt: 3,
    maxAttempts: 3,
    nextRunAt: null,
    cancelRequested: false,
    lastError:
      'RELEASE_BRANCH_MISSING: gravit-aos 저장소에 release 브랜치가 없습니다. (3회 시도 후 중단)',
    steps: [
      {
        seq: 1,
        name: 'BASELINE',
        status: 'FAILED',
        message: 'gravit-aos 저장소에서 release 브랜치를 찾지 못했습니다.',
        startedAt: '2026-10-08T11:15:02+09:00',
        finishedAt: '2026-10-08T11:15:04+09:00',
      },
      ...pendingSteps(2).map((st) => ({ ...st, status: 'SKIPPED' as const })),
    ],
    createdAt: '2026-10-08T11:01:00+09:00',
    finishedAt: '2026-10-08T11:15:04+09:00',
  },
  {
    // 셋업 RUNNING — INTERPRET 12/53
    id: 501,
    type: 'SETUP',
    sprintId: 5,
    status: 'RUNNING',
    attempt: 1,
    maxAttempts: 3,
    nextRunAt: null,
    cancelRequested: false,
    lastError: null,
    steps: [
      ...STEP_NAMES.slice(0, 5).map((name, i) => ({
        seq: i + 1,
        name,
        status: 'DONE' as const,
        message: DONE_MESSAGE[name] ?? null,
        startedAt: `2026-10-17T09:52:${pad(i * 10)}+09:00`,
        finishedAt: `2026-10-17T09:52:${pad(i * 10 + 8)}+09:00`,
      })),
      {
        seq: 6,
        name: 'INTERPRET',
        status: 'RUNNING',
        message: `12/${FEATURE_COUNT}`,
        startedAt: '2026-10-17T09:53:00+09:00',
        finishedAt: null,
      },
      ...pendingSteps(7),
    ],
    createdAt: '2026-10-17T09:52:00+09:00',
    finishedAt: null,
  },
];

let nextJobId = 601;
/** 준비 시작 전 스프린트 상태 — 취소되면 되돌린다. 픽스처 501 은 DRAFT 에서 시작했다고 본다. */
const statusBeforeSetup = new Map<number, SprintStatus>([[501, 'DRAFT']]);

function setSprintStatus(sprint: MockSprint, status: SprintStatus) {
  sprint.status = status;
  sprint.version += 1;
  if (status === 'DRAFT') sprint.guide = guide('PREPARE', 'START_SETUP');
  if (status === 'PREPARING') {
    sprint.guide = guide('PREPARE', 'WAIT_SETUP', [
      { code: 'SETUP_IN_PROGRESS', count: null, part: null },
    ]);
  }
  if (status === 'PREPARE_FAILED') sprint.guide = guide('PREPARE', 'RETRY_SETUP');
  if (status === 'REVIEW') sprint.preparedAt = nowKst();
  syncSprint(sprint);
}

// ---------- 체크리스트 ----------
const checklists = new Map<number, MockBlock[]>([
  [3, buildChecklist(3, 'review')],
  [2, buildChecklist(2, 'in-progress')],
  [1, buildChecklist(1, 'closed')],
]);
let nextItemId = 50_001;

/** 체크리스트가 있는 스프린트의 진행률·다음 할 일을 셀에서 다시 계산한다. */
function syncSprint(sprint: MockSprint) {
  const blocks = checklists.get(sprint.id);
  if (!blocks || !['REVIEW', 'IN_PROGRESS', 'CLOSED'].includes(sprint.status)) return;
  sprint.progress = progressOf(blocks);
  if (sprint.status === 'REVIEW') {
    const proposed = blocks
      .flatMap((b) => b.items)
      .filter((i) => i.reviewState === 'PROPOSED').length;
    sprint.guide =
      proposed > 0
        ? guide('REVIEW', 'REVIEW_ITEMS', [
            { code: 'PROPOSED_ITEMS_REMAINING', count: proposed, part: null },
          ])
        : guide('REVIEW', 'CONFIRM_CHECKLIST');
  } else if (sprint.status === 'IN_PROGRESS') {
    const blockers = sprint.progress
      .filter((p) => p.unchecked > 0)
      .map((p) => ({ code: 'UNCHECKED_CELLS_REMAINING', count: p.unchecked, part: p.part }));
    sprint.guide =
      blockers.length > 0
        ? guide('CHECK', 'CHECK_CELLS', blockers)
        : guide('CLOSE', 'CLOSE_SPRINT');
  } else {
    sprint.guide = guide('DONE', 'NONE');
  }
}

function findItem(itemId: number): { sprintId: number; item: MockItem } | null {
  for (const [sprintId, blocks] of checklists) {
    const item = blocks.flatMap((b) => b.items).find((i) => i.id === itemId);
    if (item) return { sprintId, item };
  }
  return null;
}

const staleFailure = () =>
  scenario() === 'stale'
    ? errorResponse(409, 'VERSION_CONFLICT', '다른 사용자가 먼저 변경했습니다.')
    : null;

/** BASELINE 단계가 끝나면 기준점을 기록한다(직전 기준점 = 가장 최근 다른 스프린트의 기준점). */
function recordBaseline(sprint: MockSprint) {
  if (sprint.baseline) return;
  sprint.baseline = {
    id: 900 + sprint.id,
    previousBaselineId: 41,
    createdAt: nowKst(),
    repos: [
      repo('gravit-server', SHA.server2, SHA.server1),
      repo('gravit-web', SHA.web2, SHA.web1),
      repo('gravit-aos', SHA.aos2, SHA.aos1, { code: 43, name: '1.4.3', warning: false }),
    ],
  };
}

const isActive = (job: MockJob) => job.status === 'QUEUED' || job.status === 'RUNNING';

/** GET /jobs/:id 마다 한 칸 진행. 취소 요청이면 진행 중인 단계를 마치고 멈춘다. */
function tick(job: MockJob) {
  if (!isActive(job)) return;
  const sprint = sprints.find((s) => s.id === job.sprintId);
  const now = nowKst();
  const update = (index: number, patch: Partial<MockStep>) => {
    const target = job.steps[index];
    if (target) job.steps[index] = { ...target, ...patch };
  };

  if (job.status === 'QUEUED') {
    if (job.cancelRequested) return finish(job, 'CANCELLED', sprint);
    job.status = 'RUNNING';
    update(0, { status: 'RUNNING', startedAt: now });
    return;
  }

  const i = job.steps.findIndex((st) => st.status === 'RUNNING');
  const current = job.steps[i];
  if (!current) return;

  if (current.name === 'INTERPRET' && !job.cancelRequested) {
    const done = Number(current.message?.split('/')[0] ?? 0) + INTERPRET_CHUNK;
    if (done < FEATURE_COUNT) return update(i, { message: `${done}/${FEATURE_COUNT}` });
  }

  update(i, { status: 'DONE', message: DONE_MESSAGE[current.name] ?? null, finishedAt: now });
  if (current.name === 'BASELINE' && sprint) recordBaseline(sprint);

  if (job.cancelRequested) return finish(job, 'CANCELLED', sprint);
  const next = job.steps[i + 1];
  if (!next) return finish(job, 'SUCCEEDED', sprint);
  update(i + 1, {
    status: 'RUNNING',
    startedAt: now,
    message: next.name === 'INTERPRET' ? `0/${FEATURE_COUNT}` : null,
  });
}

function finish(job: MockJob, status: 'SUCCEEDED' | 'CANCELLED', sprint: MockSprint | undefined) {
  job.status = status;
  job.finishedAt = nowKst();
  job.steps = job.steps.map((st) => (st.status === 'PENDING' ? { ...st, status: 'SKIPPED' } : st));
  if (!sprint) return;
  if (status === 'SUCCEEDED') {
    if (!checklists.has(sprint.id)) checklists.set(sprint.id, buildChecklist(sprint.id, 'fresh'));
    setSprintStatus(sprint, 'REVIEW');
  } else setSprintStatus(sprint, statusBeforeSetup.get(job.id) ?? 'DRAFT');
}

/** `?qaMock=retrywait` — 실행 중 작업을 1차 시도 실패 후 재시도 대기 상태로 보여 준다(진행하지 않음). */
function retryWaitView(job: MockJob): MockJob {
  return {
    ...job,
    status: 'QUEUED',
    attempt: 2,
    nextRunAt: `${new Date(Date.now() + 9 * 3_600_000 + 5 * 60_000).toISOString().slice(0, 19)}+09:00`,
    lastError: 'Notion API 응답 429 (요청 한도 초과)',
    steps: job.steps.map((st) =>
      st.name === 'NOTION'
        ? { ...st, status: 'FAILED', message: 'Notion API 응답 429 (요청 한도 초과)' }
        : st.seq > 2
          ? { ...st, status: 'PENDING', message: null, startedAt: null, finishedAt: null }
          : st,
    ),
  };
}

export const qaHandlers = [
  // #1 listSprints — 최신 생성순, status 필터
  http.get(`${QA}/sprints`, async ({ request }) => {
    await delay();
    const failure = forcedFailure();
    if (failure) return failure;
    if (scenario() === 'empty') return HttpResponse.json([]);

    const status = new URL(request.url).searchParams.get('status');
    sprints.forEach(syncSprint);
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

  // #3 getSprint
  http.get(`${QA}/sprints/:sprintId`, async ({ params }) => {
    await delay();
    const failure = forcedFailure();
    if (failure) return failure;
    const sprint = sprints.find((s) => s.id === Number(params.sprintId));
    if (!sprint) return errorResponse(404, 'SPRINT_NOT_FOUND', '스프린트를 찾을 수 없습니다.');
    syncSprint(sprint);
    return HttpResponse.json(sprint);
  }),

  // #5 startSetupJob — DRAFT·PREPARE_FAILED·REVIEW 에서만, 실행 중 작업이 있으면 409
  http.post(`${QA}/sprints/:sprintId/setup-jobs`, async ({ params }) => {
    await delay();
    const failure = forcedFailure();
    if (failure) return failure;
    const sprint = sprints.find((s) => s.id === Number(params.sprintId));
    if (!sprint) return errorResponse(404, 'SPRINT_NOT_FOUND', '스프린트를 찾을 수 없습니다.');
    const running = jobs.some((j) => j.sprintId === sprint.id && isActive(j));
    if (running || !['DRAFT', 'PREPARE_FAILED', 'REVIEW'].includes(sprint.status)) {
      return errorResponse(
        409,
        'SETUP_NOT_ALLOWED',
        '지금 상태에서는 준비 작업을 시작할 수 없습니다.',
      );
    }

    const job: MockJob = {
      id: nextJobId++,
      type: 'SETUP',
      sprintId: sprint.id,
      status: 'QUEUED',
      attempt: 1,
      maxAttempts: 3,
      nextRunAt: null,
      cancelRequested: false,
      lastError: null,
      steps: pendingSteps(1),
      createdAt: nowKst(),
      finishedAt: null,
    };
    jobs.push(job);
    statusBeforeSetup.set(job.id, sprint.status);
    sprint.latestSetupJobId = job.id;
    setSprintStatus(sprint, 'PREPARING');
    return HttpResponse.json(job, { status: 202 });
  }),

  // #6 getJob — 받을 때마다 한 칸 진행
  http.get(`${QA}/jobs/:jobId`, async ({ params }) => {
    await delay();
    const failure = forcedFailure();
    if (failure) return failure;
    const job = jobs.find((j) => j.id === Number(params.jobId));
    if (!job) return errorResponse(404, 'JOB_NOT_FOUND', '작업을 찾을 수 없습니다.');
    if (scenario() === 'retrywait' && isActive(job)) return HttpResponse.json(retryWaitView(job));
    tick(job);
    return HttpResponse.json(job);
  }),

  // #7 cancelJob — 끝난 작업이면 409
  http.post(`${QA}/jobs/:jobId/cancel`, async ({ params }) => {
    await delay();
    const failure = forcedFailure();
    if (failure) return failure;
    const job = jobs.find((j) => j.id === Number(params.jobId));
    if (!job) return errorResponse(404, 'JOB_NOT_FOUND', '작업을 찾을 수 없습니다.');
    if (!isActive(job)) return errorResponse(409, 'JOB_ALREADY_FINISHED', '이미 끝난 작업입니다.');
    job.cancelRequested = true;
    return HttpResponse.json(job, { status: 202 });
  }),

  // #8 getChecklist
  http.get(`${QA}/sprints/:sprintId/checklist`, async ({ params }) => {
    await delay();
    const failure = forcedFailure();
    if (failure) return failure;
    const sprint = sprints.find((s) => s.id === Number(params.sprintId));
    if (!sprint) return errorResponse(404, 'SPRINT_NOT_FOUND', '스프린트를 찾을 수 없습니다.');
    return HttpResponse.json(
      toChecklistResponse(sprint.id, sprint.status, checklists.get(sprint.id) ?? []),
    );
  }),

  // #9 createChecklistItem — REVIEW 에서만. 직접 추가 = HUMAN·CONFIRMED
  http.post(`${QA}/sprints/:sprintId/checklist-items`, async ({ params, request }) => {
    await delay();
    const failure = forcedFailure() ?? staleFailure();
    if (failure) return failure;
    const sprint = sprints.find((s) => s.id === Number(params.sprintId));
    const blocks = sprint ? checklists.get(sprint.id) : undefined;
    if (!sprint || !blocks)
      return errorResponse(404, 'SPRINT_NOT_FOUND', '스프린트를 찾을 수 없습니다.');
    if (sprint.status !== 'REVIEW')
      return errorResponse(409, 'INVALID_STATE', '분류 검토 중이 아닙니다.');

    const body = (await request.json()) as Pick<
      MockItem,
      'featureId' | 'title' | 'expected' | 'parts' | 'classification'
    > & { testRef?: string | null; personaKey?: string | null };
    const block = blocks.find((b) => b.feature.id === body.featureId);
    if (!block || !body.title || !body.expected || body.parts.length === 0) {
      return errorResponse(400, 'INVALID_REQUEST', {
        featureId: '필수 값이 비었거나 잘못되었습니다.',
      });
    }
    if (body.classification === 'AUTO' && !TEST_CATALOG.includes(body.testRef ?? '')) {
      return errorResponse(422, 'TEST_REF_NOT_IN_CATALOG', 'testRef not in catalog');
    }
    const id = nextItemId++;
    const item: MockItem = {
      id,
      featureId: block.feature.id,
      title: body.title,
      expected: body.expected,
      parts: body.parts,
      classification: body.classification,
      criteria: null,
      automationGap: false,
      testRef: body.testRef ?? null,
      personaKey: body.personaKey ?? null,
      sourceRefs: [],
      origin: 'HUMAN',
      reviewState: 'CONFIRMED',
      cells: cellsFor({ id, parts: body.parts, classification: body.classification }),
      version: 0,
    };
    block.items.push(item);
    syncSprint(sprint);
    return HttpResponse.json(toItemResponse(sprint.status, item), { status: 201 });
  }),

  // #10 updateChecklistItem — 바꾼 필드만 + version. REVIEW 아님·version 불일치 409, 카탈로그 밖 자동 422
  http.patch(`${QA}/checklist-items/:itemId`, async ({ params, request }) => {
    await delay();
    const failure = forcedFailure() ?? staleFailure();
    if (failure) return failure;
    const found = findItem(Number(params.itemId));
    const sprint = found && sprints.find((s) => s.id === found.sprintId);
    if (!found || !sprint) return errorResponse(404, 'ITEM_NOT_FOUND', '항목을 찾을 수 없습니다.');
    const { item } = found;
    const body = (await request.json()) as Partial<MockItem> & { version: number };
    if (sprint.status !== 'REVIEW' || body.version !== item.version) {
      return errorResponse(409, 'VERSION_CONFLICT', '다른 사용자가 먼저 변경했습니다.');
    }
    const classification = body.classification ?? item.classification;
    const testRef = body.testRef === undefined ? item.testRef : body.testRef;
    if (
      (body.classification !== undefined || body.testRef !== undefined) &&
      classification === 'AUTO' &&
      !TEST_CATALOG.includes(testRef ?? '')
    ) {
      return errorResponse(422, 'TEST_REF_NOT_IN_CATALOG', 'testRef not in catalog');
    }
    if (body.title !== undefined) item.title = body.title;
    if (body.expected !== undefined) item.expected = body.expected;
    if (body.personaKey !== undefined) item.personaKey = body.personaKey;
    if (body.reviewState !== undefined) item.reviewState = body.reviewState;
    item.classification = classification;
    item.testRef = testRef;
    if (body.parts !== undefined) item.parts = body.parts;
    if (body.parts !== undefined || body.classification !== undefined) {
      item.cells = cellsFor(item, item.cells);
    }
    item.version += 1;
    syncSprint(sprint);
    return HttpResponse.json(toItemResponse(sprint.status, item));
  }),

  // #11 confirmChecklist — 검토 전이 남았거나 version 불일치면 409
  http.post(`${QA}/sprints/:sprintId/checklist/confirm`, async ({ params, request }) => {
    await delay();
    const failure = forcedFailure() ?? staleFailure();
    if (failure) return failure;
    const sprint = sprints.find((s) => s.id === Number(params.sprintId));
    const blocks = sprint ? checklists.get(sprint.id) : undefined;
    if (!sprint || !blocks)
      return errorResponse(404, 'SPRINT_NOT_FOUND', '스프린트를 찾을 수 없습니다.');
    const body = (await request.json()) as { startAutoRun?: boolean; version: number };
    const items = blocks.flatMap((b) => b.items);
    if (
      sprint.status !== 'REVIEW' ||
      body.version !== sprint.version ||
      items.some((i) => i.reviewState === 'PROPOSED')
    ) {
      return errorResponse(409, 'CONFIRM_NOT_ALLOWED', '확정할 수 없는 상태입니다.');
    }
    // 목업: 자동 분류 항목은 자동 실행이 곧바로 끝난 것으로 본다(PASS)
    const autoItems = items.filter(
      (i) => i.reviewState === 'CONFIRMED' && i.classification === 'AUTO',
    );
    autoItems.forEach((i) => {
      i.cells = i.cells.map((c) =>
        c.state === 'NOT_APPLICABLE'
          ? c
          : { ...c, state: 'PASS', autoRunId: 77, updatedAt: nowKst(), version: c.version + 1 },
      );
    });
    sprint.confirmedAt = nowKst();
    setSprintStatus(sprint, 'IN_PROGRESS');
    const autoRun =
      autoItems.length > 0 && body.startAutoRun !== false ? { id: 77, status: 'QUEUED' } : null;
    return HttpResponse.json({ sprint, autoRun });
  }),
];
