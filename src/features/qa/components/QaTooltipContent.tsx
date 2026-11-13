import type { ComponentPropsWithoutRef } from 'react';
import { TooltipContent } from '@/shared/components/ui/tooltip';
import { cn } from '@/shared/lib/cn';

/** Keep QA captions on a child so the existing cn font-size collision cannot remove them. */
export function QaTooltipContent({
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<typeof TooltipContent>) {
  return (
    <TooltipContent {...props} className={cn('px-1 py-1', className)}>
      <span className="block text-caption">{children}</span>
    </TooltipContent>
  );
}
