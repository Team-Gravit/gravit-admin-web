import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import type { BadgeVariant } from '@/shared/constants/badgeVariants';

/**
 * Status Badge (DS-01 §5-3, §1-3). variant → 시맨틱 토큰(text/bg 쌍).
 * shadcn Badge 와 별개 — DS 6+1 시맨틱 variant 전용.
 */
const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-success-bg text-success-text',
  warning: 'bg-warning-bg text-warning-text',
  danger: 'bg-danger-bg text-danger-text',
  info: 'bg-info-bg text-info-text',
  accent: 'bg-accent-ds-bg text-accent-ds-text',
  muted: 'bg-muted-ds-bg text-muted-ds-text',
  primary: 'bg-primary-badge text-primary', // ADMIN (primary-bg-badge 12%)
};

interface StatusBadgeProps {
  variant: BadgeVariant;
  children: ReactNode;
  className?: string;
}

export function StatusBadge({ variant, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-caption font-medium',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
