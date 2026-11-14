import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { LoadingSkeleton } from '@/shared/components/states/LoadingSkeleton';
import { EmptyState } from '@/shared/components/states/EmptyState';
import { ErrorState } from '@/shared/components/states/ErrorState';
import { formatDateTime } from '@/shared/lib/formatDate';
import { useDesignHistory } from '@/features/qa/queries';
import { CELL_SOURCE_LABELS, CELL_STATE_LABELS } from '@/features/qa/labels';
import { NOTICE_COPY } from '@/features/qa/copy';
import { qaErrorView } from '@/features/qa/errorView';
import type { DesignItem } from '@/features/qa/schemas';
export function DesignHistoryModal({ item, onClose }: { item: DesignItem; onClose: () => void }) {
  const query = useDesignHistory(item.id);
  const view = qaErrorView(query.error);
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-modal-history">
        <DialogHeader>
          <DialogTitle>변경 이력</DialogTitle>
          <DialogDescription>
            {item.platform} · {item.title}
          </DialogDescription>
        </DialogHeader>
        {query.isLoading ? (
          <LoadingSkeleton rows={3} />
        ) : query.isError ? (
          <ErrorState
            message={view.message}
            onRetry={view.retryable ? () => query.refetch() : undefined}
          />
        ) : !query.data?.length ? (
          <EmptyState message={NOTICE_COPY.EMPTY_HISTORY} />
        ) : (
          <ol className="divide-y divide-border">
            {query.data.map((h, i) => (
              <li key={`${h.updatedAt}-${i}`} className="flex flex-col gap-2 py-3">
                <p className="text-body tabular-nums text-foreground">
                  <span className="font-medium">{CELL_STATE_LABELS[h.state]}</span> ·{' '}
                  {formatDateTime(h.updatedAt)} · {CELL_SOURCE_LABELS[h.source]}
                  {h.updatedBy !== null && ` (운영자 #${h.updatedBy})`}
                </p>
                {h.reason && (
                  <p className="whitespace-pre-wrap rounded-md bg-page p-3 text-body text-fg-secondary">
                    {h.reason}
                  </p>
                )}
              </li>
            ))}
          </ol>
        )}
      </DialogContent>
    </Dialog>
  );
}
