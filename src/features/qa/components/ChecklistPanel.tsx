import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { QaApiError } from '@/shared/api/qaClient';
import { Button } from '@/shared/components/ui/button';
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
import { QaConfirmModal } from '@/features/qa/components/QaConfirmModal';
import { EmptyState } from '@/shared/components/states/EmptyState';
import { ErrorState } from '@/shared/components/states/ErrorState';
import { LoadingSkeleton } from '@/shared/components/states/LoadingSkeleton';
import { hasRunningSetup, isStageRunning, useChecklist } from '@/features/qa/queries';
import { useDeleteChecklistItem } from '@/features/qa/mutations';
import { useNextUnchecked } from '@/features/qa/useNextUnchecked';
import { CheckCellButton } from '@/features/qa/components/CheckCellButton';
import { ChecklistItemFormModal } from '@/features/qa/components/ChecklistItemFormModal';
import { QaStageActivity } from '@/features/qa/components/QaStageActivity';
import { FeatureGroupHeader } from '@/features/qa/components/FeatureGroupHeader';
import { ProgressGauges } from '@/features/qa/components/ProgressGauges';
import { PartChips } from '@/features/qa/components/PartChips';
import { QaNotice } from '@/features/qa/components/QaNotice';
import { NOTICE_COPY } from '@/features/qa/copy';
import { PART_LABELS, PART_ORDER } from '@/features/qa/labels';
import { qaErrorView } from '@/features/qa/errorView';
import {
  partSchema,
  type ChecklistFeature,
  type ChecklistItem,
  type Part,
  type Round,
  type Sprint,
} from '@/features/qa/schemas';

export function ChecklistPanel({ sprint, round }: { sprint: Sprint; round: Round }) {
  const query = useChecklist(sprint.id, round);
  const remove = useDeleteChecklistItem(sprint.id);
  const [filter, setFilter] = useState<Part | 'ALL'>('ALL');
  const [form, setForm] = useState<{ feature: ChecklistFeature; item?: ChecklistItem } | null>(
    null,
  );
  const [deleting, setDeleting] = useState<ChecklistItem | null>(null);
  const closed = sprint.status === 'CLOSED';
  const running = hasRunningSetup(sprint);
  const tabRunning = isStageRunning(
    sprint,
    round === 1 ? ['CHECKLIST_GENERATE', 'AUTO_REVIEW'] : ['CHECKLIST_GENERATE'],
  );
  const activity = (
    <QaStageActivity>
      {round === 1 && isStageRunning(sprint, ['AUTO_REVIEW'])
        ? NOTICE_COPY.AUTO_REVIEW_RUNNING
        : NOTICE_COPY.CHECKLIST_GENERATING}
    </QaStageActivity>
  );
  const locked = closed || running;
  const parts = filter === 'ALL' ? PART_ORDER : [filter];
  const features = (query.data?.features ?? [])
    .map((feature) => ({
      ...feature,
      items: feature.items.filter((item) => filter === 'ALL' || item.parts.includes(filter)),
    }))
    .filter((feature) => filter === 'ALL' || feature.items.length > 0);
  const next = useNextUnchecked(
    features.flatMap((f) =>
      f.items.flatMap((i) =>
        parts.map((part) => ({
          key: `${i.id}:${part}`,
          featureId: f.featureId,
          unchecked:
            !closed &&
            i.cells.some((c) => c.part === part && c.state === 'UNCHECKED' && c.editable),
        })),
      ),
    ),
  );
  if (query.isLoading) return tabRunning ? activity : <LoadingSkeleton />;
  if (query.isError) {
    const view = qaErrorView(query.error);
    return (
      <ErrorState
        message={view.message}
        onRetry={view.retryable ? () => query.refetch() : undefined}
      />
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <ProgressGauges progress={sprint.progress} />
      {closed && <QaNotice>{NOTICE_COPY.CLOSED}</QaNotice>}
      {running && <QaNotice>{NOTICE_COPY.RUNNING}</QaNotice>}
      {tabRunning && activity}
      <div className="sticky top-header z-10 flex items-center justify-between border-b border-border bg-page py-3">
        <Select
          value={filter}
          onValueChange={(value) => {
            const parsed = partSchema.safeParse(value);
            setFilter(parsed.success ? parsed.data : 'ALL');
          }}
        >
          <SelectTrigger className="w-36" aria-label="파트 필터">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">전체 파트</SelectItem>
            {PART_ORDER.map((part) => (
              <SelectItem key={part} value={part}>
                {PART_LABELS[part]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" disabled={!next.hasTarget} onClick={next.next}>
          {NOTICE_COPY.NEXT_UNCHECKED}
        </Button>
      </div>
      {features.length === 0 ? (
        tabRunning ? null : (
          <EmptyState
            message={filter === 'ALL' ? NOTICE_COPY.EMPTY_ITEMS : NOTICE_COPY.EMPTY_FILTERED}
          />
        )
      ) : (
        features.map((feature) => (
          <section
            key={feature.featureId}
            aria-label={`${feature.screenId} ${feature.screenName}`}
            className="overflow-hidden rounded-lg border border-border bg-surface"
          >
            <FeatureGroupHeader
              feature={feature}
              collapsed={next.collapsed.has(feature.featureId)}
              onToggle={() => next.toggle(feature.featureId)}
            >
              {round === 2 && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={locked}
                  onClick={() => setForm({ feature })}
                >
                  항목 추가
                </Button>
              )}
            </FeatureGroupHeader>
            {!next.collapsed.has(feature.featureId) && (
              <Table className="table-fixed">
                <colgroup>
                  <col />
                  {parts.map((part) => (
                    <col key={part} className="w-28" />
                  ))}
                  <col className="w-32" />
                </colgroup>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>항목</TableHead>
                    {parts.map((part) => (
                      <TableHead key={part} className="text-center">
                        {PART_LABELS[part]}
                      </TableHead>
                    ))}
                    <TableHead>
                      <span className="sr-only">항목 관리</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feature.items.map((item) => (
                    <TableRow
                      key={item.id}
                      className="hover:bg-transparent"
                      aria-label={item.title}
                    >
                      <TableCell className="break-words">
                        <div className="flex flex-col gap-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-body font-semibold text-foreground">
                              {item.title}
                            </h3>
                            <PartChips parts={item.parts} />
                          </div>
                          <p className="whitespace-pre-wrap text-body text-fg-secondary">
                            {item.expected}
                          </p>
                        </div>
                      </TableCell>
                      {parts.map((part) => {
                        const cell = item.cells.find((c) => c.part === part);
                        const key = `${item.id}:${part}`;
                        return (
                          <TableCell key={part} className="text-center">
                            {cell ? (
                              <CheckCellButton
                                sprintId={sprint.id}
                                round={round}
                                item={item}
                                cell={cell}
                                closed={closed}
                                sprintStatus={sprint.status}
                                registerRef={(el) => next.register(key, el)}
                                onFocusCell={() => next.onFocus(key)}
                              />
                            ) : (
                              <span className="text-fg-muted">-</span>
                            )}
                          </TableCell>
                        );
                      })}
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={locked}
                            aria-label="수정"
                            title="항목 수정"
                            className="px-2"
                            onClick={() => setForm({ feature, item })}
                          >
                            <Pencil aria-hidden />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="px-2 text-danger-text"
                            aria-label="삭제"
                            title="항목 삭제"
                            disabled={locked}
                            onClick={() => {
                              remove.reset();
                              setDeleting(item);
                            }}
                          >
                            <Trash2 aria-hidden />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </section>
        ))
      )}
      {form && (
        <ChecklistItemFormModal
          sprintId={sprint.id}
          feature={form.feature}
          item={form.item}
          locked={locked}
          onClose={() => setForm(null)}
        />
      )}
      <QaConfirmModal
        open={deleting !== null}
        title="항목을 삭제할까요?"
        description={
          <>
            {deleting?.title}
            <br />
            {NOTICE_COPY.ITEM_DELETE_IRREVERSIBLE}
          </>
        }
        confirmLabel="삭제"
        variant="destructive"
        pending={remove.isPending}
        disabled={locked}
        error={remove.isError ? remove.error.message : undefined}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deleting &&
          !locked &&
          remove.mutate(
            { itemId: deleting.id, version: deleting.version },
            {
              onSuccess: () => setDeleting(null),
              onError: (error) => {
                if (error instanceof QaApiError && error.code === 'GLOBAL_4091') setDeleting(null);
              },
            },
          )
        }
      />
    </div>
  );
}
