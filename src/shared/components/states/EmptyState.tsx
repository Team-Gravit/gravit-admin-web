import type { ReactNode } from 'react';
import { Inbox, type LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

/** Empty State (04 §9-4): 회색 아이콘 48px + 메시지(16px) + 보조 액션(선택). */
interface EmptyStateProps {
  message: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ message, icon: Icon = Inbox, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-16 text-center',
        className,
      )}
    >
      <Icon className="h-12 w-12 text-fg-muted" />
      <p className="text-h3 text-fg-secondary">{message}</p>
      {action}
    </div>
  );
}
