import { CELL_CATEGORIES } from '@/features/qa/status';
import { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { TableCell, TableRow } from '@/shared/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { QaApiError } from '@/shared/api/qaClient';
import { useDeleteDesignItem, useUpdateDesignItem } from '@/features/qa/mutations';
import { DesignHistoryModal } from '@/features/qa/components/DesignHistoryModal';
import { DesignItemFormModal } from '@/features/qa/components/DesignItemFormModal';
import { QaConfirmModal } from '@/features/qa/components/QaConfirmModal';
import { QaStatusIcon } from '@/features/qa/components/QaStatusIcon';
import { CELL_STATE_LABELS, PART_LABELS } from '@/features/qa/labels';
import type { DesignItem } from '@/features/qa/schemas';

export function DesignReviewItem({
  sprintId,
  item,
  closed,
  running,
  registerRef,
  onFocus,
}: {
  sprintId: number;
  item: DesignItem;
  closed: boolean;
  running: boolean;
  registerRef: (element: HTMLButtonElement | null) => void;
  onFocus: () => void;
}) {
  const update = useUpdateDesignItem(sprintId);
  const remove = useDeleteDesignItem(sprintId);
  const [history, setHistory] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [menu, setMenu] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const locked = closed || !item.editable;
  const managementLocked = locked || running;
  return (
    <>
      <TableRow aria-label={`${item.platform} ${item.title}`} className="hover:bg-transparent">
        <TableCell className="break-words">
          <h3 className="mb-2 text-body font-medium text-foreground">{item.title}</h3>
          <p className="whitespace-pre-wrap rounded-md bg-page px-3 py-2 text-caption text-fg-secondary">
            {item.expected}
          </p>
          {item.reason === 'Figma 프레임 없음' && (
            <p className="mt-2 text-caption text-fg-muted">{item.reason}</p>
          )}
        </TableCell>
        {(['WEB', 'APP'] as const).map((platform) => (
          <TableCell key={platform} className="text-center">
            {item.platform !== platform ? (
              <span className="text-fg-muted">—</span>
            ) : (
              <DropdownMenu
                modal={false}
                open={menu}
                onOpenChange={(open) => setMenu(open && !update.isPending)}
              >
                <Tooltip
                  open={
                    menu || history || editing || deleting || update.isPending ? false : undefined
                  }
                >
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <button
                        ref={(element) => {
                          triggerRef.current = element;
                          registerRef(element);
                        }}
                        type="button"
                        onFocus={onFocus}
                        aria-disabled={update.isPending}
                        aria-busy={update.isPending}
                        aria-label={`${PART_LABELS[item.platform]} ${CELL_STATE_LABELS[item.state]} — ${locked ? '변경 이력' : '변경'}`}
                        className="relative inline-flex h-10 w-16 items-center justify-center rounded-md hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <QaStatusIcon
                          category={CELL_CATEGORIES[item.state]}
                          label={CELL_STATE_LABELS[item.state]}
                          tooltip={false}
                          pending={update.isPending}
                        />
                        {!locked && (
                          <ChevronDown
                            className="absolute right-0 size-3.5 text-fg-muted"
                            aria-hidden
                          />
                        )}
                      </button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{CELL_STATE_LABELS[item.state]}</TooltipContent>
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
                      {(['UNCHECKED', 'PASS', 'FAIL', 'NOT_APPLICABLE'] as const).map((state) => (
                        <DropdownMenuCheckboxItem
                          key={state}
                          checked={item.state === state}
                          onCheckedChange={() => {
                            setMenu(false);
                            if (!update.isPending && item.state !== state)
                              update.mutate({ itemId: item.id, state, version: item.version });
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
            )}
          </TableCell>
        ))}
        <TableCell>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              disabled={managementLocked}
              onClick={() => setEditing(true)}
            >
              수정
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-danger-text"
              disabled={managementLocked}
              onClick={() => {
                remove.reset();
                setDeleting(true);
              }}
            >
              삭제
            </Button>
          </div>
        </TableCell>
      </TableRow>
      {history && <DesignHistoryModal item={item} onClose={() => setHistory(false)} />}
      {editing && (
        <DesignItemFormModal
          sprintId={sprintId}
          item={item}
          locked={managementLocked}
          onClose={() => setEditing(false)}
        />
      )}
      <QaConfirmModal
        open={deleting}
        title="디자인 항목을 삭제할까요?"
        description={
          <>
            {item.title}
            <br />
            삭제한 항목은 되돌릴 수 없습니다.
          </>
        }
        confirmLabel="삭제"
        variant="destructive"
        pending={remove.isPending}
        disabled={managementLocked}
        error={remove.isError ? remove.error.message : undefined}
        onClose={() => setDeleting(false)}
        onConfirm={() => {
          if (!managementLocked)
            remove.mutate(
              { itemId: item.id, version: item.version },
              {
                onSuccess: () => setDeleting(false),
                onError: (error) => {
                  if (error instanceof QaApiError && error.code === 'GLOBAL_4091')
                    setDeleting(false);
                },
              },
            );
        }}
      />
    </>
  );
}
