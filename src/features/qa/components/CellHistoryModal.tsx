import { ArrowRight } from 'lucide-react';
import { formatDateTime } from '@/shared/lib/formatDate';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { EmptyState } from '@/shared/components/states/EmptyState';
import { ErrorState } from '@/shared/components/states/ErrorState';
import { LoadingSkeleton } from '@/shared/components/states/LoadingSkeleton';
import { useCellHistory } from '@/features/qa/queries';
import { NOTICE_COPY } from '@/features/qa/copy';
import { qaErrorView } from '@/features/qa/errorView';
import { CELL_SOURCE_LABELS, CELL_STATE_LABELS, PART_LABELS } from '@/features/qa/labels';
import type { Part } from '@/features/qa/schemas';

interface CellHistoryModalProps {
  onClose: () => void;
  itemId: number;
  itemTitle: string;
  part: Part;
}

/**
 * 셀 변경 이력 (QA_SPEC B-4, A-2 #13) — 시각, `이전 → 이후`, 변경자, 출처. 최신순.
 * 변경자는 adminId 만 오므로 `운영자 #{id}`, null 이면 `자동 실행`. 열릴 때만 마운트한다.
 */
export function CellHistoryModal({ onClose, itemId, itemTitle, part }: CellHistoryModalProps) {
  const history = useCellHistory(itemId, part, true);

  const body = () => {
    if (history.isLoading) return <LoadingSkeleton rows={3} />;
    if (history.isError || !history.data) {
      const view = qaErrorView(history.error);
      return (
        <ErrorState
          className="py-8"
          message={view.message}
          onRetry={view.retryable ? () => history.refetch() : undefined}
        />
      );
    }
    if (history.data.length === 0) {
      return <EmptyState className="py-8" message={NOTICE_COPY.EMPTY_HISTORY} />;
    }
    return (
      <ol className="flex flex-col divide-y divide-border">
        {history.data.map((h, i) => (
          <li key={`${h.changedAt}-${i}`} className="flex flex-col gap-1 py-3 text-body">
            <div className="flex items-center gap-2 text-foreground">
              <span>{CELL_STATE_LABELS[h.fromState]}</span>
              <ArrowRight className="size-3.5 text-fg-muted" aria-label="에서" />
              <span className="font-medium">{CELL_STATE_LABELS[h.toState]}</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 text-caption text-fg-muted">
              <span>{formatDateTime(h.changedAt)}</span>
              <span>{h.changedBy === null ? '자동 실행' : `운영자 #${h.changedBy}`}</span>
              <span>{CELL_SOURCE_LABELS[h.source]}</span>
            </div>
          </li>
        ))}
      </ol>
    );
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>변경 이력</DialogTitle>
          <DialogDescription>
            {itemTitle} · {PART_LABELS[part]}
          </DialogDescription>
        </DialogHeader>
        {body()}
      </DialogContent>
    </Dialog>
  );
}
