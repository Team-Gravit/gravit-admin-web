/**
 * QA 체크리스트 목업 데이터와 계산 (qaHandlers 가 쓴다). 실제 서버 규칙을 흉내만 낸다.
 * - 스프린트별 체크리스트를 픽스처에서 만든다: 분류 검토(일부 검토 전) / 새 초안(전부 검토 전) / 체크 진행 / 종료.
 * - 진행률·다음 할 일은 셀에서 다시 계산한다(거절 항목 셀은 진행률에 넣지 않는다 — QA_SPEC 결정 #9).
 * - 경고는 두 형태를 모두 쓴다: 분류 검토 픽스처는 ReportWarning 객체, 새 초안은 코드 문자열(서버 C4 형태).
 */

export type Part = 'SERVER' | 'WEB' | 'APP';
export type CellState = 'UNCHECKED' | 'PASS' | 'FAIL' | 'NOT_APPLICABLE';
type ReviewState = 'PROPOSED' | 'CONFIRMED' | 'REJECTED';
type Classification = 'AUTO' | 'MANUAL';
type CriteriaKey =
  | 'specDecidable'
  | 'preconditionReproducible'
  | 'observable'
  | 'noExternalDependency'
  | 'notSubjective';
type Criteria = Record<CriteriaKey, { met: boolean; reason: string }>;

export interface MockCell {
  itemId: number;
  part: Part;
  state: CellState;
  source: 'MANUAL' | 'AUTO';
  autoRunId: number | null;
  updatedBy: number | null;
  updatedAt: string | null;
  version: number;
}

export interface MockItem {
  id: number;
  featureId: number;
  title: string;
  expected: string;
  parts: Part[];
  classification: Classification;
  criteria: Criteria | null;
  automationGap: boolean;
  testRef: string | null;
  personaKey: string | null;
  sourceRefs: number[];
  origin: 'LLM' | 'HUMAN';
  reviewState: ReviewState;
  cells: MockCell[];
  version: number;
}

export interface MockFeature {
  id: number;
  screenId: string;
  name: string;
  route: string | null;
  parts: Part[];
  specStatus: 'DRAFT' | 'NEEDS_CHECK' | 'CONFIRMED';
  notionUrl: string | null;
  figmaNodeIds: string[];
}

type MockWarning = string | { code: string; message: string; screenId: string | null };

export interface MockBlock {
  feature: MockFeature;
  warnings: MockWarning[];
  items: MockItem[];
}

export const PARTS: readonly Part[] = ['SERVER', 'WEB', 'APP'];

/** 테스트 카탈로그(목업). 여기에 없는 테스트 ID 로 자동 분류하면 422. */
export const TEST_CATALOG = [
  'auth.social-login.kakao',
  'learning.progress.save',
  'notice.list.pinned-first',
];

const REASON: Record<CriteriaKey, [met: string, unmet: string]> = {
  specDecidable: ['명세에 판정 기준이 적혀 있다', '명세에 기준이 없어 사람이 판단해야 한다'],
  preconditionReproducible: [
    '페르소나 데이터로 사전 조건을 만들 수 있다',
    '사전 조건을 데이터로 재현하기 어렵다',
  ],
  observable: ['화면·응답으로 결과를 확인할 수 있다', '결과를 화면이나 응답으로 확인하기 어렵다'],
  noExternalDependency: [
    '외부 서비스 없이 확인할 수 있다',
    '외부 서비스(소셜 로그인·푸시 등)에 의존한다',
  ],
  notSubjective: ['주관 판단이 필요 없다', '보기 좋음 등 주관 판단이 섞여 있다'],
};

/** 5개 중 unmet 에 든 키만 미충족 */
function criteria(unmet: CriteriaKey[] = []): Criteria {
  const keys = Object.keys(REASON) as CriteriaKey[];
  return Object.fromEntries(
    keys.map((k) => [k, { met: !unmet.includes(k), reason: REASON[k][unmet.includes(k) ? 1 : 0] }]),
  ) as Criteria;
}

interface ItemTemplate {
  title: string;
  expected: string;
  parts: Part[];
  auto?: string;
  gap?: boolean;
  persona?: string;
  criteria?: Criteria | null;
}

interface FeatureTemplate extends Omit<MockFeature, 'id'> {
  warnings: Array<{ code: string; message: string }>;
  items: ItemTemplate[];
}

const NOTION = (slug: string) => `https://www.notion.so/team-gravit/${slug}`;

const CATALOG: FeatureTemplate[] = [
  {
    screenId: 'LRN-01',
    name: '학습 홈',
    route: '/learning',
    parts: ['SERVER', 'WEB', 'APP'],
    specStatus: 'CONFIRMED',
    notionUrl: NOTION('LRN-01-learning-home'),
    figmaNodeIds: ['8720:4002'],
    warnings: [],
    items: [
      {
        title: '오늘의 학습 카드 노출',
        expected: '로그인 직후 학습 홈에 이어서 할 레슨 카드가 1개 표시된다.',
        parts: ['WEB', 'APP'],
        persona: 'learner',
      },
      {
        title: '챕터 진도율 계산',
        expected: '챕터 진도율이 완료한 레슨 수 ÷ 전체 레슨 수로 표시된다(소수점 버림).',
        parts: ['SERVER', 'WEB', 'APP'],
        auto: 'learning.progress.save',
      },
      {
        title: '빈 학습 상태 안내',
        expected:
          "학습 이력이 없으면 '첫 레슨 시작하기' 안내와 버튼이 보이고, 버튼을 누르면 첫 챕터의 첫 레슨으로 이동한다. 안내 문구는 기능 명세 3.2절을 따른다.",
        parts: ['WEB', 'APP'],
        persona: 'fresh',
        gap: true,
        criteria: criteria(['preconditionReproducible']),
      },
    ],
  },
  {
    screenId: 'LRN-02',
    name: '레슨 풀이',
    route: '/lessons/:id',
    parts: ['SERVER', 'APP'],
    specStatus: 'CONFIRMED',
    notionUrl: NOTION('LRN-02-lesson'),
    figmaNodeIds: ['8558:6812'],
    warnings: [],
    items: [
      {
        title: '정답 제출 후 해설 노출',
        expected: '정답을 제출하면 해설이 바로 아래에 펼쳐진다.',
        parts: ['APP'],
      },
      {
        title: '오답 재시도 횟수',
        expected: '오답이면 같은 문제를 최대 2번 다시 풀 수 있다.',
        parts: ['SERVER', 'APP'],
        criteria: null,
      },
    ],
  },
  {
    screenId: 'UP-학습',
    name: '학습 진행 저장',
    route: null,
    parts: ['SERVER', 'APP'],
    specStatus: 'NEEDS_CHECK',
    notionUrl: NOTION('UP-learning-progress'),
    figmaNodeIds: [],
    warnings: [{ code: 'SPEC_NEEDS_CHECK', message: 'Spec status is NEEDS_CHECK' }],
    items: [
      {
        title: '레슨 중단 후 이어하기',
        expected:
          '레슨을 중간에 나가도 마지막으로 푼 문제 다음부터 이어서 풀 수 있다. (명세 근거 없음: 저장 시점 확인 필요)',
        parts: ['SERVER', 'APP'],
        criteria: criteria(['specDecidable']),
      },
      {
        title: '오프라인 풀이 기록 반영',
        expected: '네트워크가 끊긴 동안 푼 기록이 재연결 후 서버에 반영된다. (명세 근거 없음)',
        parts: ['SERVER', 'APP'],
        criteria: criteria(['specDecidable', 'preconditionReproducible']),
      },
    ],
  },
  {
    screenId: 'LGE-01',
    name: '리그 순위',
    route: '/league',
    parts: ['SERVER', 'WEB', 'APP'],
    specStatus: 'DRAFT',
    notionUrl: NOTION('LGE-01-league'),
    figmaNodeIds: [],
    warnings: [{ code: 'FIGMA_FRAME_MISSING', message: 'Figma frame not found for LGE-01' }],
    items: [
      {
        title: '주간 순위 정렬',
        expected: '리그 순위가 주간 XP 내림차순, 동점이면 먼저 도달한 순으로 정렬된다.',
        parts: ['SERVER', 'WEB', 'APP'],
        persona: 'league-edge',
      },
      {
        title: '승급 경계 표시',
        expected: '승급권 마지막 순위 아래에 구분선이 표시된다.',
        parts: ['WEB', 'APP'],
        persona: 'league-edge',
        criteria: criteria(['notSubjective']),
      },
    ],
  },
  {
    screenId: 'AUTH-01',
    name: '소셜 로그인',
    route: '/login',
    parts: ['SERVER', 'WEB', 'APP'],
    specStatus: 'CONFIRMED',
    notionUrl: NOTION('AUTH-01-social-login'),
    figmaNodeIds: ['8788:1984'],
    warnings: [],
    items: [
      {
        title: '카카오 로그인 성공',
        expected: '카카오 인증을 마치면 홈으로 이동하고 토큰이 저장된다.',
        parts: ['SERVER', 'WEB', 'APP'],
        auto: 'auth.social-login.kakao',
      },
      {
        title: '탈퇴 유예 계정 로그인',
        expected: '탈퇴 유예 중인 계정으로 로그인하면 계정 복구 안내가 뜬다.',
        parts: ['SERVER', 'APP'],
        persona: 'withdrawing',
        criteria: criteria(['noExternalDependency']),
      },
    ],
  },
  {
    screenId: 'MYP-03',
    name: '프로필 수정',
    route: '/mypage/profile',
    parts: ['SERVER', 'APP'],
    specStatus: 'CONFIRMED',
    notionUrl: NOTION('MYP-03-profile'),
    figmaNodeIds: ['8717:2006'],
    warnings: [{ code: 'ITEM_GENERATION_FAILED', message: 'LLM interpret failed for MYP-03' }],
    items: [
      {
        title: '초안 생성 실패',
        expected: '체크 항목 초안을 만들지 못했습니다. 이 항목을 거절하고 직접 추가하세요.',
        parts: ['SERVER', 'APP'],
        criteria: null,
      },
    ],
  },
  {
    screenId: 'NTC-01',
    name: '공지 목록',
    route: '/notices',
    parts: ['SERVER', 'WEB'],
    specStatus: 'CONFIRMED',
    notionUrl: NOTION('NTC-01-notices'),
    figmaNodeIds: ['8788:7557', '8789:7970'],
    warnings: [],
    items: [
      {
        title: '고정 공지 상단 노출',
        expected: '고정 공지가 게시일과 관계없이 목록 맨 위에 표시된다.',
        parts: ['SERVER', 'WEB'],
        auto: 'notice.list.pinned-first',
      },
      {
        title: '보관 공지 미노출',
        expected: '보관된 공지는 사용자 목록에 보이지 않는다.',
        parts: ['SERVER', 'WEB'],
      },
    ],
  },
  {
    screenId: 'INQ-02',
    name: '문의 작성',
    route: '/inquiries/new',
    parts: ['SERVER', 'APP'],
    specStatus: 'NEEDS_CHECK',
    notionUrl: null,
    figmaNodeIds: [],
    warnings: [
      { code: 'SPEC_NEEDS_CHECK', message: 'Spec status is NEEDS_CHECK' },
      // 매핑에 없는 코드 — 화면은 message 원문(객체) 또는 코드 원문(문자열)으로 보여 준다
      {
        code: 'OPENAPI_PATH_MISSING',
        message: 'OpenAPI 명세에서 이 화면의 API 경로를 찾지 못했습니다.',
      },
    ],
    items: [
      {
        title: '문의 제출',
        expected: "제목과 내용을 입력하면 문의가 제출되고 목록에 '대기'로 보인다.",
        parts: ['SERVER', 'APP'],
        persona: 'inquirer',
      },
      {
        title: '첨부 이미지 용량 제한',
        expected: '10MB를 넘는 이미지는 첨부할 수 없다는 안내가 뜬다.',
        parts: ['APP'],
      },
    ],
  },
];

export type ChecklistMode = 'review' | 'fresh' | 'in-progress' | 'closed';

/** 분류 검토 픽스처에서 '검토 전'으로 둘 항목(기능 순번-항목 순번) */
const PROPOSED_IN_REVIEW = ['0-2', '1-1', '2-0', '2-1', '3-0', '3-1', '5-0'];
const REJECTED_ALWAYS = ['7-1'];
const REJECTED_AFTER_CONFIRM = ['5-0'];

/** 체크 진행 픽스처의 수동 셀 상태 순환 */
const MANUAL_CYCLE: CellState[] = [
  'PASS',
  'PASS',
  'UNCHECKED',
  'FAIL',
  'PASS',
  'UNCHECKED',
  'UNCHECKED',
];

function makeCells(
  item: Pick<MockItem, 'id' | 'parts' | 'classification'>,
  stateOf: (part: Part, i: number) => CellState,
  at: string | null,
): MockCell[] {
  return PARTS.map((part, i) => {
    const included = item.parts.includes(part);
    const auto = item.classification === 'AUTO';
    const state: CellState = included ? stateOf(part, i) : 'NOT_APPLICABLE';
    const touched = state !== 'UNCHECKED' && state !== 'NOT_APPLICABLE';
    return {
      itemId: item.id,
      part,
      state,
      source: auto && included ? 'AUTO' : 'MANUAL',
      autoRunId: auto && touched ? 31 : null,
      updatedBy: touched && !auto ? 1002 : null,
      updatedAt: touched ? at : null,
      version: touched ? 1 : 0,
    };
  });
}

export function buildChecklist(sprintId: number, mode: ChecklistMode): MockBlock[] {
  let cycle = 0;
  let extraId = 900;
  return CATALOG.map((tpl, fi) => {
    const feature: MockFeature = {
      id: sprintId * 100 + fi + 1,
      screenId: tpl.screenId,
      name: tpl.name,
      route: tpl.route,
      parts: tpl.parts,
      specStatus: tpl.specStatus,
      notionUrl: tpl.notionUrl,
      figmaNodeIds: tpl.figmaNodeIds,
    };
    const warnings: MockWarning[] =
      mode === 'fresh'
        ? tpl.warnings.map((w) => w.code)
        : tpl.warnings.map((w) => ({ ...w, screenId: tpl.screenId }));

    const items: MockItem[] = tpl.items.map((it, ii) => {
      const key = `${fi}-${ii}`;
      const id = sprintId * 1000 + fi * 10 + ii + 1;
      const classification: Classification = it.auto ? 'AUTO' : 'MANUAL';
      let reviewState: ReviewState = 'CONFIRMED';
      if (mode === 'fresh') reviewState = 'PROPOSED';
      if (mode === 'review' && PROPOSED_IN_REVIEW.includes(key)) reviewState = 'PROPOSED';
      if (mode !== 'fresh' && REJECTED_ALWAYS.includes(key)) reviewState = 'REJECTED';
      if ((mode === 'in-progress' || mode === 'closed') && REJECTED_AFTER_CONFIRM.includes(key)) {
        reviewState = 'REJECTED';
      }
      const base = { id, parts: it.parts, classification };
      const checked = mode === 'in-progress' || mode === 'closed';
      const cells = makeCells(
        base,
        (part, pi) => {
          if (!checked || reviewState === 'REJECTED') return 'UNCHECKED';
          if (classification === 'AUTO')
            return it.auto === 'auth.social-login.kakao' && part === 'APP' ? 'FAIL' : 'PASS';
          const s = MANUAL_CYCLE[(cycle + pi) % MANUAL_CYCLE.length] ?? 'PASS';
          return mode === 'closed' && s === 'UNCHECKED' ? 'PASS' : s;
        },
        mode === 'closed' ? '2026-03-26T17:40:00+09:00' : '2026-04-03T11:20:00+09:00',
      );
      cycle += 1;
      return {
        id,
        featureId: feature.id,
        title: it.title,
        expected: it.expected,
        parts: it.parts,
        classification,
        criteria: it.criteria === undefined ? criteria() : it.criteria,
        automationGap: it.gap ?? false,
        testRef: it.auto ?? null,
        personaKey: it.persona ?? null,
        sourceRefs: [fi + 1],
        origin: mode !== 'fresh' && key === '6-1' ? 'HUMAN' : 'LLM',
        reviewState,
        cells,
        version: reviewState === 'PROPOSED' ? 0 : 1,
      };
    });

    // 체크 진행·종료: 초안 생성 실패 기능에는 운영자가 직접 추가한 항목이 있다
    if ((mode === 'in-progress' || mode === 'closed') && tpl.screenId === 'MYP-03') {
      const id = sprintId * 1000 + extraId++;
      const it = { id, parts: ['SERVER', 'APP'] as Part[], classification: 'MANUAL' as const };
      items.push({
        ...it,
        featureId: feature.id,
        title: '닉네임 변경 반영',
        expected: '닉네임을 바꾸면 홈 인사말과 리그 순위에 바로 반영된다.',
        criteria: null,
        automationGap: false,
        testRef: null,
        personaKey: 'learner',
        sourceRefs: [],
        origin: 'HUMAN',
        reviewState: 'CONFIRMED',
        cells: makeCells(
          it,
          () => (mode === 'closed' ? 'FAIL' : 'UNCHECKED'),
          '2026-03-26T17:45:00+09:00',
        ),
        version: 1,
      });
    }
    return { feature, warnings, items };
  });
}

// ---------- 계산 ----------
export function progressOf(blocks: MockBlock[]) {
  return PARTS.map((part) => {
    const cells = blocks
      .flatMap((b) => b.items)
      .filter((i) => i.reviewState !== 'REJECTED')
      .flatMap((i) => i.cells)
      .filter((c) => c.part === part);
    const count = (s: CellState) => cells.filter((c) => c.state === s).length;
    const notApplicable = count('NOT_APPLICABLE');
    return {
      part,
      total: cells.length - notApplicable,
      pass: count('PASS'),
      fail: count('FAIL'),
      unchecked: count('UNCHECKED'),
      notApplicable,
    };
  });
}

/** 셀 변경 가능 여부 — 체크 진행 중 · 확정 항목 · 수동 셀 · 해당 없음 아님 */
export function isCellEditable(sprintStatus: string, item: MockItem, cell: MockCell): boolean {
  return (
    sprintStatus === 'IN_PROGRESS' &&
    item.reviewState === 'CONFIRMED' &&
    cell.source === 'MANUAL' &&
    cell.state !== 'NOT_APPLICABLE'
  );
}

export function toChecklistResponse(sprintId: number, sprintStatus: string, blocks: MockBlock[]) {
  return {
    sprintId,
    sprintStatus,
    features: blocks.map((b) => ({
      feature: b.feature,
      warnings: b.warnings,
      items: b.items.map((i) => toItemResponse(sprintStatus, i)),
    })),
  };
}

export function toItemResponse(sprintStatus: string, item: MockItem) {
  return {
    ...item,
    cells: item.cells.map((c) => ({ ...c, editable: isCellEditable(sprintStatus, item, c) })),
  };
}

/** 파트가 바뀐 항목의 셀 — 남은 파트는 기존 셀 유지, 새 파트는 미검수, 빠진 파트는 해당 없음. */
export function cellsFor(
  item: Pick<MockItem, 'id' | 'parts' | 'classification'>,
  prev: MockCell[] = [],
): MockCell[] {
  return PARTS.map((part) => {
    const kept = prev.find((c) => c.part === part && c.state !== 'NOT_APPLICABLE');
    if (item.parts.includes(part) && kept) return kept;
    return {
      itemId: item.id,
      part,
      state: item.parts.includes(part) ? 'UNCHECKED' : 'NOT_APPLICABLE',
      source: item.classification === 'AUTO' && item.parts.includes(part) ? 'AUTO' : 'MANUAL',
      autoRunId: null,
      updatedBy: null,
      updatedAt: null,
      version: 0,
    };
  });
}

// ---------- 셀 변경 이력 ----------
export interface MockHistory {
  fromState: CellState;
  toState: CellState;
  source: 'MANUAL' | 'AUTO';
  changedBy: number | null;
  autoRunId: number | null;
  changedAt: string;
}

/** 이미 체크된 셀마다 '미검수 → 지금 상태' 이력 1건을 만든다(최신순으로 쌓는다). */
export function seedHistory(blocks: MockBlock[]): Map<string, MockHistory[]> {
  const map = new Map<string, MockHistory[]>();
  for (const cell of blocks.flatMap((b) => b.items).flatMap((i) => i.cells)) {
    if (cell.state === 'UNCHECKED' || cell.state === 'NOT_APPLICABLE' || !cell.updatedAt) continue;
    map.set(`${cell.itemId}:${cell.part}`, [
      {
        fromState: 'UNCHECKED',
        toState: cell.state,
        source: cell.source,
        changedBy: cell.source === 'AUTO' ? null : cell.updatedBy,
        autoRunId: cell.autoRunId,
        changedAt: cell.updatedAt,
      },
    ]);
  }
  return map;
}
