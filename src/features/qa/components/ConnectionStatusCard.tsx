import { QaStatusIcon } from '@/features/qa/components/QaStatusIcon';
import { CONNECTION_LABELS } from '@/features/qa/labels';
import { NOTICE_COPY } from '@/features/qa/copy';
import type { Connection } from '@/features/qa/schemas';

export function ConnectionStatusCard({ connections }: { connections: Connection[] }) {
  return (
    <section aria-label="연결 상태" className="rounded-lg border border-border bg-surface p-6">
      <h2 className="mb-4 text-h3 text-foreground">연결 상태</h2>
      {connections.length === 0 && (
        <p className="mb-3 text-body text-fg-muted">{NOTICE_COPY.NO_CONNECTIONS}</p>
      )}
      <ul className="divide-y divide-border">
        {(['NOTION', 'FIGMA', 'SERVER', 'WEB', 'APP'] as const).map((target) => {
          const connection = connections.find((c) => c.target === target);
          return (
            <li key={target} className="flex items-center gap-4 py-3">
              <span className="w-36 shrink-0 text-body text-foreground">
                {CONNECTION_LABELS[target]}
              </span>
              <QaStatusIcon
                category={connection ? (connection.connected ? 'success' : 'failure') : 'pending'}
                label={connection ? (connection.connected ? '연결됨' : '실패') : '확인 전'}
              />
              {connection?.ref && (
                <code className="break-all font-mono text-caption text-fg-secondary">
                  {connection.ref}
                </code>
              )}
              {connection && !connection.connected && connection.message && (
                <span className="truncate text-caption text-danger-text" title={connection.message}>
                  {connection.message}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
