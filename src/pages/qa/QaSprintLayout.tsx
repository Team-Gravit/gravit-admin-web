import { Outlet, useLocation, useNavigate, useParams } from 'react-router';
import { ROUTES } from '@/shared/constants/routes';
import { useSetBreadcrumb, type Crumb } from '@/shared/hooks/useBreadcrumb';
import { ErrorState } from '@/shared/components/states/ErrorState';
import { LoadingSkeleton } from '@/shared/components/states/LoadingSkeleton';
import { useSprint } from '@/features/qa/queries';
import { useStartSetupJob } from '@/features/qa/mutations';
import { SprintHeader } from '@/features/qa/components/SprintHeader';
import { qaErrorView } from '@/features/qa/errorView';
import { SPRINT_SCREENS, screenPath, type SprintScreen } from '@/features/qa/screens';
import type { NextActionCode } from '@/features/qa/copy';

/**
 * 배너 버튼이 향하는 하위 화면 (QA_SPEC F-1). 없으면 버튼 없음.
 * CONFIRM_CHECKLIST(확정 모달)·CLOSE_SPRINT(종료 모달)는 해당 화면 항목에서 연결한다 — 그 전에는 화면 이동만.
 */
const ACTION_TARGET: Partial<Record<NextActionCode, SprintScreen>> = {
  START_SETUP: 'setup',
  WAIT_SETUP: 'setup',
  RETRY_SETUP: 'setup',
  REVIEW_ITEMS: 'review',
  CONFIRM_CHECKLIST: 'review',
  CHECK_CELLS: 'checklist',
};

/** `/qa/sprints/:sprintId` 레이아웃 — 공통 상단(B-1) + 하위 화면. 하위 화면과 같은 스프린트 쿼리를 공유한다. */
export function QaSprintLayout() {
  const { sprintId } = useParams();
  const id = Number(sprintId);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { data: sprint, isLoading, isError, error, refetch } = useSprint(id);
  const startSetup = useStartSetupJob(id);

  const current = SPRINT_SCREENS.find((s) => s.to(id) === pathname) ?? null;
  const crumbs: Crumb[] = [{ label: 'QA', href: ROUTES.QA_SPRINTS }];
  if (sprint) crumbs.push({ label: sprint.sprintKey, href: ROUTES.QA_SPRINT(id) });
  if (sprint && current) crumbs.push({ label: current.label });
  useSetBreadcrumb(crumbs);

  if (!Number.isFinite(id)) return <ErrorState />;
  if (isLoading) return <LoadingSkeleton />;
  if (isError || !sprint) {
    const view = qaErrorView(error);
    return (
      <ErrorState message={view.message} onRetry={view.retryable ? () => refetch() : undefined} />
    );
  }

  // 이미 그 화면이면 이동 버튼은 의미가 없으므로 숨긴다(QA 준비하기는 준비 화면의 자체 버튼이 맡는다).
  const canAct = (code: NextActionCode) => {
    const target = ACTION_TARGET[code];
    return target !== undefined && target !== current?.key;
  };

  const onAction = (code: NextActionCode) => {
    const target = ACTION_TARGET[code];
    if (!target) return;
    if (code === 'START_SETUP') startSetup.mutate();
    navigate(screenPath(target, id));
  };

  return (
    <div className="flex flex-col gap-6">
      <SprintHeader
        sprint={sprint}
        canAct={canAct}
        onAction={onAction}
        actionPending={startSetup.isPending}
      />
      <Outlet />
    </div>
  );
}
