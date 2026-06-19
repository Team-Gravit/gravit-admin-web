import { StatusBadge } from '@/shared/components/status-badge/StatusBadge';
import { problemTypeBadgeVariant } from '@/shared/constants/badgeVariants';
import { problemTypeLabels } from '@/shared/constants/labels';
import type { ProblemType } from '@/shared/constants/enums';

export function ProblemTypeBadge({ problemType }: { problemType: ProblemType }) {
  return (
    <StatusBadge variant={problemTypeBadgeVariant[problemType]}>
      {problemTypeLabels[problemType]}
    </StatusBadge>
  );
}
