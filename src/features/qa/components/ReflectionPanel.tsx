import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { StatusBadge } from '@/shared/components/status-badge/StatusBadge';
import { LoadingSkeleton } from '@/shared/components/states/LoadingSkeleton';
import { EmptyState } from '@/shared/components/states/EmptyState';
import { ErrorState } from '@/shared/components/states/ErrorState';
import { MarkdownViewer } from '@/shared/components/markdown/MarkdownViewer';
import { QaApiError } from '@/shared/api/qaClient';
import { useReflections } from '@/features/qa/queries';
import { useReflectionDecision } from '@/features/qa/mutations';
import { qaErrorView } from '@/features/qa/errorView';
import { NOTICE_COPY } from '@/features/qa/copy';
import { REFLECTION_LABELS } from '@/features/qa/labels';
import type { Reflection, Sprint } from '@/features/qa/schemas';

export function ReflectionPanel({ sprint }: { sprint: Sprint }) {
  const query = useReflections(sprint.id);
  const view = qaErrorView(query.error);
  return (
    <section
      aria-label="반영 승인"
      className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6"
    >
      <div className="flex items-center gap-3">
        <h2 className="text-h3 text-foreground">반영 승인</h2>
        <span className="text-body text-fg-muted">승인 대기 {sprint.pendingReflectionCount}건</span>
      </div>
      {query.isLoading ? (
        <LoadingSkeleton rows={3} />
      ) : query.isError ? (
        <ErrorState
          message={view.message}
          onRetry={view.retryable ? () => query.refetch() : undefined}
        />
      ) : !query.data?.length ? (
        <EmptyState className="py-8" message={NOTICE_COPY.NO_REFLECTIONS} />
      ) : (
        query.data.map((reflection) => (
          <ReflectionCard
            key={reflection.id}
            sprintId={sprint.id}
            item={reflection}
            closed={sprint.status === 'CLOSED'}
          />
        ))
      )}
    </section>
  );
}
function ReflectionCard({
  sprintId,
  item,
  closed,
}: {
  sprintId: number;
  item: Reflection;
  closed: boolean;
}) {
  const decision = useReflectionDecision(sprintId);
  const [changed, setChanged] = useState(false);
  const canDecide = !closed && (item.state === 'PENDING' || item.state === 'FAILED');
  const decide = (action: 'approve' | 'reject') =>
    decision.mutate(
      { id: item.id, action, version: item.version },
      {
        onSuccess: () => setChanged(false),
        onError: (error) =>
          setChanged(error instanceof QaApiError && error.code === 'REFLECTION_4091'),
      },
    );
  return (
    <article
      aria-label={`${item.screenId} 반영 제안`}
      className="flex flex-col gap-4 rounded-lg border border-border p-4"
    >
      <div className="flex items-center gap-2">
        <code className="font-mono text-caption text-fg-secondary">{item.screenId}</code>
        <h3 className="text-body font-medium text-foreground">{item.screenName}</h3>
        <StatusBadge
          variant={
            item.state === 'FAILED' ? 'danger' : item.state === 'APPLIED' ? 'success' : 'muted'
          }
        >
          {REFLECTION_LABELS[item.state]}
        </StatusBadge>
      </div>
      <ul className="flex flex-col gap-1 text-caption text-fg-secondary">
        {item.historyRows.map((row, i) => (
          <li key={i}>
            <span className="font-medium">{row.sprint}</span> · {row.change}
          </li>
        ))}
      </ul>
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: '바뀌기 전', content: item.before },
          { label: '바뀐 후', content: item.after },
        ].map((pane) => (
          <section
            key={pane.label}
            aria-label={pane.label}
            className="min-w-0 rounded-md bg-page p-4"
          >
            <h4 className="mb-3 text-caption font-medium text-fg-secondary">{pane.label}</h4>
            <div className="max-h-96 overflow-auto break-words">
              <MarkdownViewer content={pane.content} variant="chat" />
            </div>
          </section>
        ))}
      </div>
      {item.message && (
        <p
          role="status"
          className="whitespace-pre-wrap rounded-md bg-danger-bg px-3 py-2 text-caption text-danger-text"
        >
          {item.message}
        </p>
      )}
      {changed && (
        <p role="alert" className="text-body text-warning-text">
          {NOTICE_COPY.REFLECTION_CHANGED}
        </p>
      )}
      {canDecide && (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={decision.isPending}
            aria-busy={decision.isPending && decision.variables.action === 'reject'}
            onClick={() => decide('reject')}
          >
            {decision.isPending && decision.variables.action === 'reject' && (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            )}
            거절
          </Button>
          <Button
            size="sm"
            disabled={decision.isPending || changed}
            aria-busy={decision.isPending && decision.variables.action === 'approve'}
            onClick={() => decide('approve')}
          >
            {decision.isPending && decision.variables.action === 'approve' && (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            )}
            {item.state === 'FAILED' ? '다시 승인' : '승인'}
          </Button>
        </div>
      )}
    </article>
  );
}
