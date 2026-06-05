import { cn } from '@/shared/lib/cn';
import { Skeleton } from '@/shared/components/ui/skeleton';

/** Loading Skeleton (04 §9-4): 테이블 행 모양 회색 placeholder. 데이터 영역만. */
interface LoadingSkeletonProps {
  rows?: number;
  className?: string;
}

export function LoadingSkeleton({ rows = 8, className }: LoadingSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}
