import * as React from 'react';
import * as RechartsPrimitive from 'recharts';
import { cn } from '@/shared/lib/cn';

/**
 * shadcn/ui Chart (recharts 래퍼) — 라이트 전용 트림.
 * 원본의 THEMES 다크 셀렉터·Legend 를 제거한 버전(DS 라이트 모드 전용, 단일 시리즈 차트만 사용).
 * config 의 color 는 `hsl(var(--chart-*))` 토큰 문자열만 받는다(raw hex 금지).
 */
export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    color?: string;
  }
>;

type ChartContextProps = { config: ChartConfig };

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) throw new Error('useChart must be used within a <ChartContainer />');
  return context;
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    config: ChartConfig;
    children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>['children'];
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-caption [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-hover [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = 'Chart';

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(([, itemConfig]) => itemConfig.color);
  if (!colorConfig.length) return null;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `[data-chart=${id}] {\n${colorConfig
          .map(([key, itemConfig]) => `  --color-${key}: ${itemConfig.color};`)
          .join('\n')}\n}`,
      }}
    />
  );
};

const ChartTooltip = RechartsPrimitive.Tooltip;

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<'div'> & {
      hideLabel?: boolean;
      hideIndicator?: boolean;
      valueFormatter?: (value: number) => string;
    }
>(
  (
    {
      active,
      payload,
      className,
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      valueFormatter,
    },
    ref,
  ) => {
    const { config } = useChart();

    if (!active || !payload?.length) return null;

    return (
      <div
        ref={ref}
        className={cn(
          'min-w-32 rounded-md border border-border bg-surface px-3 py-2 shadow-md',
          className,
        )}
      >
        {!hideLabel && (
          <div className="mb-1 text-caption font-medium text-foreground">
            {labelFormatter ? labelFormatter(label, payload) : label}
          </div>
        )}
        <div className="grid gap-1">
          {payload.map((item) => {
            const key = String(item.dataKey ?? item.name ?? 'value');
            const itemConfig = config[key];
            const indicatorColor = item.color ?? itemConfig?.color;
            return (
              <div key={key} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                  {!hideIndicator && (
                    <span
                      className="size-2 shrink-0 rounded-sm"
                      style={{ backgroundColor: indicatorColor }}
                    />
                  )}
                  <span className="text-caption text-fg-secondary">
                    {itemConfig?.label ?? key}
                  </span>
                </div>
                <span className="text-caption font-medium tabular-nums text-foreground">
                  {typeof item.value === 'number'
                    ? (valueFormatter ?? ((v: number) => v.toLocaleString('ko-KR')))(item.value)
                    : item.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);
ChartTooltipContent.displayName = 'ChartTooltipContent';

export { ChartContainer, ChartStyle, ChartTooltip, ChartTooltipContent };
