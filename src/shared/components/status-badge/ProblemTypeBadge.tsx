import { StatusBadge } from '@/shared/components/status-badge/StatusBadge';
import { problemTypeBadgeVariant } from '@/shared/constants/badgeVariants';
import { problemTypeLabels } from '@/shared/constants/labels';
import type { ProblemType } from '@/shared/constants/enums';

/**
 * 문제 유형 뱃지 (DS-02 §13, 01 §6-5-4, 04 §9-8): OBJECTIVE=info "객관식", SUBJECTIVE=accent "주관식".
 * LESSON_DETAIL 문제 목록 + PROBLEM_DETAIL 헤더에서 공용(cross-feature → shared).
 */
export function ProblemTypeBadge({ problemType }: { problemType: ProblemType }) {
  return (
    <StatusBadge variant={problemTypeBadgeVariant[problemType]}>
      {problemTypeLabels[problemType]}
    </StatusBadge>
  );
}
