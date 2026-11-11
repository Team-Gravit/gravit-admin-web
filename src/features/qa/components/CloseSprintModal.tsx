import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { useCloseSprint } from '@/features/qa/mutations';
import type { Sprint } from '@/features/qa/schemas';
export function CloseSprintModal({
  sprint,
  canClose,
  onClose,
}: {
  sprint: Sprint;
  canClose: boolean;
  onClose: () => void;
}) {
  const close = useCloseSprint(sprint.id);
  const failCount = sprint.progress.reduce((sum, p) => sum + p.fail, 0);
  return (
    <Dialog open onOpenChange={(open) => !open && !close.isPending && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>스프린트를 종료할까요?</DialogTitle>
          <DialogDescription>
            Fail {failCount}건은 미해결로 남습니다. 종료 후에는 판정을 바꿀 수 없습니다.
          </DialogDescription>
        </DialogHeader>
        {close.isError && (
          <p role="alert" className="rounded-md bg-danger-bg p-3 text-body text-danger-text">
            {close.error.message}
          </p>
        )}
        <DialogFooter>
          <Button variant="outline" disabled={close.isPending} onClick={onClose}>
            취소
          </Button>
          <Button
            variant="destructive"
            disabled={!canClose || close.isPending}
            aria-busy={close.isPending}
            onClick={() => close.mutate(sprint.version, { onSuccess: onClose })}
          >
            {close.isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {close.isError ? '다시 시도' : '종료'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
