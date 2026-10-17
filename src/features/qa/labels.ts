import type { BadgeVariant } from '@/shared/constants/badgeVariants';
import type {
  CellState,
  Classification,
  ClassificationCriteria,
  ItemOrigin,
  JobStatus,
  Part,
  Repo,
  ReviewState,
  SpecStatus,
  SprintStage,
  SprintStatus,
  StepStatus,
} from '@/features/qa/schemas';

/**
 * QA enum → 화면 라벨 (QA_SPEC A-1).
 * QA 전용 값이라 shared/constants 가 아니라 이 feature 안에 둔다 — 다른 feature 가 쓰지 않는다.
 */

export const SPRINT_STATUS_LABELS: Record<SprintStatus, string> = {
  DRAFT: '준비 전',
  PREPARING: '준비 중',
  PREPARE_FAILED: '준비 실패',
  REVIEW: '분류 검토',
  IN_PROGRESS: '체크 진행',
  CLOSED: '종료',
};

/** 파트 표시 순서 고정: 서버, 웹, 앱 */
export const PART_ORDER: readonly Part[] = ['SERVER', 'WEB', 'APP'];

export const PART_LABELS: Record<Part, string> = {
  SERVER: '서버',
  WEB: '웹',
  APP: '앱',
};

export const STAGE_LABELS: Record<SprintStage, string> = {
  PREPARE: '준비',
  REVIEW: '분류 검토',
  CHECK: '체크',
  CLOSE: '종료',
  DONE: '완료',
};

/** 기준점 표 행 순서: 서버, 웹, 앱 */
export const REPO_ORDER: readonly Repo[] = ['gravit-server', 'gravit-web', 'gravit-aos'];

export const REPO_LABELS: Record<Repo, string> = {
  'gravit-server': '서버',
  'gravit-web': '웹',
  'gravit-aos': '앱',
};

/**
 * 단계 배지 톤 (QA_SPEC C절 상태 톤 매핑). 단계는 stage 로 정하되 상태가 더 구체적인 경우를 먼저 본다:
 * 준비 실패 = danger, 준비 전(대기) = muted, 완료 = success, 그 밖의 진행 단계 = primary.
 */
export function stageBadgeVariant(stage: SprintStage, status: SprintStatus): BadgeVariant {
  if (status === 'PREPARE_FAILED') return 'danger';
  if (status === 'DRAFT') return 'muted';
  if (stage === 'DONE') return 'success';
  return 'primary';
}

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  QUEUED: '대기',
  RUNNING: '실행 중',
  SUCCEEDED: '완료',
  FAILED: '실패',
  CANCELLED: '취소됨',
};

/** 작업 상태 톤 (C절): 완료 = success, 실패 = danger, 대기·취소 = muted, 실행 중 = primary. */
export const JOB_STATUS_BADGE_VARIANT: Record<JobStatus, BadgeVariant> = {
  QUEUED: 'muted',
  RUNNING: 'primary',
  SUCCEEDED: 'success',
  FAILED: 'danger',
  CANCELLED: 'muted',
};

export const STEP_STATUS_LABELS: Record<StepStatus, string> = {
  PENDING: '대기',
  RUNNING: '진행 중',
  DONE: '완료',
  FAILED: '실패',
  SKIPPED: '건너뜀',
};

/** 셋업 단계 이름 (A-1). 모르는 이름은 원문을 그대로 표시한다. */
const STEP_NAME_LABELS: Partial<Record<string, string>> = {
  BASELINE: '기준점 확정',
  NOTION: '명세 수집',
  FIGMA: '화면 수집',
  DIFF: '코드 변경 수집',
  OPENAPI: 'API 명세 수집',
  INTERPRET: '체크 항목 초안 생성',
  VALIDATE: '검증',
  APPLY: '반영',
};

export function stepNameLabel(name: string): string {
  return Object.prototype.hasOwnProperty.call(STEP_NAME_LABELS, name)
    ? (STEP_NAME_LABELS[name] ?? name)
    : name;
}

// ---------- 분류 검토 (A-1) ----------
export const CLASSIFICATION_LABELS: Record<Classification, string> = {
  AUTO: '자동',
  MANUAL: '수동',
};

export const REVIEW_STATE_LABELS: Record<ReviewState, string> = {
  PROPOSED: '검토 전',
  CONFIRMED: '확정',
  REJECTED: '거절',
};

export const ORIGIN_LABELS: Record<ItemOrigin, string> = {
  LLM: '초안',
  HUMAN: '직접 추가',
};

export const SPEC_STATUS_LABELS: Record<SpecStatus, string> = {
  DRAFT: '역문서화 초안',
  NEEDS_CHECK: '확인 필요',
  CONFIRMED: '확정',
};

/** 분류 기준 5개 — 표시 순서도 이 순서 (A-1). */
export const CRITERIA_LABELS: ReadonlyArray<{ key: keyof ClassificationCriteria; label: string }> =
  [
    { key: 'specDecidable', label: '명세로 판정 가능' },
    { key: 'preconditionReproducible', label: '사전 조건 재현 가능' },
    { key: 'observable', label: '결과 관찰 가능' },
    { key: 'noExternalDependency', label: '외부 의존 없음' },
    { key: 'notSubjective', label: '주관 판단 아님' },
  ];

/** 페르소나 키 13개 고정 (A-1, 설계 9-3). Select 표시 순서. */
export const PERSONA_OPTIONS: ReadonlyArray<{ key: string; label: string }> = [
  { key: 'pre-onboarding', label: '온보딩 전' },
  { key: 'fresh', label: '온보딩 직후' },
  { key: 'learner', label: '학습 진행 중' },
  { key: 'streak', label: '연속 학습' },
  { key: 'chapter-almost', label: '챕터 완료 직전' },
  { key: 'social', label: '팔로우 관계 보유' },
  { key: 'league-edge', label: '승급, 강등 경계' },
  { key: 'mission', label: '미션 완료 직전' },
  { key: 'interviewer', label: '면접 이력 보유' },
  { key: 'inquirer', label: '문의 답변 완료' },
  { key: 'withdrawing', label: '탈퇴 유예 중' },
  { key: 'suspended', label: '정지' },
  { key: 'admin', label: '관리자' },
];

/** 모르는 키는 원문 그대로. */
export function personaLabel(key: string): string {
  return PERSONA_OPTIONS.find((p) => p.key === key)?.label ?? key;
}

/**
 * 톤 (QA_SPEC C절): 검토 전 = 대기(neutral·muted), 확정 = 완료(success), 거절 = danger(대상에서 빠짐 —
 * 검토 전과 구분하고, 경고 배지(확인 필요·경고 N)가 기본 필터의 검토 전 배지에 묻히지 않게 한다).
 * 명세 상태: 확인 필요 = warning(B-3 명시), 확정 = success, 역문서화 초안 = muted.
 * 분류: C절에 매핑이 없어 자동 = info, 수동 = muted, 자동화 후보 = accent 로 보완.
 */
export const REVIEW_STATE_BADGE_VARIANT: Record<ReviewState, BadgeVariant> = {
  PROPOSED: 'muted',
  CONFIRMED: 'success',
  REJECTED: 'danger',
};

export const SPEC_STATUS_BADGE_VARIANT: Record<SpecStatus, BadgeVariant> = {
  DRAFT: 'muted',
  NEEDS_CHECK: 'warning',
  CONFIRMED: 'success',
};

export const CLASSIFICATION_BADGE_VARIANT: Record<Classification, BadgeVariant> = {
  AUTO: 'info',
  MANUAL: 'muted',
};

// ---------- 체크리스트 (A-1) ----------
export const CELL_STATE_LABELS: Record<CellState, string> = {
  UNCHECKED: '미검수',
  PASS: 'PASS',
  FAIL: 'FAIL',
  NOT_APPLICABLE: '해당 없음',
};

/** 셀 톤 (QA_SPEC C절): PASS = success, FAIL = danger, 미검수 = neutral, 해당 없음 = 표시만(-). */
export const CELL_STATE_BADGE_VARIANT: Record<
  Exclude<CellState, 'NOT_APPLICABLE'>,
  BadgeVariant
> = {
  UNCHECKED: 'muted',
  PASS: 'success',
  FAIL: 'danger',
};
