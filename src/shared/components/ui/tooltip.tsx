import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/shared/lib/cn';

const TooltipOpenContext = React.createContext(false);
export const TooltipProvider = TooltipPrimitive.Provider;
export function Tooltip({
  defaultOpen,
  onOpenChange,
  open: controlledOpen,
  ...props
}: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>) {
  const [open, setOpen] = React.useState(defaultOpen ?? false);
  const visible = controlledOpen ?? open;
  React.useEffect(() => {
    if (controlledOpen !== undefined) setOpen(controlledOpen);
  }, [controlledOpen]);
  return (
    <TooltipOpenContext.Provider value={visible}>
      <TooltipPrimitive.Root
        {...props}
        open={visible}
        onOpenChange={(next) => {
          if (controlledOpen === undefined) setOpen(next);
          onOpenChange?.(next);
        }}
      />
    </TooltipOpenContext.Provider>
  );
}
export const TooltipTrigger = TooltipPrimitive.Trigger;
export const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => {
  const open = React.useContext(TooltipOpenContext);
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    if (!open) {
      setReady(false);
      return;
    }
    // Let native keyboard focus finish scrolling before Radix starts dismissing
    // the tooltip on scroll. Root state stays synchronous so blur/click cancels it.
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, [open]);
  return ready && open ? (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          'z-50 max-w-xs rounded-md border border-border bg-popover px-3 py-2 text-caption text-popover-foreground shadow-md',
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  ) : null;
});
TooltipContent.displayName = 'TooltipContent';
