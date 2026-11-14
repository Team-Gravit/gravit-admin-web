import type { ReactNode } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { QaChip } from '@/features/qa/components/QaChip';
import type { ChecklistFeature } from '@/features/qa/schemas';
export function FeatureGroupHeader({
  feature,
  collapsed,
  onToggle,
  children,
}: {
  feature: Pick<ChecklistFeature, 'screenId' | 'screenName' | 'changed' | 'completionRate'>;
  collapsed: boolean;
  onToggle: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border bg-hover px-4 py-3">
      <button
        type="button"
        aria-expanded={!collapsed}
        onClick={onToggle}
        className="flex min-w-0 flex-1 items-center gap-2 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {collapsed ? (
          <ChevronRight className="size-4 text-fg-muted" aria-hidden />
        ) : (
          <ChevronDown className="size-4 text-fg-muted" aria-hidden />
        )}
        <code className="font-mono text-caption text-fg-secondary">{feature.screenId}</code>
        <span className="text-body font-semibold text-foreground">{feature.screenName}</span>
        {feature.changed && <QaChip>변경</QaChip>}
        <span className="ml-auto shrink-0 text-caption tabular-nums text-fg-secondary">
          {feature.completionRate}% 완료
        </span>
      </button>
      {children}
    </div>
  );
}
