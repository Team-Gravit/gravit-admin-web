import { useState } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
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
import { NOTICE_COPY } from '@/features/qa/copy';
import { CELL_STATE_BADGE_VARIANT, CELL_STATE_LABELS, PART_LABELS } from '@/features/qa/labels';
import type { CellState, CheckCell, ChecklistItem } from '@/features/qa/schemas';

/** 사람이 고를 수 있는 상태 (A-2 #12) */
const CHOICES: ReadonlyArray<Exclude<CellState, 'NOT_APPLICABLE'>> = ['UNCHECKED', 'PASS', 'FAIL'];

interface CheckCellButtonProps {
  sprintId: number;
  item: ChecklistItem;
  cell: CheckCell;
  /** 종료된 스프린트 — 모든 셀 읽기 전용 */
  closed: boolean;
  /** [다음 미검수]가 포커스를 옮길 수 있게 버튼을 등록한다 */
  registerRef: (el: HTMLButtonElement | null) => void;
  onFocusCell: () => void;
}

/**
 * 체크 셀 (QA_SPEC B-4).
 * - 해당 없음: `-`, 비활성
 * - editable = false(자동 판정·종료): 상태 변경 불가, 툴팁 CELL_LOCKED_AUTO / CELL_LOCKED_CLOSED.
 *   클릭하면 `변경 이력` 만 있는 메뉴(이력 조회는 셀 잠금과 무관)
 * - editable = true: 버튼 → 메뉴(미검수·PASS·FAIL, 구분선, 변경 이력), 현재 상태에 체크.
 *   선택하면 PUT { state, version } — 낙관적 갱신 없이 응답으로 그 셀만 바꾼다(결정 #10). 요청 중 스피너.
 * Tab 으로 이동, Enter 로 메뉴 열기는 dropdown-menu 기본 동작.
 */
export function CheckCellButton({
  sprintId,
  item,
  cell,
  closed,
  registerRef,
  onFocusCell,
}: CheckCellButtonProps) {
  const update = useUpdateCheckCell(sprintId);
  const [historyOpen, setHistoryOpen] = useState(false);
  // 요청 중에는 메뉴를 열지 않는다 — trigger 를 disabled 로 두면 선택 직후 포커스가 body 로 빠진다
  const [menuOpen, setMenuOpen] = useState(false);

  if (cell.state === 'NOT_APPLICABLE') {
    return (
      <span className="text-fg-muted" aria-label={`${PART_LABELS[cell.part]} 해당 없음`}>
        -
      </span>
    );
  }

  const label = CELL_STATE_LABELS[cell.state];
  const badge = <StatusBadge variant={CELL_STATE_BADGE_VARIANT[cell.state]}>{label}</StatusBadge>;

  // 잠긴 셀(자동 판정·종료·편집 불가)도 이력은 볼 수 있다 — 메뉴에 `변경 이력` 만 둔다(B-4)
  const locked = closed || !cell.editable;
  const tip = !locked
    ? undefined
    : closed
      ? NOTICE_COPY.CELL_LOCKED_CLOSED
      : cell.source === 'AUTO'
        ? NOTICE_COPY.CELL_LOCKED_AUTO
        : undefined;

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={(open) => setMenuOpen(open && !update.isPending)}>
        <DropdownMenuTrigger asChild>
          <button
            ref={registerRef}
            type="button"
            title={tip}
            onFocus={onFocusCell}
            aria-busy={update.isPending}
            aria-label={`${PART_LABELS[cell.part]} ${label} — ${locked ? '변경 이력' : '변경'}`}
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-busy:opacity-50"
          >
            {update.isPending && <Loader2 className="size-3.5 animate-spin text-fg-muted" />}
            {badge}
            <ChevronDown className="size-3.5 text-fg-muted" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center">
          {!locked && (
            <>
              {CHOICES.map((state) => (
                <DropdownMenuCheckboxItem
                  key={state}
                  checked={cell.state === state}
                  onCheckedChange={() => {
                    if (state === cell.state) return;
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
          <DropdownMenuItem onSelect={() => setHistoryOpen(true)}>변경 이력</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {historyOpen && (
        <CellHistoryModal
          onClose={() => setHistoryOpen(false)}
          itemId={item.id}
          itemTitle={item.title}
          part={cell.part}
        />
      )}
    </>
  );
}
