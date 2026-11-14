import { PART_LABELS, PART_ORDER } from '@/features/qa/labels';
import type { Part } from '@/features/qa/schemas';

/** 관련 파트 칩 (D11). */
export function PartChips({ parts }: { parts: Part[] }) {
  return (
    <span className="inline-flex items-center text-caption text-fg-secondary">
      {PART_ORDER.filter((part) => parts.includes(part))
        .map((part) => PART_LABELS[part])
        .join(' · ')}
    </span>
  );
}
