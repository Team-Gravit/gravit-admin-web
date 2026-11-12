import { CELL_CATEGORIES } from '@/features/qa/status';
import { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { QaStatusIcon } from '@/features/qa/components/QaStatusIcon';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
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
import { CELL_STATE_LABELS, PART_LABELS } from '@/features/qa/labels';
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
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const locked = closed || !cell.editable;
  return (
    <>
      <DropdownMenu
        modal={false}
        open={menu}
        onOpenChange={(open) => setMenu(open && !update.isPending)}
      >
        <Tooltip open={menu || history || update.isPending ? false : undefined}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <button
                ref={(element) => {
                  triggerRef.current = element;
                  registerRef(element);
                }}
                type="button"
                aria-busy={update.isPending}
                aria-disabled={update.isPending}
                onFocus={onFocusCell}
                aria-label={`${PART_LABELS[cell.part]} ${CELL_STATE_LABELS[cell.state]} — ${locked ? '변경 이력' : '변경'}`}
                className="relative inline-flex h-10 w-16 items-center justify-center rounded-md hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <QaStatusIcon
                  category={CELL_CATEGORIES[cell.state]}
                  label={CELL_STATE_LABELS[cell.state]}
                  tooltip={false}
                  pending={update.isPending}
                />
                {!locked && cell.state !== 'NOT_APPLICABLE' && (
                  <ChevronDown className="absolute right-0 size-3.5 text-fg-muted" aria-hidden />
                )}
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">{CELL_STATE_LABELS[cell.state]}</TooltipContent>
        </Tooltip>
        <DropdownMenuContent
          align="center"
          onPointerDownOutside={(event) => {
            if (event.target instanceof Node && triggerRef.current?.contains(event.target))
              event.preventDefault();
          }}
        >
          {!locked && (
            <>
              {(['UNCHECKED', 'PASS', 'FAIL'] as const).map((state) => (
                <DropdownMenuCheckboxItem
                  key={state}
                  checked={cell.state === state}
                  onCheckedChange={() => {
                    setMenu(false);
                    if (!update.isPending && cell.state !== state)
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
