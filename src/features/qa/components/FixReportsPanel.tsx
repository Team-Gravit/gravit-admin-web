import { QaTooltipContent } from '@/features/qa/components/QaTooltipContent';
import { Download } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Tooltip, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { LoadingSkeleton } from '@/shared/components/states/LoadingSkeleton';
import { ErrorState } from '@/shared/components/states/ErrorState';
import { QaNotice } from '@/features/qa/components/QaNotice';
import { QaStageActivity } from '@/features/qa/components/QaStageActivity';
import { hasRunningSetup, useFixReports } from '@/features/qa/queries';
import { useDownloadFixReport } from '@/features/qa/mutations';
import { qaErrorView } from '@/features/qa/errorView';
import { NOTICE_COPY } from '@/features/qa/copy';
import { FIX_REPORT_PART_LABELS, PROGRESS_ORDER, SPRINT_STATUS_LABELS } from '@/features/qa/labels';
import type { Sprint } from '@/features/qa/schemas';

export function FixReportsPanel({ sprint }: { sprint: Sprint }) {
  const query = useFixReports(sprint.id);
  const download = useDownloadFixReport(sprint.id);
  const running = hasRunningSetup(sprint);
  const activity = <QaStageActivity>{NOTICE_COPY.FIXES_RUNNING}</QaStageActivity>;
  if (query.isLoading) return running ? activity : <LoadingSkeleton rows={4} />;
  if (query.isError || !query.data) {
    const view = qaErrorView(query.error);
    return (
      <ErrorState
        message={view.message}
        onRetry={view.retryable ? () => query.refetch() : undefined}
      />
    );
  }
  if (running) return activity;
  const reports = query.data;
  if (!reports.ready) {
    return (
      <div className="flex flex-col gap-2 text-body text-fg-secondary">
        <QaNotice>{NOTICE_COPY.FIXES_NOT_READY}</QaNotice>
        {reports.status === 'MANUAL_REVIEW' ? (
          <p>
            {NOTICE_COPY.FIXES_UNCHECKED}: {NOTICE_COPY.FIXES_UNCHECKED_SUMMARY(reports.unchecked)}
          </p>
        ) : (
          <p>
            {NOTICE_COPY.FIXES_CURRENT_STAGE}: {SPRINT_STATUS_LABELS[reports.status]}
          </p>
        )}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-4 gap-4">
      {PROGRESS_ORDER.map((part) => {
        const report = reports.parts.find((entry) => entry.part === part)!;
        const empty = report.failCount === 0;
        const pending = download.isPending;
        const disabled = empty || pending;
        const downloading = pending && download.variables.part === part;
        const label = FIX_REPORT_PART_LABELS[part];
        return (
          <section
            key={part}
            aria-label={NOTICE_COPY.FIXES_CARD_LABEL(label)}
            className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6"
          >
            <h2 className="text-h3 text-foreground">{label}</h2>
            <p className="text-body text-fg-secondary">
              {NOTICE_COPY.FIXES_FAIL_COUNT}{' '}
              <span className="font-semibold text-foreground">{report.failCount}</span>
            </p>
            <p className="min-h-5 break-words text-caption text-fg-muted">
              {empty ? NOTICE_COPY.FIXES_EMPTY : report.fileName}
            </p>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className="mt-auto inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  tabIndex={disabled ? 0 : undefined}
                  aria-label={
                    disabled
                      ? `${label}: ${empty ? NOTICE_COPY.FIXES_EMPTY : NOTICE_COPY.FIXES_DOWNLOAD_PENDING}`
                      : undefined
                  }
                >
                  <Button
                    className="w-full"
                    variant="outline"
                    disabled={disabled}
                    aria-busy={downloading}
                    onClick={() => download.mutate({ part, fileName: report.fileName })}
                  >
                    <Download aria-hidden />
                    {downloading ? NOTICE_COPY.FIXES_DOWNLOADING : NOTICE_COPY.FIXES_DOWNLOAD}
                  </Button>
                </span>
              </TooltipTrigger>
              <QaTooltipContent>
                {empty
                  ? NOTICE_COPY.FIXES_EMPTY
                  : pending
                    ? NOTICE_COPY.FIXES_DOWNLOAD_PENDING
                    : `${label} ${NOTICE_COPY.FIXES_DOWNLOAD}`}
              </QaTooltipContent>
            </Tooltip>
          </section>
        );
      })}
    </div>
  );
}
