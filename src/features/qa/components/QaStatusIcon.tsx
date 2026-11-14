import { useEffect, useRef, useState } from 'react';
import { QaTooltipContent } from '@/features/qa/components/QaTooltipContent';
import { Info } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Tooltip, TooltipTrigger } from '@/shared/components/ui/tooltip';
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
  const showTooltip = tooltip && category !== 'success' && category !== 'failure';
  const icon = (
    <span
      role="img"
      aria-label={label}
      tabIndex={showTooltip ? 0 : undefined}
      className={cn(
        'inline-flex size-8 shrink-0 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        color,
        pending && 'opacity-40',
      )}
    >
      <Icon
        className={cn(
          'size-4',
          category === 'running' && 'animate-spin motion-reduce:animate-none',
        )}
        style={
          category === 'running' ? { animationDuration: 'var(--motion-loading-cycle)' } : undefined
        }
        aria-hidden
      />
    </span>
  );
  return showTooltip ? (
    <Tooltip>
      <TooltipTrigger asChild>{icon}</TooltipTrigger>
      <QaTooltipContent side="bottom">{label}</QaTooltipContent>
    </Tooltip>
  ) : (
    icon
  );
}

export function QaStatusLegend() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const restoreKeyboardFocus = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();
  const dismissed = useRef(false);
  const cancelClose = () => clearTimeout(closeTimer.current);
  const show = () => {
    cancelClose();
    setOpen(true);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };
  useEffect(() => () => clearTimeout(closeTimer.current), []);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          ref={triggerRef}
          type="button"
          aria-label="상태 아이콘 안내"
          onPointerEnter={() => {
            dismissed.current = false;
            show();
          }}
          onPointerLeave={scheduleClose}
          onFocus={() => !dismissed.current && show()}
          onBlur={() => {
            dismissed.current = false;
          }}
          onKeyDown={(event) => {
            if (['Enter', ' ', 'ArrowDown'].includes(event.key)) {
              event.preventDefault();
              show();
              requestAnimationFrame(() => contentRef.current?.focus());
            }
            if (event.key === 'Escape') {
              cancelClose();
              dismissed.current = true;
              setOpen(false);
            }
          }}
          onClick={(event) => {
            event.preventDefault();
            dismissed.current = false;
            show();
          }}
          className="ml-auto rounded-md p-1 text-fg-muted hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Info className="size-4" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent
        ref={contentRef}
        side="bottom"
        aria-label="상태 아이콘 안내"
        onPointerEnter={cancelClose}
        onPointerLeave={scheduleClose}
        onEscapeKeyDown={() => {
          restoreKeyboardFocus.current =
            contentRef.current?.contains(document.activeElement) ?? false;
          cancelClose();
          dismissed.current =
            document.activeElement === triggerRef.current || restoreKeyboardFocus.current;
        }}
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          if (restoreKeyboardFocus.current) {
            dismissed.current = true;
            triggerRef.current?.focus();
            restoreKeyboardFocus.current = false;
          }
        }}
      >
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
