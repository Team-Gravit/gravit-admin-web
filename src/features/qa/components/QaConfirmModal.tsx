import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';

/** QA confirmations can become locked while a setup job starts in the background. */
export function QaConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  variant = 'default',
  pending = false,
  disabled = false,
  error,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  variant?: 'default' | 'destructive';
  pending?: boolean;
  disabled?: boolean;
  error?: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && !pending && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {error && (
          <p role="alert" className="rounded-md bg-danger-bg p-3 text-body text-danger-text">
            {error}
          </p>
        )}
        <DialogFooter>
          <Button variant="outline" disabled={pending} onClick={onClose}>
            취소
          </Button>
          <Button
            variant={variant}
            disabled={disabled || pending}
            aria-busy={pending}
            onClick={onConfirm}
          >
            {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
