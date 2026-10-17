import { PART_LABELS } from '@/features/qa/labels';
import type { GuideBlocker, SprintGuide } from '@/features/qa/schemas';

/**
 * QA 화면 문구 — **QA_SPEC F절이 권위**(decisions D9-5). 톤은 합니다체.
 * 서버는 다음 할 일·막힌 이유·경고를 코드로만 내려 준다. 코드 → 문구 매핑은 여기서만 한다.
 * HTTP 계층 공통 오류 문구(AUTH_UNAVAILABLE·FORBIDDEN·DEFAULT)는 `shared/api/qaClient` 의 QA_ERROR_MESSAGES.
 */

// ---------- F-1. 다음 할 일 (guide.nextAction) ----------
export type NextActionCode =
  | 'START_SETUP'
  | 'WAIT_SETUP'
  | 'RETRY_SETUP'
  | 'REVIEW_ITEMS'
  | 'CONFIRM_CHECKLIST'
  | 'CHECK_CELLS'
  | 'WAIT_AUTO_RUN'
  | 'CLOSE_SPRINT'
  | 'NONE';

interface NextActionTemplate {
  banner: string;
  /** 목록용 짧은 문구 */
  short: string;
  /** 배너 버튼 라벨. 없으면 버튼 없음. 동작은 화면이 정한다. */
  button: string | null;
}

const NEXT_ACTION_TEMPLATES: Record<NextActionCode, NextActionTemplate> = {
  START_SETUP: {
    banner: 'QA 준비하기를 실행해 체크리스트 초안을 만드세요.',
    short: 'QA 준비하기',
    button: 'QA 준비하기',
  },
  WAIT_SETUP: {
    banner: '체크리스트 초안을 만들고 있습니다. 화면을 떠나도 계속 진행됩니다.',
    short: '준비 중',
    button: '진행 상황 보기',
  },
  RETRY_SETUP: {
    banner: '준비에 실패했습니다. 실패한 단계를 확인하고 다시 실행하세요.',
    short: '다시 준비 필요',
    button: '실패 내용 보기',
  },
  REVIEW_ITEMS: {
    banner: '검토 전 항목 {count}개를 확정하거나 거절하세요.',
    short: '검토 전 {count}개',
    button: '분류 검토로 이동',
  },
  CONFIRM_CHECKLIST: {
    banner: '모든 항목을 검토했습니다. 체크리스트를 확정하세요.',
    short: '확정 필요',
    button: '체크리스트 확정',
  },
  CHECK_CELLS: { banner: '미검수 셀을 체크하세요.', short: '체크 중', button: '체크리스트로 이동' },
  WAIT_AUTO_RUN: {
    banner: '자동 실행이 끝나기를 기다리고 있습니다.',
    short: '자동 실행 중',
    button: null,
  },
  CLOSE_SPRINT: {
    banner: '모든 셀을 체크했습니다. 스프린트를 종료하세요.',
    short: '종료 가능',
    button: '스프린트 종료',
  },
  NONE: { banner: '종료된 스프린트입니다.', short: '완료', button: null },
};

function isNextActionCode(code: string): code is NextActionCode {
  return Object.prototype.hasOwnProperty.call(NEXT_ACTION_TEMPLATES, code);
}

export interface NextActionCopy extends NextActionTemplate {
  code: NextActionCode;
}

/**
 * guide → F-1 문구. `{count}` 는 blockers 의 PROPOSED_ITEMS_REMAINING.count.
 * **모르는 코드면 null** — 화면은 배너·문구를 숨긴다(F-1).
 */
export function nextActionCopy(guide: SprintGuide): NextActionCopy | null {
  const { nextAction } = guide;
  if (!isNextActionCode(nextAction)) return null;
  const count = guide.blockers.find((b) => b.code === 'PROPOSED_ITEMS_REMAINING')?.count ?? null;
  const fill = (text: string) => text.replace('{count}', count === null ? '-' : String(count));
  const t = NEXT_ACTION_TEMPLATES[nextAction];
  return { code: nextAction, banner: fill(t.banner), short: fill(t.short), button: t.button };
}

// ---------- F-2. 막힌 이유 (guide.blockers[].code) ----------
/** 모르는 코드면 null(숨김). UNCHECKED_CELLS_REMAINING 은 파트별로 한 줄씩 온다. */
export function blockerCopy(blocker: GuideBlocker): string | null {
  const count = blocker.count ?? '-';
  switch (blocker.code) {
    case 'PROPOSED_ITEMS_REMAINING':
      return `검토 전 항목이 ${count}개 남았습니다.`;
    case 'UNCHECKED_CELLS_REMAINING':
      return blocker.part ? `${PART_LABELS[blocker.part]} 미검수 ${count}개` : `미검수 ${count}개`;
    case 'AUTO_RUN_IN_PROGRESS':
      return '자동 실행이 진행 중입니다.';
    case 'SETUP_IN_PROGRESS':
      return '준비 작업이 진행 중입니다.';
    case 'RELEASE_BRANCH_MISSING':
      return 'release 브랜치가 없는 저장소가 있습니다. 저장소 담당자에게 release 브랜치 생성을 요청하세요.';
    default:
      return null;
  }
}

// ---------- F-3. 경고 (ReportWarning.code) ----------
const WARNING_COPY: Partial<Record<string, string>> = {
  SPEC_NEEDS_CHECK:
    '명세가 확인 필요 상태입니다. 근거가 없는 항목은 기대 결과에 그렇게 적혀 있습니다.',
  FIGMA_FRAME_MISSING: 'Figma QA 페이지에서 이 화면을 찾지 못했습니다.',
  ITEM_GENERATION_FAILED:
    '체크 항목 초안을 만들지 못했습니다. 실패 항목을 거절하고 직접 추가하세요.',
  VERSION_CODE_NOT_INCREASED:
    '앱 versionCode가 직전 기준점보다 크지 않습니다. release마다 versionCode를 올려야 합니다.',
  NOTION_WRITE_FAILED: 'Notion에 QA 기준점을 기록하지 못했습니다. 종료는 정상 처리됐습니다.',
};

/** 경고 코드 → F-3 문구. **매핑이 없으면 null** — 호출 쪽이 서버 `message` 원문을 쓴다. */
export function warningCopy(code: string): string | null {
  return Object.prototype.hasOwnProperty.call(WARNING_COPY, code)
    ? (WARNING_COPY[code] ?? null)
    : null;
}

// ---------- F-4. 안내, 빈 상태 ----------
export const NOTICE_COPY = {
  EMPTY_SPRINTS: '등록된 스프린트가 없습니다. Notion 스프린트 페이지를 연결해 시작하세요.',
  REGISTER_HINT:
    'Notion 스프린트 DB의 행 페이지 URL을 붙여 넣으세요. 페이지에 QA Integration이 연결돼 있어야 합니다.',
  NO_BASELINE: '아직 기준점이 없습니다. QA 준비하기를 실행하면 release 브랜치 커밋이 기록됩니다.',
  NO_JOB: '아직 실행한 준비 작업이 없습니다.',
  RETRY_WAIT: (time: string) => `${time}에 자동으로 다시 시도합니다.`,
  SETUP_DURATION:
    '기능 수가 많으면 10분 이상 걸릴 수 있습니다. 화면을 떠나도 서버에서 계속 진행됩니다.',
  SETUP_LOCKED:
    '체크리스트를 확정한 뒤에는 다시 준비할 수 없습니다. 범위가 바뀌면 다음 스프린트에서 처리하세요.',
  REVIEW_NOT_READY: '아직 체크리스트 초안이 없습니다. 먼저 QA 준비하기를 완료하세요.',
  REVIEW_READONLY: '확정된 체크리스트입니다. 항목은 읽기만 할 수 있습니다.',
  NO_CRITERIA: '판정 근거가 없습니다.',
  PARTS_HINT: '선택하지 않은 파트의 셀은 해당 없음으로 바뀝니다.',
  CHECKLIST_NOT_READY: '체크리스트를 확정하면 체크를 시작할 수 있습니다.',
  CHECKLIST_CLOSED: '종료된 스프린트입니다. 체크 결과는 읽기만 할 수 있습니다.',
  CELL_LOCKED_AUTO: '자동 실행 결과로 정해진 셀입니다. 자동 실행을 다시 해야 바뀝니다.',
  CELL_LOCKED_CLOSED: '종료된 스프린트의 셀입니다.',
} as const;

// ---------- F-5. 오류 (도메인) ----------
export const ERROR_COPY = {
  NOTION_NOT_FOUND: 'Notion 페이지를 찾을 수 없습니다. URL과 QA Integration 연결을 확인하세요.',
  SPRINT_DUPLICATED: '이미 등록된 스프린트입니다.',
  STALE: '다른 운영자가 먼저 변경했습니다. 최신 내용을 다시 불러왔습니다.',
  AUTO_NOT_ALLOWED: '테스트 카탈로그에 없는 테스트 ID라 자동으로 분류할 수 없습니다.',
} as const;

// ---------- F-6. 성공 토스트 ----------
export const TOAST_COPY = {
  SPRINT_CREATED: '스프린트를 등록했습니다.',
  SETUP_STARTED: 'QA 준비하기를 시작했습니다.',
  JOB_CANCEL_REQUESTED: '작업 취소를 요청했습니다.',
  ITEM_UPDATED: '항목을 수정했습니다.',
  ITEM_CREATED: '항목을 추가했습니다.',
  CHECKLIST_CONFIRMED: '체크리스트를 확정했습니다.',
  SPRINT_CLOSED: '스프린트를 종료했습니다.',
} as const;

// ---------- F-7. 확인 모달 ----------
export const CONFIRM_COPY = {
  RE_SETUP: {
    title: '다시 준비할까요?',
    description: '검토 전 항목만 새로 만듭니다. 확정한 항목과 직접 추가한 항목은 그대로 둡니다.',
    confirmLabel: '다시 준비하기',
  },
  CANCEL_JOB: {
    title: '준비 작업을 취소할까요?',
    description: '진행 중인 단계가 끝나면 멈춥니다. 지금까지의 결과는 반영되지 않습니다.',
    confirmLabel: '작업 취소',
  },
  CONFIRM_CHECKLIST: {
    title: '체크리스트를 확정할까요?',
    description: '확정하면 항목을 수정하거나 다시 준비할 수 없고, 체크를 시작합니다.',
    confirmLabel: '확정',
  },
  CLOSE_SPRINT: {
    title: '스프린트를 종료할까요?',
    description: (failCount: number) =>
      `FAIL ${failCount}건은 미해결로 남습니다. 종료 후에는 체크를 바꿀 수 없습니다.`,
    confirmLabel: '종료',
  },
} as const;
