import type { BadgeVariant } from '@/shared/constants/badgeVariants';
import type {
  CellState,
  Part,
  ProgressPart,
  SetupStep,
  SetupStepKey,
  SprintStatus,
} from '@/features/qa/schemas';

export const SPRINT_STATUS_LABELS: Record<SprintStatus, string> = {
  DRAFT: '준비 전',
  SPEC_LOAD: '기능 명세서 로드',
  CHECKLIST: '체크리스트 생성',
  DESIGN_REVIEW: '디자인 검수',
  AUTO_REVIEW: '1차 자동화 검수',
  MANUAL_REVIEW: '2차 수동 검수',
  CLOSED: '종료',
};
export const FLOW_ORDER: readonly SprintStatus[] = [
  'SPEC_LOAD',
  'CHECKLIST',
  'DESIGN_REVIEW',
  'AUTO_REVIEW',
  'MANUAL_REVIEW',
  'CLOSED',
];
export const PART_ORDER: readonly Part[] = ['WEB', 'APP', 'SERVER'];
export const PART_LABELS: Record<Part, string> = { SERVER: 'Server', WEB: 'Web', APP: 'APP' };
export const PROGRESS_ORDER: readonly ProgressPart[] = ['DESIGN', 'WEB', 'APP', 'SERVER'];
export const PROGRESS_LABELS: Record<ProgressPart, string> = { DESIGN: 'Design', ...PART_LABELS };
export const FIX_REPORT_PART_LABELS: Record<ProgressPart, string> = {
  DESIGN: '디자인',
  WEB: '웹',
  APP: '앱',
  SERVER: '서버',
};
export const CONNECTION_LABELS = {
  NOTION: 'Notion',
  FIGMA: 'Figma',
  SERVER: 'Server',
  WEB: 'Web',
  APP: 'APP',
};
export const SETUP_ORDER: readonly SetupStepKey[] = [
  'CONNECT',
  'SPEC_COLLECT',
  'CHECKLIST_GENERATE',
  'DESIGN_REVIEW',
  'AUTO_REVIEW',
];
export const SETUP_LABELS: Record<SetupStepKey, string> = {
  CONNECT: '연결',
  SPEC_COLLECT: '명세 수집',
  CHECKLIST_GENERATE: '체크리스트 생성',
  DESIGN_REVIEW: '디자인 검수',
  AUTO_REVIEW: '1차 자동화 검수',
};
export const SETUP_STATUS_LABELS: Record<SetupStep['status'], string> = {
  PENDING: '대기',
  RUNNING: '진행 중',
  DONE: '완료',
  FAILED: '실패',
  WAITING: '승인 대기',
};
export const SETUP_STATUS_VARIANTS: Record<SetupStep['status'], BadgeVariant> = {
  PENDING: 'muted',
  RUNNING: 'primary',
  DONE: 'success',
  FAILED: 'danger',
  WAITING: 'warning',
};
export const CELL_STATE_LABELS: Record<CellState, string> = {
  UNCHECKED: '미검수',
  PASS: 'Pass',
  FAIL: 'Fail',
  NOT_APPLICABLE: '해당 없음',
};
export const CELL_STATE_BADGE_VARIANT: Record<CellState, BadgeVariant> = {
  UNCHECKED: 'muted',
  PASS: 'success',
  FAIL: 'danger',
  NOT_APPLICABLE: 'muted',
};
export const CELL_SOURCE_LABELS = { MANUAL: '수동 판정', AUTO: '자동 판정' };
export const CLASSIFICATION_LABELS = { AUTO: '자동', MANUAL: '수동' };
export const REFLECTION_LABELS = {
  PENDING: '승인 대기',
  APPROVED: '반영 중',
  REJECTED: '거절',
  APPLIED: '반영 완료',
  FAILED: '반영 실패',
};
