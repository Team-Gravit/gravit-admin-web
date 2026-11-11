import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { ROUTES } from '@/shared/constants/routes';
import { Button } from '@/shared/components/ui/button';
import { DataTable, type Column } from '@/shared/components/data-table/DataTable';
import { useSprints } from '@/features/qa/queries';
import { SprintStatusBadge } from '@/features/qa/components/SprintStatusBadge';
import { SprintCreateModal } from '@/features/qa/components/SprintCreateModal';
import { NOTICE_COPY, TOAST_COPY } from '@/features/qa/copy';
import { qaErrorView } from '@/features/qa/errorView';
import type { Sprint, SprintSummary } from '@/features/qa/schemas';

/** W1: exactly three columns; one list request, no status filter or per-row requests. */
export function QaSprintListPage() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const [createOpen, setCreateOpen] = useState(false);
  const query = useSprints();
  const view = qaErrorView(query.error);
  const columns: Column<SprintSummary>[] = [
    {
      key: 'sprintKey',
      header: '스프린트',
      cell: (s) => <span className="font-medium text-foreground">{s.sprintKey}</span>,
    },
    { key: 'summary', header: '약식 설명', cell: (s) => s.summary || '-' },
    {
      key: 'status',
      header: '현재 상태',
      className: 'w-44',
      headerClassName: 'w-44',
      cell: (s) => <SprintStatusBadge status={s.status} />,
    },
  ];
  const handleCreated = (s: Sprint) => {
    toast.success(TOAST_COPY.SPRINT_CREATED);
    navigate({ pathname: ROUTES.QA_SPRINT(s.id), search });
  };
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
      <DataTable
        columns={columns}
        data={query.data ?? []}
        rowKey={(s) => s.id}
        isLoading={query.isLoading}
        isError={query.isError}
        errorMessage={view.message}
        onRetry={view.retryable ? () => query.refetch() : undefined}
        emptyMessage={NOTICE_COPY.EMPTY_SPRINTS}
        emptyAction={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus />
            스프린트 등록
          </Button>
        }
        onRowClick={(s) => navigate({ pathname: ROUTES.QA_SPRINT(s.id), search })}
      />
      <SprintCreateModal open={createOpen} onOpenChange={setCreateOpen} onCreated={handleCreated} />
    </div>
  );
}
