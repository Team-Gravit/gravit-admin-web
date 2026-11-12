import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { StatusBadge } from '@/shared/components/status-badge/StatusBadge';
import { useUpdateDesignItem } from '@/features/qa/mutations';
import { DesignHistoryModal } from '@/features/qa/components/DesignHistoryModal';
import { CELL_STATE_BADGE_VARIANT, CELL_STATE_LABELS } from '@/features/qa/labels';
import type { DesignItem } from '@/features/qa/schemas';
export function DesignReviewItem({
  sprintId,
  item,
  closed,
  registerRef,
  onFocus,
}: {
  sprintId: number;
  item: DesignItem;
  closed: boolean;
  registerRef: (element: HTMLButtonElement | null) => void;
  onFocus: () => void;
}) {
  const update = useUpdateDesignItem(sprintId);
  const [history, setHistory] = useState(false);
  const locked = closed || !item.editable;
  return (
    <article aria-label={`${item.platform} ${item.title}`} className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-3">
        <span className="text-caption font-medium text-fg-secondary">{item.platform}</span>
        <h3 className="text-body font-medium text-foreground">{item.title}</h3>
        <StatusBadge variant={CELL_STATE_BADGE_VARIANT[item.state]}>
          {CELL_STATE_LABELS[item.state]}
        </StatusBadge>
      </div>
      <p className="whitespace-pre-wrap rounded-md bg-page px-3 py-2 text-caption text-fg-secondary">
        {item.expected}
      </p>
      {item.reason === 'Figma 프레임 없음' && (
        <p className="text-caption text-fg-muted">{item.reason}</p>
      )}
      <div className="flex items-center gap-2" role="group" aria-label={`${item.title} 판정`}>
        {(['PASS', 'FAIL', 'NOT_APPLICABLE'] as const).map((state, i) => (
          <Button
            key={state}
            ref={i === 0 ? registerRef : undefined}
            size="sm"
            variant={item.state === state ? 'default' : 'outline'}
            disabled={locked || update.isPending}
            aria-busy={update.isPending && update.variables.state === state}
            aria-pressed={item.state === state}
            onFocus={onFocus}
            onClick={() =>
              item.state !== state &&
              update.mutate({ itemId: item.id, state, version: item.version })
            }
          >
            {update.isPending && update.variables.state === state && (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            )}
            {CELL_STATE_LABELS[state]}
          </Button>
        ))}
        {item.state !== 'UNCHECKED' && !locked && (
          <Button
            size="sm"
            variant="ghost"
            disabled={update.isPending}
            aria-busy={update.isPending && update.variables.state === 'UNCHECKED'}
            onClick={() =>
              update.mutate({ itemId: item.id, state: 'UNCHECKED', version: item.version })
            }
          >
            {update.isPending && update.variables.state === 'UNCHECKED' && (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            )}
            미검수로 변경
          </Button>
        )}
        <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setHistory(true)}>
          이력 보기
        </Button>
      </div>
      {history && <DesignHistoryModal item={item} onClose={() => setHistory(false)} />}
    </article>
  );
}
