import { AlertTriangle, FlaskConical, Users } from 'lucide-react';
import { ROUTES } from '@/shared/constants/routes';
import { useDashboardSummary } from '@/features/dashboard/queries';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { ErrorState } from '@/shared/components/states/ErrorState';
import { Skeleton } from '@/shared/components/ui/skeleton';

/**
 * DASHBOARD (DS-02 §2, 01 §6-1). Page Header + Stat Card × 3 (가로 3등분, 16px gap).
 * summary 는 counts 라 Empty 상태 없음 — Loading/Error/Data 처리.
 * (Figma node 8720:4002 의 챕터 테이블은 명세에 없어 미구현 — D5 동작/데이터=명세 권위.)
 */
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
