import { AlertTriangle, FlaskConical, Users } from 'lucide-react';
import { ROUTES } from '@/shared/constants/routes';
import { useDashboardSummary } from '@/features/dashboard/queries';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { ErrorState } from '@/shared/components/states/ErrorState';
import { Skeleton } from '@/shared/components/ui/skeleton';

export function DashboardPage() {
  const { data, isLoading, isError, refetch } = useDashboardSummary();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-h1 text-foreground">대시보드</h1>
        <p className="text-body text-fg-muted">운영 현황을 한눈에 확인합니다.</p>
      </div>

      {isLoading && (
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      )}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {data && (
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            label="총 유저 수"
            value={data.totalUsers}
            linkLabel="유저 관리"
            to={ROUTES.USERS}
            icon={Users}
          />
          <StatCard
            label="PENDING 라벨"
            value={data.pendingLabelsCount}
            linkLabel="스테이징"
            to={ROUTES.STAGING_LABELS}
            icon={FlaskConical}
          />
          <StatCard
            label="미해결 신고"
            value={data.unresolvedReportsCount}
            linkLabel="신고 관리"
            to={ROUTES.REPORTS}
            icon={AlertTriangle}
          />
        </div>
      )}
    </div>
  );
}
