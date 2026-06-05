import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';

/**
 * Unsaved Changes Modal (04 §8-4-3). useUnsavedChangesGuard 의 blocker 와 연동.
 * [나가기] → blocker.proceed(), [취소] → blocker.reset().
 */
interface UnsavedChangesModalProps {
  open: boolean;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function UnsavedChangesModal({
  open,
  message = '변경 사항이 있습니다. 페이지를 나가시겠습니까?',
  onConfirm,
  onCancel,
}: UnsavedChangesModalProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{message}</DialogTitle>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            취소
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            나가기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
