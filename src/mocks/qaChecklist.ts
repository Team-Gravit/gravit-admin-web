import type {
  CheckCell,
  CheckCellHistory,
  Checklist,
  ChecklistItem,
  DesignHistory,
  DesignItem,
  DesignReview,
  PartProgress,
  Round,
  SprintStatus,
} from '@/features/qa/schemas';

interface ScreenSeed {
  featureId: number;
  screenId: string;
  screenName: string;
  changed: boolean;
}
export const SCREENS: ScreenSeed[] = [
  { featureId: 101, screenId: 'ACC-01', screenName: '로그인', changed: true },
  { featureId: 102, screenId: 'G-APP', screenName: '공통 화면', changed: false },
];
const expectations = [
  ['로그인 버튼 동작', '입력한 계정으로 로그인하면 학습 홈으로 이동합니다.'],
  ['필수 입력 안내', '필수 값이 비어 있으면 입력란 아래에 안내를 표시합니다.'],
  ['실패 후 재시도', '일시적인 오류가 발생해도 입력을 유지하고 다시 시도할 수 있습니다.'],
] as const;
export interface QaFixture {
  items: ChecklistItem[];
  design: DesignItem[];
  cellHistory: Map<string, CheckCellHistory[]>;
  designHistory: Map<number, DesignHistory>;
}
export function buildFixture(sprintId: number, complete = false): QaFixture {
  const fixture: QaFixture = {
    items: [],
    design: [],
    cellHistory: new Map(),
    designHistory: new Map(),
  };
  for (const [screenIndex, screen] of SCREENS.entries()) {
    for (const round of [1, 2] as const) {
      expectations.forEach(([title, expected], n) => {
        const id = sprintId * 10000 + round * 1000 + screenIndex * 100 + n;
        const cells: CheckCell[] = (['WEB', 'APP', 'SERVER'] as const).map((part, p) => ({
          part,
          state: complete || n === 0 ? 'PASS' : n === 1 && p === 0 ? 'FAIL' : 'UNCHECKED',
          source: round === 1 ? 'AUTO' : 'MANUAL',
          reason:
            round === 1 ? 'release 코드에서 명세에 해당하는 분기와 응답을 확인했습니다.' : null,
          editable: true,
          version: 0,
        }));
        const item: ChecklistItem = {
          id,
          featureId: screen.featureId,
          title,
          expected,
          parts: ['WEB', 'APP', 'SERVER'],
          classification: round === 1 ? 'AUTO' : 'MANUAL',
          origin: 'LLM',
          cells,
          version: 0,
        };
        fixture.items.push(item);
        for (const cell of cells)
          fixture.cellHistory.set(`${id}:${cell.part}`, [
            {
              fromState: 'UNCHECKED',
              toState: cell.state,
              source: cell.source,
              changedBy: round === 1 ? null : 1,
              changedAt: '2026-11-11T10:00:00+09:00',
              reason: cell.reason,
            },
          ]);
      });
    }
    for (const [n, platform] of (['WEB', 'APP', 'APP'] as const).entries()) {
      const missing = screenIndex === 1 && n === 2;
      const id = sprintId * 10000 + 3000 + screenIndex * 100 + n;
      const figmaPlatform = platform === 'APP' ? 'AOS' : 'WEB';
      const specRowIds = [`${screen.screenId}-C${n + 1}`];
      const item: DesignItem = {
        id,
        featureId: screen.featureId,
        platform,
        title: missing
          ? `${figmaPlatform} 시안 프레임이 없다`
          : ((['주요 버튼 배치', '입력란과 안내 문구', '오류 화면 구성'] as const)[n] ??
            '화면 구성'),
        expected: missing
          ? `QA 페이지의 이번 스프린트 ${figmaPlatform} Section에 이 화면 프레임이 없어 시안을 명세와 비교하지 못했습니다. 프레임을 확인한 뒤 사람이 판정한다 (${specRowIds.join(', ')})`
          : '명세의 구성 요소가 Figma 화면의 위치와 스타일에 맞게 표시됩니다.',
        specRowIds,
        state: complete ? (missing ? 'NOT_APPLICABLE' : 'PASS') : n === 0 ? 'PASS' : 'UNCHECKED',
        source: 'AUTO',
        reason: missing
          ? 'Figma 프레임 없음'
          : 'Figma와 화면 명세를 비교한 자동 검수 결과입니다.',
        editable: true,
        version: 0,
      };
      fixture.design.push(item);
      fixture.designHistory.set(id, [
        {
          state: item.state,
          source: item.source,
          reason: item.reason,
          updatedBy: null,
          updatedAt: '2026-11-11T10:00:00+09:00',
        },
      ]);
    }
  }
  return fixture;
}
function completion(states: string[]) {
  const applicable = states.filter((state) => state !== 'NOT_APPLICABLE');
  return applicable.length === 0
    ? 100
    : Math.round((applicable.filter((s) => s !== 'UNCHECKED').length / applicable.length) * 100);
}
export function checklistResponse(
  sprintId: number,
  sprintStatus: SprintStatus,
  fixture: QaFixture,
  round: Round,
): Checklist {
  return {
    sprintId,
    sprintStatus,
    features: SCREENS.map((screen) => {
      const items = fixture.items
        .filter(
          (i) =>
            i.featureId === screen.featureId &&
            i.classification === (round === 1 ? 'AUTO' : 'MANUAL'),
        )
        .map((i) => ({
          ...i,
          cells: i.cells.map((c) => ({ ...c, editable: sprintStatus !== 'CLOSED' && c.editable })),
        }));
      return {
        ...screen,
        completionRate: completion(items.flatMap((i) => i.cells.map((c) => c.state))),
        items,
      };
    }),
  };
}
export function designResponse(
  sprintId: number,
  sprintStatus: SprintStatus,
  fixture: QaFixture,
): DesignReview {
  return {
    sprintId,
    sprintStatus,
    features: SCREENS.map((screen) => {
      const items = fixture.design
        .filter((i) => i.featureId === screen.featureId)
        .map((i) => ({ ...i, editable: sprintStatus !== 'CLOSED' && i.editable }));
      return { ...screen, completionRate: completion(items.map((i) => i.state)), items };
    }),
  };
}
export function progressOf(fixture: QaFixture): PartProgress[] {
  return (['DESIGN', 'WEB', 'APP', 'SERVER'] as const).map((part) => {
    const states = (
      part === 'DESIGN'
        ? fixture.design.map((i) => i.state)
        : fixture.items.flatMap((i) => i.cells.filter((c) => c.part === part).map((c) => c.state))
    ).filter((s) => s !== 'NOT_APPLICABLE');
    return {
      part,
      total: states.length,
      checked: states.filter((s) => s !== 'UNCHECKED').length,
      pass: states.filter((s) => s === 'PASS').length,
      fail: states.filter((s) => s === 'FAIL').length,
    };
  });
}
