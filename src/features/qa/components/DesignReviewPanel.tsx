import { Button } from '@/shared/components/ui/button';
import { LoadingSkeleton } from '@/shared/components/states/LoadingSkeleton';
import { EmptyState } from '@/shared/components/states/EmptyState';
import { ErrorState } from '@/shared/components/states/ErrorState';
import { hasRunningSetup, isStageRunning, useDesignReview } from '@/features/qa/queries';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { QaStageActivity } from '@/features/qa/components/QaStageActivity';
import { useNextUnchecked } from '@/features/qa/useNextUnchecked';
import { ProgressGauges } from '@/features/qa/components/ProgressGauges';
import { FeatureGroupHeader } from '@/features/qa/components/FeatureGroupHeader';
import { DesignReviewItem } from '@/features/qa/components/DesignReviewItem';
import { QaNotice } from '@/features/qa/components/QaNotice';
import { NOTICE_COPY } from '@/features/qa/copy';
import { qaErrorView } from '@/features/qa/errorView';
import type { Sprint } from '@/features/qa/schemas';
export function DesignReviewPanel({ sprint }: { sprint: Sprint }) {
  const query = useDesignReview(sprint.id);
  const closed = sprint.status === 'CLOSED';
  const running = hasRunningSetup(sprint);
  const tabRunning = isStageRunning(sprint, ['DESIGN_REVIEW']);
  const features = query.data?.features ?? [];
  const next = useNextUnchecked(
    features.flatMap((f) =>
      f.items.map((i) => ({
        key: String(i.id),
        featureId: f.featureId,
        unchecked: !closed && i.editable && i.state === 'UNCHECKED',
      })),
    ),
  );
  if (query.isLoading)
    return tabRunning ? (
      <QaStageActivity>{NOTICE_COPY.DESIGN_REVIEW_RUNNING}</QaStageActivity>
    ) : (
      <LoadingSkeleton />
    );
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
      {tabRunning && <QaStageActivity>{NOTICE_COPY.DESIGN_REVIEW_RUNNING}</QaStageActivity>}
      <div className="sticky top-header z-10 flex justify-end bg-page py-3">
        <Button size="sm" disabled={!next.hasTarget} onClick={next.next}>
          {NOTICE_COPY.NEXT_UNCHECKED}
        </Button>
      </div>
      {features.length === 0 ? (
        tabRunning ? null : (
          <EmptyState message={NOTICE_COPY.EMPTY_ITEMS} />
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
            />
            {!next.collapsed.has(feature.featureId) && (
              <Table className="table-fixed">
                <colgroup>
                  <col />
                  <col className="w-28" />
                  <col className="w-28" />
                  <col className="w-32" />
                </colgroup>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>항목</TableHead>
                    <TableHead className="text-center">Web</TableHead>
                    <TableHead className="text-center">APP</TableHead>
                    <TableHead>
                      <span className="sr-only">항목 관리</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feature.items.map((item) => (
                    <DesignReviewItem
                      key={item.id}
                      sprintId={sprint.id}
                      item={item}
                      closed={closed}
                      running={running}
                      registerRef={(el) => next.register(String(item.id), el)}
                      onFocus={() => next.onFocus(String(item.id))}
                    />
                  ))}
                </TableBody>
              </Table>
            )}
          </section>
        ))
      )}
    </div>
  );
}
