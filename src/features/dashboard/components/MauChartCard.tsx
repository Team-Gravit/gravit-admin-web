import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts';
import { formatNumber } from '@/shared/lib/formatNumber';
import { useMonthlyActiveUsers } from '@/features/dashboard/queries';
import type { MonthlyActiveUsersPoint } from '@/features/dashboard/schemas';
import { ErrorState } from '@/shared/components/states/ErrorState';
import { EmptyState } from '@/shared/components/states/EmptyState';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/shared/components/ui/chart';

const chartConfig = {
  mau: { label: 'MAU', color: 'hsl(var(--chart-mau))' },
} satisfies ChartConfig;

// "2026-08" → "26.08"
const formatMonth = (month: string) => month.slice(2).replace('-', '.');

export function MauChartCard() {
  const { data, isLoading, isError, refetch } = useMonthlyActiveUsers();

  const points = data?.points ?? [];
  const current = points.length > 0 ? points[points.length - 1] : null;
  const previous = points.length > 1 ? points[points.length - 2] : null;

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-h3 text-foreground">MAU</h2>
        <p className="text-caption text-fg-muted">최근 12개월 월별 활성 유저</p>
      </div>

      {isLoading && <Skeleton className="h-64 w-full" />}

      {isError && <ErrorState className="py-8" onRetry={() => refetch()} />}

      {data && points.length === 0 && (
        <EmptyState className="py-8" message="아직 집계된 데이터가 없습니다." />
      )}

      {data && current && (
        <>
          <div className="flex items-baseline gap-3">
            <span className="text-display text-foreground">{formatNumber(current.mau)}</span>
            <span className="text-caption text-fg-muted">
              이번 달{current.inProgress && ' (집계 중)'}
            </span>
            {/* 이번 달은 부분 집계라 전월 대비 delta 미표시(D7) — 지난달 값만 참고 제공 */}
            {previous && (
              <span className="text-caption text-fg-secondary">
                지난달 {formatNumber(previous.mau)}
              </span>
            )}
          </div>

          <ChartContainer config={chartConfig} className="h-56 w-full">
            <BarChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={formatMonth}
              />
              <YAxis
                width={40}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                tickFormatter={(value: number) => formatNumber(value)}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    valueFormatter={formatNumber}
                    labelFormatter={(value, payload) => {
                      const point = payload?.[0]?.payload as MonthlyActiveUsersPoint | undefined;
                      return `${String(value).replace('-', '.')}${point?.inProgress ? ' (집계 중)' : ''}`;
                    }}
                  />
                }
              />
              <Bar dataKey="mau" fill="var(--color-mau)" radius={[4, 4, 0, 0]}>
                {points.map((point) => (
                  <Cell key={point.month} fillOpacity={point.inProgress ? 0.4 : 1} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>

          {current.inProgress && (
            <p className="text-caption text-fg-muted">
              마지막 막대는 이번 달 진행 중 집계로, 지난 달과 직접 비교할 수 없습니다.
            </p>
          )}
        </>
      )}
    </section>
  );
}
