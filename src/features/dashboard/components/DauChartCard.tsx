import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { format, parseISO } from 'date-fns';
import { formatNumber } from '@/shared/lib/formatNumber';
import { useDailyActiveUsers } from '@/features/dashboard/queries';
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
  dau: { label: 'DAU', color: 'hsl(var(--chart-dau))' },
} satisfies ChartConfig;

export function DauChartCard() {
  const { data, isLoading, isError, refetch } = useDailyActiveUsers();

  const points = data?.points ?? [];
  const today = points.length > 0 ? points[points.length - 1] : null;
  const yesterday = points.length > 1 ? points[points.length - 2] : null;
  const delta = today && yesterday ? today.dau - yesterday.dau : null;

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-h3 text-foreground">DAU</h2>
        <p className="text-caption text-fg-muted">최근 30일 일별 활성 유저</p>
      </div>

      {isLoading && <Skeleton className="h-64 w-full" />}

      {isError && <ErrorState className="py-8" onRetry={() => refetch()} />}

      {data && points.length === 0 && (
        <EmptyState className="py-8" message="아직 집계된 데이터가 없어요." />
      )}

      {data && today && (
        <>
          <div className="flex items-baseline gap-3">
            <span className="text-display tabular-nums text-foreground">{formatNumber(today.dau)}</span>
            <span className="text-caption text-fg-muted">오늘</span>
            {delta !== null &&
              (delta === 0 ? (
                <span className="text-caption text-fg-muted">전일과 동일</span>
              ) : (
                <span
                  className="text-caption tabular-nums text-fg-secondary"
                >
                  {delta > 0 ? '▲' : '▼'} {formatNumber(Math.abs(delta))} 전일 대비
                </span>
              ))}
          </div>

          <ChartContainer config={chartConfig} className="h-56 w-full">
            <AreaChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value: string) => format(parseISO(value), 'M.d')}
              />
              <YAxis
                width={40}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                tickFormatter={(value: number) => formatNumber(value)}
              />
              <ChartTooltip
                isAnimationActive={false}
                content={
                  <ChartTooltipContent
                    valueFormatter={formatNumber}
                    labelFormatter={(value) => format(parseISO(String(value)), 'yyyy.MM.dd')}
                  />
                }
              />
              <Area
                isAnimationActive={false}
                dataKey="dau"
                type="monotone"
                stroke="var(--color-dau)"
                strokeWidth={2}
                fill="var(--color-dau)"
                fillOpacity={0.08}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ChartContainer>
        </>
      )}
    </section>
  );
}
