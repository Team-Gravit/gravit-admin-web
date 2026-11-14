import { useLocation, useNavigate } from 'react-router';
import { ROUTES } from '@/shared/constants/routes';
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
import { NOTICE_COPY } from '@/features/qa/copy';
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
  const navigate = useNavigate();
  const { search } = useLocation();
  const close = useCloseSprint(sprint.id, () => {
    onClose();
    navigate({ pathname: ROUTES.QA_SPRINT_FIX_REPORTS(sprint.id), search });
  });
  const failCount = sprint.progress.reduce((sum, p) => sum + p.fail, 0);
  return (
    <Dialog open onOpenChange={(open) => !open && !close.isPending && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>QA를 종료할까요?</DialogTitle>
          <DialogDescription>{NOTICE_COPY.CLOSE_DESCRIPTION(failCount)}</DialogDescription>
        </DialogHeader>
        {close.isError && (
          <p role="alert" className="rounded-md bg-danger-bg p-3 text-body text-danger-text">
            {close.error.message}
          </p>
        )}
        <DialogFooter>
          <Button variant="outline" disabled={close.isPending} onClick={onClose}>
            닫기
          </Button>
          <Button
            variant="destructive"
            disabled={!canClose || close.isPending}
            aria-busy={close.isPending}
            onClick={() => close.mutate(sprint.version)}
          >
            {close.isPending && (
              <Loader2
                className="size-4 animate-spin motion-reduce:animate-none"
                style={{ animationDuration: 'var(--motion-loading-cycle)' }}
                aria-hidden
              />
            )}
            {close.isError ? NOTICE_COPY.CLOSE_RETRY : NOTICE_COPY.CLOSE_CONFIRM}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
