import { AlertTriangle, FlaskConical, Users } from 'lucide-react';
import { ROUTES } from '@/shared/constants/routes';
import { useDashboardSummary } from '@/features/dashboard/queries';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { DauChartCard } from '@/features/dashboard/components/DauChartCard';
import { MauChartCard } from '@/features/dashboard/components/MauChartCard';
import { ErrorState } from '@/shared/components/states/ErrorState';
import { Skeleton } from '@/shared/components/ui/skeleton';

export function DashboardPage() {
  const { data, isLoading, isError, refetch } = useDashboardSummary();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex min-h-16 flex-col gap-1">
        <h1 className="text-h1 text-foreground">대시보드</h1>
      </div>

      {isLoading && (
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex h-40 flex-col gap-3 rounded-lg border border-border bg-surface p-6">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
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

      {/* 활성 유저 추이 (D7) — summary 와 독립 쿼리, 카드별 자체 4상태 */}
      <div className="grid grid-cols-2 gap-4">
        <DauChartCard />
        <MauChartCard />
      </div>
    </div>
  );
}
