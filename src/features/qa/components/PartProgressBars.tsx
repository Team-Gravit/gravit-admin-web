import { PART_LABELS, PART_ORDER } from '@/features/qa/labels';
import type { PartProgress } from '@/features/qa/schemas';

/**
 * 파트별 진행률 막대 (QA_SPEC B-0). 서버·웹·앱 순서 고정.
 * 값 = (pass + fail) / total — 미검수가 아닌 셀의 비율. total = 0 이면 `-`.
 */
export function PartProgressBars({ progress }: { progress: PartProgress[] }) {
  return (
    <div className="flex flex-col gap-1">
      {PART_ORDER.map((part) => {
        const p = progress.find((row) => row.part === part);
        const done = p ? p.pass + p.fail : 0;
        const total = p?.total ?? 0;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;

        return (
          <div key={part} className="flex items-center gap-2">
            <span className="w-6 shrink-0 whitespace-nowrap text-caption text-fg-secondary">
              {PART_LABELS[part]}
            </span>
            {total > 0 ? (
              <>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-primary-subtle">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-16 shrink-0 text-right text-caption tabular-nums text-foreground">
                  {done} / {total}
                </span>
              </>
            ) : (
              <span className="text-caption text-foreground">-</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
