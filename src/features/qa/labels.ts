import type { BadgeVariant } from '@/shared/constants/badgeVariants';
import type {
  JobStatus,
  Part,
  Repo,
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
