import { Link } from 'react-router';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { formatNumber } from '@/shared/lib/formatNumber';

interface StatCardProps {
  label: string;
  value: number;
  linkLabel: string;
  to: string;
  icon: LucideIcon;
  className?: string;
}

export function StatCard({ label, value, linkLabel, to, icon: Icon, className }: StatCardProps) {
  return (
    <Link
      to={to}
      className={cn(
        'group flex flex-col gap-3 rounded-lg border border-border bg-surface p-6 transition-colors hover:border-primary/50',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-body text-fg-secondary">{label}</span>
        <Icon className="size-5 text-fg-muted" />
      </div>
      <span className="text-display text-foreground">{formatNumber(value)}</span>
      <span className="text-caption text-primary group-hover:underline">{linkLabel} →</span>
    </Link>
  );
}
