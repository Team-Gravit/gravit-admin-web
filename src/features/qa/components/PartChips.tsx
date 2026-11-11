import { QaChip } from '@/features/qa/components/QaChip';
import { PART_LABELS, PART_ORDER } from '@/features/qa/labels';
import type { Part } from '@/features/qa/schemas';

/** 관련 파트 칩 (D11). */
export function PartChips({ parts }: { parts: Part[] }) {
  return (
    <span className="inline-flex items-center gap-1">
      {PART_ORDER.filter((p) => parts.includes(p)).map((p) => (
        <QaChip key={p}>{PART_LABELS[p]}</QaChip>
      ))}
    </span>
  );
}
