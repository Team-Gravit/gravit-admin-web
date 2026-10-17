import { StatusBadge } from '@/shared/components/status-badge/StatusBadge';
import { SPRINT_STATUS_LABELS, STAGE_LABELS, stageBadgeVariant } from '@/features/qa/labels';
import type { SprintStage, SprintStatus } from '@/features/qa/schemas';

/** 단계 배지 (QA_SPEC B-0). 준비 실패는 단계 라벨 대신 실패 톤 `준비 실패`. */
export function SprintStageBadge({ stage, status }: { stage: SprintStage; status: SprintStatus }) {
  const label = status === 'PREPARE_FAILED' ? SPRINT_STATUS_LABELS.PREPARE_FAILED : STAGE_LABELS[stage];
  return <StatusBadge variant={stageBadgeVariant(stage, status)}>{label}</StatusBadge>;
}
