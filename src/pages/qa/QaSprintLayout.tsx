import { Outlet, useLocation, useParams } from 'react-router';
import { ROUTES } from '@/shared/constants/routes';
import { QA_ERROR_MESSAGES } from '@/shared/api/qaClient';
import { useSetBreadcrumb, type Crumb } from '@/shared/hooks/useBreadcrumb';
import { ErrorState } from '@/shared/components/states/ErrorState';
import { LoadingSkeleton } from '@/shared/components/states/LoadingSkeleton';
import { useSetupJob, useSprint } from '@/features/qa/queries';
import { SprintHeader } from '@/features/qa/components/SprintHeader';
import { qaErrorView } from '@/features/qa/errorView';
import { SPRINT_SCREENS } from '@/features/qa/screens';

export function QaSprintLayout() {
  const id = Number(useParams().sprintId);
  const { pathname } = useLocation();
  const query = useSprint(id);
  const sprint = query.data;
  const job = useSetupJob(id, sprint?.latestJob ?? null);
  const current = SPRINT_SCREENS.find((s) => s.to(id) === pathname);
  const crumbs: Crumb[] = [{ label: 'QA', href: ROUTES.QA_SPRINTS }];
  if (sprint) crumbs.push({ label: sprint.sprintKey, href: ROUTES.QA_SPRINT(id) });
  if (sprint && current) crumbs.push({ label: current.label });
  useSetBreadcrumb(crumbs);
  if (!Number.isSafeInteger(id) || id <= 0)
    return <ErrorState message={QA_ERROR_MESSAGES.DEFAULT} />;
  if (query.isLoading) return <LoadingSkeleton />;
  if (query.isError || !sprint) {
    const view = qaErrorView(query.error);
    return (
      <ErrorState
        message={view.message}
        onRetry={view.retryable ? () => query.refetch() : undefined}
      />
    );
  }
  const jobError = qaErrorView(job.error);
  return (
    <div className="flex flex-col gap-6">
      <SprintHeader sprint={sprint} />
      {job.isError && (
        <ErrorState
          className="py-4"
          message={jobError.message}
          onRetry={jobError.retryable ? () => job.refetch() : undefined}
        />
      )}
      <Outlet />
    </div>
  );
}
