import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { PROGRESS_LABELS, PROGRESS_ORDER } from '@/features/qa/labels';
import type { PartProgress } from '@/features/qa/schemas';

/** P9: checked/total is supplied by the server, which excludes NOT_APPLICABLE. */
export function ProgressGauges({ progress }: { progress: PartProgress[] }) {
  return (
    <div className="grid grid-cols-4 gap-4" aria-label="QA 진행도">
      {PROGRESS_ORDER.map((part) => {
        const p = progress.find((entry) => entry.part === part);
        const total = p?.total ?? 0;
        const checked = p?.checked ?? 0;
        const percent = total > 0 ? Math.round((checked / total) * 100) : 0;
        const data = [
          { value: total > 0 ? checked : 0 },
          { value: total > 0 ? Math.max(0, total - checked) : 1 },
        ];
        return (
          <section
            key={part}
            className="rounded-lg border border-border bg-surface px-4 py-3"
            aria-label={`${PROGRESS_LABELS[part]} 진행도`}
          >
            <h2 className="text-center text-body font-medium text-foreground">
              {PROGRESS_LABELS[part]}
            </h2>
            <div
              className="relative h-28"
              role="meter"
              aria-label={`${PROGRESS_LABELS[part]} 완료율`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
              aria-valuetext={total > 0 ? `${checked} / ${total}, ${percent}%` : '대상 없음'}
            >
              <div className="h-full" aria-hidden>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      dataKey="value"
                      cx="50%"
                      cy="90%"
                      startAngle={180}
                      endAngle={0}
                      innerRadius="140%"
                      outerRadius="170%"
                      stroke="none"
                      isAnimationActive={false}
                    >
                      <Cell fill="hsl(var(--primary))" />
                      <Cell fill="hsl(var(--border))" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="absolute inset-x-0 bottom-2 text-center">
                <span className="text-h2 tabular-nums text-foreground">
                  {total > 0 ? `${percent}%` : '-'}
                </span>
              </div>
            </div>
            <p className="text-center text-caption tabular-nums text-fg-muted">
              {total > 0 ? `${checked} / ${total}` : '대상 없음'}
            </p>
          </section>
        );
      })}
    </div>
  );
}
