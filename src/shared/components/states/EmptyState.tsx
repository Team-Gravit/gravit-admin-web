import type { ReactNode } from 'react';
import { Inbox, type LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

interface EmptyStateProps {
  message: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ message, icon: Icon = Inbox, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-3 py-12 text-center', className)}
    >
      <Icon className="size-5 text-fg-muted" />
      <p className="text-body text-fg-secondary">{message}</p>
      {action}
    </div>
  );
}
