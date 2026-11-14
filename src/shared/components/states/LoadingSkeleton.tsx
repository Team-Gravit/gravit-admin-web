import { cn } from '@/shared/lib/cn';
import { Skeleton } from '@/shared/components/ui/skeleton';

interface LoadingSkeletonProps {
  rows?: number;
  className?: string;
}

export function LoadingSkeleton({ rows = 8, className }: LoadingSkeletonProps) {
  return (
    <div className={cn('flex flex-col gap-3 rounded-lg bg-surface p-4', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}
