import { ConfirmModal } from '@/shared/components/modals/ConfirmModal';
import { useCloseSprint } from '@/features/qa/mutations';
import { CONFIRM_COPY } from '@/features/qa/copy';
import type { Sprint } from '@/features/qa/schemas';

/**
 * 스프린트 종료 확인 (QA_SPEC B-4, F-7 CLOSE_SPRINT). FAIL 수 = progress 의 fail 합계.
 * 종료하면 체크를 바꿀 수 없으므로(되돌릴 수 없음) 확인 버튼은 destructive.
 */
export function CloseSprintModal({ sprint, onClose }: { sprint: Sprint; onClose: () => void }) {
  const close = useCloseSprint(sprint.id);
  const failCount = sprint.progress.reduce((sum, p) => sum + p.fail, 0);
  const copy = CONFIRM_COPY.CLOSE_SPRINT;

  return (
    <ConfirmModal
      open
      onOpenChange={(open) => !open && !close.isPending && onClose()}
      title={copy.title}
      description={copy.description(failCount)}
      confirmLabel={copy.confirmLabel}
      variant="destructive"
      loading={close.isPending}
      onConfirm={() => close.mutate(sprint.version, { onSettled: onClose })}
    />
  );
}
