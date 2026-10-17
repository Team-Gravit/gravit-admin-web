import { StatusBadge } from '@/shared/components/status-badge/StatusBadge';
import { CLASSIFICATION_BADGE_VARIANT, CLASSIFICATION_LABELS } from '@/features/qa/labels';
import type { ChecklistItem } from '@/features/qa/schemas';

/** 분류 배지 + `automationGap` 이면 수동 옆에 `자동화 후보` 보조 배지 (QA_SPEC A-1). 분류 검토·체크리스트 공용. */
export function ClassificationBadges({
  item,
}: {
  item: Pick<ChecklistItem, 'classification' | 'automationGap'>;
}) {
  return (
    <>
      <StatusBadge variant={CLASSIFICATION_BADGE_VARIANT[item.classification]}>
        {CLASSIFICATION_LABELS[item.classification]}
      </StatusBadge>
      {item.classification === 'MANUAL' && item.automationGap && (
        <StatusBadge variant="accent">자동화 후보</StatusBadge>
      )}
    </>
  );
}
