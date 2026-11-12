import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { CloseSprintModal } from '@/features/qa/components/CloseSprintModal';
import { hasRunningSetup, useChecklist, useDesignReview } from '@/features/qa/queries';
import { NOTICE_COPY } from '@/features/qa/copy';
import { qaErrorView } from '@/features/qa/errorView';
import type { Sprint } from '@/features/qa/schemas';

export function QaCloseAction({ sprint }: { sprint: Sprint }) {
  const [closing, setClosing] = useState(false);
  const enabled = sprint.status === 'MANUAL_REVIEW';
  const first = useChecklist(sprint.id, 1, enabled);
  const second = useChecklist(sprint.id, 2, enabled);
  const design = useDesignReview(sprint.id, enabled);
  const error = first.error ?? second.error ?? design.error;
  const allChecked =
    first.isSuccess &&
    second.isSuccess &&
    design.isSuccess &&
    [...first.data.features, ...second.data.features].every((feature) =>
      feature.items.every((item) => item.cells.every((cell) => cell.state !== 'UNCHECKED')),
    ) &&
    design.data.features.every((feature) =>
      feature.items.every((item) => item.state !== 'UNCHECKED'),
    );
  const canClose =
    enabled &&
    !hasRunningSetup(sprint) &&
    allChecked &&
    !first.isFetching &&
    !second.isFetching &&
    !design.isFetching &&
    !error;
  if (sprint.status === 'CLOSED') return null;
  return (
    <div className="flex max-w-sm flex-col items-end gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="destructive"
            aria-disabled={!canClose}
            aria-describedby={!canClose ? 'qa-close-blocked' : undefined}
            className="aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
            onClick={() => canClose && setClosing(true)}
          >
            QA 종료
          </Button>
        </TooltipTrigger>
        {!canClose && <TooltipContent side="bottom">{NOTICE_COPY.CLOSE_BLOCKED}</TooltipContent>}
      </Tooltip>
      {!canClose && (
        <span id="qa-close-blocked" className="sr-only">
          {NOTICE_COPY.CLOSE_BLOCKED}
        </span>
      )}
      {!!error && (
        <div role="alert" className="text-right text-caption text-danger-text">
          <p>{qaErrorView(error).message}</p>
          {qaErrorView(error).retryable && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                void first.refetch();
                void second.refetch();
                void design.refetch();
              }}
            >
              다시 시도
            </Button>
          )}
        </div>
      )}
      {closing && (
        <CloseSprintModal sprint={sprint} canClose={canClose} onClose={() => setClosing(false)} />
      )}
    </div>
  );
}
