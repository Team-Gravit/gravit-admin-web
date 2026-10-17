import { ExternalLink } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { StatusBadge } from '@/shared/components/status-badge/StatusBadge';
import { QaNotice } from '@/features/qa/components/QaNotice';
import { NOTICE_COPY, warningCopy } from '@/features/qa/copy';
import { REPO_LABELS, REPO_ORDER } from '@/features/qa/labels';
import type { Baseline } from '@/features/qa/schemas';

const shortSha = (sha: string) => sha.slice(0, 7);

/** 기준점 카드 (QA_SPEC B-2). 저장소별 release 커밋과 직전 기준점 비교. */
export function BaselineCard({ baseline }: { baseline: Baseline | null }) {
  const repos = baseline
    ? [...baseline.repos].sort((a, b) => REPO_ORDER.indexOf(a.repo) - REPO_ORDER.indexOf(b.repo))
    : [];
  const versionWarning = repos.some((r) => r.versionCodeWarning);

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6">
      <h3 className="text-h3 text-foreground">기준점</h3>

      {!baseline ? (
        <QaNotice>{NOTICE_COPY.NO_BASELINE}</QaNotice>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-40">저장소</TableHead>
                <TableHead className="w-28">브랜치</TableHead>
                <TableHead className="w-28">커밋</TableHead>
                <TableHead>직전 커밋</TableHead>
                <TableHead className="w-32">비교</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repos.map((r) => (
                <TableRow key={r.repo}>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground">{REPO_LABELS[r.repo]}</span>
                        {r.versionCodeWarning && <StatusBadge variant="warning">경고</StatusBadge>}
                      </div>
                      {r.aosVersionName !== null && r.aosVersionCode !== null && (
                        <span className="text-caption text-fg-muted">
                          {r.aosVersionName} ({r.aosVersionCode})
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{r.branch}</TableCell>
                  <TableCell>
                    <code className="font-mono text-caption text-foreground" title={r.commitSha}>
                      {shortSha(r.commitSha)}
                    </code>
                  </TableCell>
                  <TableCell>
                    {r.previousCommitSha ? (
                      <code
                        className="font-mono text-caption text-foreground"
                        title={r.previousCommitSha}
                      >
                        {shortSha(r.previousCommitSha)}
                      </code>
                    ) : (
                      <span className="text-fg-muted">직전 기준점 없음(전체 범위)</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {r.compareUrl ? (
                      <a
                        href={r.compareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        변경 보기
                        <ExternalLink className="size-3.5" />
                      </a>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {versionWarning && (
            <QaNotice tone="warning">{warningCopy('VERSION_CODE_NOT_INCREASED')}</QaNotice>
          )}
        </>
      )}
    </section>
  );
}
