import { Info } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { QA_STATUS_CATEGORIES, type QaStatusCategory } from '@/features/qa/status';

export function QaStatusIcon({
  category,
  label,
  tooltip = true,
  pending = false,
}: {
  category: QaStatusCategory;
  label: string;
  tooltip?: boolean;
  pending?: boolean;
}) {
  const { icon: Icon, color } = QA_STATUS_CATEGORIES[category];
  const icon = (
    <span
      role="img"
      aria-label={label}
      tabIndex={tooltip ? 0 : undefined}
      className={cn(
        'inline-flex size-8 shrink-0 items-center justify-center rounded-full transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        color,
        pending && 'opacity-40',
      )}
    >
      <Icon
        className={cn(
          'size-4',
          category === 'running' && 'animate-spin motion-reduce:animate-none',
        )}
        aria-hidden
      />
    </span>
  );
  return tooltip ? (
    <Tooltip>
      <TooltipTrigger asChild>{icon}</TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  ) : (
    icon
  );
}

export function QaStatusLegend() {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip open={open ? false : undefined}>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="상태 아이콘 안내"
              className="ml-auto mb-2 rounded-md p-2 text-fg-muted hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Info className="size-4" aria-hidden />
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">상태 아이콘 안내</TooltipContent>
      </Tooltip>
      <PopoverContent side="bottom" aria-label="상태 아이콘 안내">
        <h2 className="mb-3 text-body font-medium">상태 아이콘 안내</h2>
        <ul className="flex flex-col gap-3">
          {Object.entries(QA_STATUS_CATEGORIES).map(([key, entry]) => (
            <li key={key} className="flex items-center gap-3">
              <QaStatusIcon
                category={key as QaStatusCategory}
                label={entry.label}
                tooltip={false}
              />
              <div>
                <p className="text-body font-medium">{entry.label}</p>
                <p className="text-caption text-fg-muted">{entry.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
import { useState } from 'react';
