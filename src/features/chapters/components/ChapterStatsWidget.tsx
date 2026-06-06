import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { EmptyState } from '@/shared/components/states/EmptyState';
import { ErrorState } from '@/shared/components/states/ErrorState';
import { LoadingSkeleton } from '@/shared/components/states/LoadingSkeleton';
import { formatNumber } from '@/shared/lib/formatNumber';
import type { ChapterStats } from '@/features/chapters/schemas';

/** 진행률 바 (DS-02 §11): Primary 컬러, 0~100% 비례. 동적 폭은 inline style(토큰화 불가). */
function ProgressBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-primary-subtle">
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 shrink-0 text-right text-body tabular-nums text-foreground">{pct}%</span>
    </div>
  );
}

interface ChapterStatsWidgetProps {
  stats?: ChapterStats;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

/**
 * 풀이 현황 위젯 (DS-02 §11, 01 §6-5-2, 03 §7-3). 유닛별 참여인원 + 진행률 바.
 * 4상태(Empty/Loading/Error/Data). 정렬은 응답 배열 순서 그대로.
 */
export function ChapterStatsWidget({ stats, isLoading, isError, onRetry }: ChapterStatsWidgetProps) {
  const body = () => {
    if (isLoading) return <LoadingSkeleton />;
    if (isError) return <ErrorState onRetry={onRetry} />;
    if (!stats || stats.units.length === 0) {
      return <EmptyState message="아직 풀이 데이터가 없습니다." />;
    }
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>유닛명</TableHead>
            <TableHead className="w-28 text-right">참여 인원</TableHead>
            <TableHead className="w-60">진행률</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stats.units.map((unit) => (
            <TableRow key={unit.unitId}>
              <TableCell>
                <span className="line-clamp-1 text-foreground">{unit.unitTitle}</span>
              </TableCell>
              <TableCell className="w-28 text-right text-fg-secondary tabular-nums">
                {formatNumber(unit.participantCount)}
              </TableCell>
              <TableCell className="w-60">
                <ProgressBar value={unit.averageProgress} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-h3 text-foreground">풀이 현황</h3>
      <div className="rounded-lg border border-border bg-surface">{body()}</div>
    </section>
  );
}
