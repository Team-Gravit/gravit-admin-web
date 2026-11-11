import { useState } from 'react';
import { ChevronDown, Loader2, Lock } from 'lucide-react';
import { StatusBadge } from '@/shared/components/status-badge/StatusBadge';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { CellHistoryModal } from '@/features/qa/components/CellHistoryModal';
import { useUpdateCheckCell } from '@/features/qa/mutations';
import { CELL_STATE_BADGE_VARIANT, CELL_STATE_LABELS, PART_LABELS } from '@/features/qa/labels';
import type { CheckCell, ChecklistItem, Round } from '@/features/qa/schemas';
export function CheckCellButton({
  sprintId,
  round,
  item,
  cell,
  closed,
  registerRef,
  onFocusCell,
}: {
  sprintId: number;
  round: Round;
  item: ChecklistItem;
  cell: CheckCell;
  closed: boolean;
  registerRef: (el: HTMLButtonElement | null) => void;
  onFocusCell: () => void;
}) {
  const update = useUpdateCheckCell(sprintId, round);
  const [history, setHistory] = useState(false);
  const [menu, setMenu] = useState(false);
  const locked = closed || !cell.editable;
  return (
    <>
      <DropdownMenu open={menu} onOpenChange={(open) => setMenu(open && !update.isPending)}>
        <DropdownMenuTrigger asChild>
          <button
            ref={registerRef}
            type="button"
            aria-busy={update.isPending}
            onFocus={onFocusCell}
            aria-label={`${PART_LABELS[cell.part]} ${CELL_STATE_LABELS[cell.state]} — ${locked ? '변경 이력' : '변경'}`}
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-busy:opacity-50"
          >
            {update.isPending && (
              <Loader2 className="size-3.5 animate-spin text-fg-muted" aria-hidden />
            )}
            <StatusBadge variant={CELL_STATE_BADGE_VARIANT[cell.state]}>
              {CELL_STATE_LABELS[cell.state]}
            </StatusBadge>
            {locked ? (
              <Lock className="size-3.5 text-fg-muted" aria-hidden />
            ) : (
              <ChevronDown className="size-3.5 text-fg-muted" aria-hidden />
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center">
          {!locked && (
            <>
              {(['UNCHECKED', 'PASS', 'FAIL', 'NOT_APPLICABLE'] as const).map((state) => (
                <DropdownMenuCheckboxItem
                  key={state}
                  checked={cell.state === state}
                  onCheckedChange={() => {
                    if (cell.state !== state)
                      update.mutate({
                        itemId: item.id,
                        part: cell.part,
                        state,
                        version: cell.version,
                      });
                  }}
                >
                  {CELL_STATE_LABELS[state]}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onSelect={() => setHistory(true)}>변경 이력</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {history && (
        <CellHistoryModal
          itemId={item.id}
          itemTitle={item.title}
          part={cell.part}
          onClose={() => setHistory(false)}
        />
      )}
    </>
  );
}
