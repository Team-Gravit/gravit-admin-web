import { AlertTriangle } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/components/ui/button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  message = '데이터를 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-3 py-12 text-center', className)}
    >
      <AlertTriangle className="size-5 text-danger-text" />
      <p className="text-body text-fg-secondary">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          다시 시도하기
        </Button>
      )}
    </div>
  );
}
