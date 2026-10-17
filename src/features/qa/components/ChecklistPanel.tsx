import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { ROUTES } from '@/shared/constants/routes';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { StatusBadge } from '@/shared/components/status-badge/StatusBadge';
import { EmptyState } from '@/shared/components/states/EmptyState';
import { ErrorState } from '@/shared/components/states/ErrorState';
import { LoadingSkeleton } from '@/shared/components/states/LoadingSkeleton';
import { CheckCellButton } from '@/features/qa/components/CheckCellButton';
import { ClassificationBadges } from '@/features/qa/components/ClassificationBadges';
import { QaChip } from '@/features/qa/components/QaChip';
import { QaNotice } from '@/features/qa/components/QaNotice';
import { useChecklist } from '@/features/qa/queries';
import { NOTICE_COPY, warningText } from '@/features/qa/copy';
import { qaErrorView } from '@/features/qa/errorView';
import {
  CELL_STATE_BADGE_VARIANT,
  CELL_STATE_LABELS,
  PART_LABELS,
  PART_ORDER,
  REVIEW_STATE_LABELS,
  personaLabel,
} from '@/features/qa/labels';
import { partSchema, type ChecklistItem, type Part, type Sprint } from '@/features/qa/schemas';

type PartFilter = Part | 'ALL';

function toPartFilter(value: string): PartFilter {
  const parsed = partSchema.safeParse(value);
  return parsed.success ? parsed.data : 'ALL';
}

const cellKey = (itemId: number, part: Part) => `${itemId}:${part}`;

/** 기능 완료율 = 그 기능 셀 중 미검수가 아닌 비율 (B-4). 해당 없음·거절 항목 셀은 뺀다. */
function completion(items: ChecklistItem[]): number | null {
  const cells = items
    .filter((i) => i.reviewState !== 'REJECTED')
    .flatMap((i) => i.cells)
    .filter((c) => c.state !== 'NOT_APPLICABLE');
  if (cells.length === 0) return null;
  const done = cells.filter((c) => c.state !== 'UNCHECKED').length;
  return Math.round((done / cells.length) * 100);
}

/**
 * 체크리스트 화면 본문 (QA_SPEC B-4).
 * - IN_PROGRESS·CLOSED 가 아니면 표 대신 CHECKLIST_NOT_READY + 분류 검토 링크
 * - CLOSED 면 모든 셀 읽기 전용 + CHECKLIST_CLOSED
 * - 상단 고정 줄: 범례 · 파트 필터(선택한 파트 열만) · [다음 미검수] · 거절 항목 보기(결정 #9, 기본 숨김) · 파트별 진행률
 */
export function ChecklistPanel({ sprint }: { sprint: Sprint }) {
  const ready = sprint.status === 'IN_PROGRESS' || sprint.status === 'CLOSED';
  const closed = sprint.status === 'CLOSED';
  const checklistQuery = useChecklist(sprint.id, ready);
  const checklist = checklistQuery.data;

  const [partFilter, setPartFilter] = useState<PartFilter>('ALL');
  const [showRejected, setShowRejected] = useState(false);
  const [collapsed, setCollapsed] = useState<ReadonlySet<number>>(new Set());
  const [expanded, setExpanded] = useState<ReadonlySet<number>>(new Set());
  const [pendingFocus, setPendingFocus] = useState<string | null>(null);
  const cellRefs = useRef(new Map<string, HTMLButtonElement>());
  const lastFocused = useRef<string | null>(null);

  const parts = useMemo<readonly Part[]>(
    () => (partFilter === 'ALL' ? PART_ORDER : [partFilter]),
    [partFilter],
  );

  const blocks = useMemo(
    () =>
      checklist?.features
        .map((b) => ({
          ...b,
          items: b.items.filter((i) => showRejected || i.reviewState !== 'REJECTED'),
        }))
        // 보이는 항목이 없는 기능(전부 거절 + 거절 보기 끔)은 빈 머리만 남지 않게 숨긴다
        .filter((b) => b.items.length > 0) ?? [],
    [checklist, showRejected],
  );

  // 문서 순서의 셀 목록 — [다음 미검수]는 현재 필터(파트·거절 보기) 안에서 찾는다
  const order = useMemo(
    () =>
      blocks.flatMap((b) =>
        b.items.flatMap((item) =>
          parts.map((part) => ({
            key: cellKey(item.id, part),
            featureId: b.feature.id,
            cell: item.cells.find((c) => c.part === part),
          })),
        ),
      ),
    [blocks, parts],
  );
  const isTarget = useCallback(
    (o: (typeof order)[number]) => !closed && o.cell?.state === 'UNCHECKED' && o.cell.editable,
    [closed],
  );
  const hasTarget = order.some(isTarget);

  const focusCell = useCallback((key: string) => {
    const el = cellRefs.current.get(key);
    if (!el) return;
    el.scrollIntoView({ block: 'center' });
    el.focus({ preventScroll: true });
    lastFocused.current = key;
  }, []);

  // 접힌 그룹 안의 셀이면 펼친 뒤(렌더 후) 포커스한다
  useEffect(() => {
    if (!pendingFocus) return;
    focusCell(pendingFocus);
    setPendingFocus(null);
  }, [pendingFocus, focusCell]);

  const goNextUnchecked = () => {
    const from = order.findIndex((o) => o.key === lastFocused.current);
    const next = order.slice(from + 1).find(isTarget) ?? order.find(isTarget);
    if (!next) return;
    if (collapsed.has(next.featureId)) {
      setCollapsed((prev) => {
        const copy = new Set(prev);
        copy.delete(next.featureId);
        return copy;
      });
      setPendingFocus(next.key);
    } else {
      focusCell(next.key);
    }
  };

  const toggle = (set: ReadonlySet<number>, id: number) => {
    const copy = new Set(set);
    if (copy.has(id)) copy.delete(id);
    else copy.add(id);
    return copy;
  };

  if (!ready) {
    return (
      <div className="rounded-lg border border-border bg-surface">
        <EmptyState
          message={NOTICE_COPY.CHECKLIST_NOT_READY}
          action={
            <Button variant="outline" asChild>
              <Link to={ROUTES.QA_SPRINT_REVIEW(sprint.id)}>분류 검토로 이동</Link>
            </Button>
          }
        />
      </div>
    );
  }
  if (checklistQuery.isLoading) return <LoadingSkeleton />;
  if (checklistQuery.isError || !checklist) {
    const view = qaErrorView(checklistQuery.error);
    return (
      <ErrorState
        message={view.message}
        onRetry={view.retryable ? () => checklistQuery.refetch() : undefined}
      />
    );
  }

  const colSpan = 1 + parts.length;

  return (
    <div className="flex flex-col gap-4">
      {closed && <QaNotice>{NOTICE_COPY.CHECKLIST_CLOSED}</QaNotice>}

      {/* 상단 고정 줄 — 스크롤해도 공통 Header 바로 아래에 남는다 */}
      <div className="sticky top-header z-10 flex flex-col gap-3 border-b border-border bg-page py-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <ul className="flex items-center gap-3" aria-label="셀 상태 범례">
            {(['UNCHECKED', 'PASS', 'FAIL'] as const).map((s) => (
              <li key={s}>
                <StatusBadge variant={CELL_STATE_BADGE_VARIANT[s]}>
                  {CELL_STATE_LABELS[s]}
                </StatusBadge>
              </li>
            ))}
            <li className="flex items-center gap-1 text-caption text-fg-secondary">
              <span className="text-fg-muted">-</span>
              {CELL_STATE_LABELS.NOT_APPLICABLE}
            </li>
          </ul>

          <div className="flex items-center gap-4">
            <Select value={partFilter} onValueChange={(v) => setPartFilter(toPartFilter(v))}>
              <SelectTrigger className="w-28" aria-label="파트 필터">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                {PART_ORDER.map((p) => (
                  <SelectItem key={p} value={p}>
                    {PART_LABELS[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <label
              htmlFor="qa-show-rejected"
              className="flex items-center gap-2 text-body text-foreground"
            >
              <Checkbox
                id="qa-show-rejected"
                checked={showRejected}
                onCheckedChange={(c) => setShowRejected(c === true)}
              />
              거절 항목 보기
            </label>
            <Button size="sm" variant="outline" disabled={!hasTarget} onClick={goNextUnchecked}>
              {hasTarget ? '다음 미검수' : '미검수 없음'}
            </Button>
          </div>
        </div>

        <ul
          className="flex flex-wrap gap-x-6 gap-y-1 text-caption text-fg-secondary"
          aria-label="진행률"
        >
          {PART_ORDER.map((part) => {
            const p = sprint.progress.find((row) => row.part === part);
            if (!p) return null;
            return (
              <li key={part}>
                <span className="font-medium text-foreground">{PART_LABELS[part]}</span> PASS{' '}
                {p.pass}, FAIL {p.fail}, 미검수 {p.unchecked} / 전체 {p.total}
              </li>
            );
          })}
        </ul>
      </div>

      {blocks.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface">
          <EmptyState message="체크 항목이 없습니다." />
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-surface">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>항목</TableHead>
                {parts.map((p) => (
                  <TableHead key={p} className="w-32 text-center">
                    {PART_LABELS[p]}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {blocks.map(({ feature, warnings, items }) => {
                const isCollapsed = collapsed.has(feature.id);
                const rate = completion(items);
                return (
                  <Fragment key={feature.id}>
                    <TableRow className="bg-page hover:bg-page">
                      <TableCell colSpan={colSpan} className="py-2.5">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setCollapsed((prev) => toggle(prev, feature.id))}
                            aria-expanded={!isCollapsed}
                            aria-label={isCollapsed ? '펼치기' : '접기'}
                            className="text-fg-muted hover:text-foreground"
                          >
                            {isCollapsed ? (
                              <ChevronRight className="size-4" />
                            ) : (
                              <ChevronDown className="size-4" />
                            )}
                          </button>
                          <code className="font-mono text-caption text-fg-secondary">
                            {feature.screenId}
                          </code>
                          <span className="font-medium text-foreground">{feature.name}</span>
                          {rate !== null && (
                            <span className="text-caption text-fg-muted">{rate}% 완료</span>
                          )}
                          {warnings.length > 0 && (
                            <span title={warnings.map(warningText).join('\n')}>
                              <StatusBadge variant="warning">경고 {warnings.length}</StatusBadge>
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>

                    {!isCollapsed &&
                      items.map((item) => {
                        const open = expanded.has(item.id);
                        const rejected = item.reviewState === 'REJECTED';
                        return (
                          <Fragment key={item.id}>
                            <TableRow
                              className={`hover:bg-transparent ${open ? 'border-b-0' : ''}`}
                            >
                              <TableCell>
                                <div className="flex flex-wrap items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setExpanded((prev) => toggle(prev, item.id))}
                                    aria-expanded={open}
                                    className={`text-left hover:underline ${rejected ? 'text-fg-muted line-through' : 'text-foreground'}`}
                                  >
                                    {item.title}
                                  </button>
                                  {rejected && <QaChip>{REVIEW_STATE_LABELS.REJECTED}</QaChip>}
                                  {item.personaKey && (
                                    <QaChip>{personaLabel(item.personaKey)}</QaChip>
                                  )}
                                  <ClassificationBadges item={item} />
                                </div>
                              </TableCell>
                              {parts.map((part) => {
                                const cell = item.cells.find((c) => c.part === part);
                                const key = cellKey(item.id, part);
                                return (
                                  <TableCell key={part} className="text-center">
                                    {cell ? (
                                      <CheckCellButton
                                        sprintId={sprint.id}
                                        item={item}
                                        cell={cell}
                                        closed={closed}
                                        registerRef={(el) => {
                                          if (el) cellRefs.current.set(key, el);
                                          else cellRefs.current.delete(key);
                                        }}
                                        onFocusCell={() => {
                                          lastFocused.current = key;
                                        }}
                                      />
                                    ) : (
                                      <span className="text-fg-muted">-</span>
                                    )}
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                            {open && (
                              <TableRow className="hover:bg-transparent">
                                <TableCell
                                  colSpan={colSpan}
                                  className="whitespace-pre-wrap pt-0 text-fg-secondary"
                                >
                                  {item.expected}
                                </TableCell>
                              </TableRow>
                            )}
                          </Fragment>
                        );
                      })}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
