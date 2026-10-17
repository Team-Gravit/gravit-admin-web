import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { ROUTES } from '@/shared/constants/routes';
import { formatDate } from '@/shared/lib/formatDate';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { DataTable, type Column } from '@/shared/components/data-table/DataTable';
import { useSprints } from '@/features/qa/queries';
import { SprintStageBadge } from '@/features/qa/components/SprintStageBadge';
import { PartProgressBars } from '@/features/qa/components/PartProgressBars';
import { SprintCreateModal } from '@/features/qa/components/SprintCreateModal';
import { NOTICE_COPY, TOAST_COPY, nextActionCopy } from '@/features/qa/copy';
import { SPRINT_STATUS_LABELS } from '@/features/qa/labels';
import { qaErrorView } from '@/features/qa/errorView';
import {
  sprintStatusSchema,
  type Sprint,
  type SprintStatus,
  type SprintSummary,
} from '@/features/qa/schemas';

type StatusFilter = SprintStatus | 'ALL';

function toStatusFilter(value: string): StatusFilter {
  const parsed = sprintStatusSchema.safeParse(value);
  return parsed.success ? parsed.data : 'ALL';
}

function formatPeriod(sprint: SprintSummary): string {
  if (!sprint.periodStart && !sprint.periodEnd) return '-';
  return `${formatDate(sprint.periodStart)} ~ ${formatDate(sprint.periodEnd)}`;
}

/** QA_SPRINT_LIST (QA_SPEC B-0, decisions D9). 페이지네이션 없음 — 배열 전체. */
export function QaSprintListPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading, isError, error, refetch } = useSprints(
    statusFilter === 'ALL' ? undefined : statusFilter,
  );

  const handleCreated = (sprint: Sprint) => {
    toast.success(TOAST_COPY.SPRINT_CREATED);
    navigate(ROUTES.QA_SPRINT(sprint.id));
  };

  const columns: Array<Column<SprintSummary>> = [
    {
      key: 'sprintKey',
      header: '스프린트',
      cell: (sprint) => <span className="font-medium text-foreground">{sprint.sprintKey}</span>,
    },
    {
      key: 'period',
      header: '기간',
      headerClassName: 'w-56',
      className: 'w-56 whitespace-nowrap',
      cell: formatPeriod,
    },
    {
      key: 'stage',
      header: '단계',
      headerClassName: 'w-28',
      className: 'w-28 whitespace-nowrap',
      cell: (sprint) => <SprintStageBadge stage={sprint.guide.stage} status={sprint.status} />,
    },
    {
      key: 'progress',
      header: '진행률',
      headerClassName: 'w-64',
      className: 'w-64',
      cell: (sprint) => <PartProgressBars progress={sprint.progress} />,
    },
    {
      key: 'nextAction',
      header: '다음 할 일',
      headerClassName: 'w-40',
      className: 'w-40 text-fg-secondary',
      cell: (sprint) => nextActionCopy(sprint.guide)?.short ?? null,
    },
  ];

  const isFiltered = statusFilter !== 'ALL';
  const errorView = qaErrorView(error);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-h1 text-foreground">QA</h1>
          <p className="text-body text-fg-muted">{NOTICE_COPY.SPRINT_LIST_SUBTITLE}</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus />
          스프린트 등록
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(toStatusFilter(v))}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="상태" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">상태 전체</SelectItem>
            {sprintStatusSchema.options.map((status) => (
              <SelectItem key={status} value={status}>
                {SPRINT_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={data ?? []}
        rowKey={(sprint) => sprint.id}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorView.message}
        onRetry={errorView.retryable ? () => refetch() : undefined}
        emptyMessage={isFiltered ? NOTICE_COPY.EMPTY_FILTERED : NOTICE_COPY.EMPTY_SPRINTS}
        emptyAction={
          isFiltered ? undefined : (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus />
              스프린트 등록
            </Button>
          )
        }
        onRowClick={(sprint) => navigate(ROUTES.QA_SPRINT(sprint.id))}
      />

      <SprintCreateModal open={createOpen} onOpenChange={setCreateOpen} onCreated={handleCreated} />
    </div>
  );
}
