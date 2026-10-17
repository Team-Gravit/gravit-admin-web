import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { CONFIRM_COPY } from '@/features/qa/copy';

interface ConfirmChecklistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 확정 대상에 자동 분류 항목이 있으면 '확정 후 자동 실행 시작' 체크박스를 보인다 */
  hasAutoItems: boolean;
  loading: boolean;
  /** startAutoRun 은 자동 항목이 없으면 undefined(생략) */
  onConfirm: (startAutoRun: boolean | undefined) => void;
}

/** 체크리스트 확정 확인 (QA_SPEC B-3, F-7 CONFIRM_CHECKLIST). 열 때마다 마운트해 체크박스는 기본 체크. */
export function ConfirmChecklistModal({
  open,
  onOpenChange,
  hasAutoItems,
  loading,
  onConfirm,
}: ConfirmChecklistModalProps) {
  const [startAutoRun, setStartAutoRun] = useState(true);
  const copy = CONFIRM_COPY.CONFIRM_CHECKLIST;

  return (
    <Dialog open={open} onOpenChange={(next) => !loading && onOpenChange(next)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>

        {hasAutoItems && (
          <label
            htmlFor="qa-confirm-auto-run"
            className="flex items-center gap-2 text-body text-foreground"
          >
            <Checkbox
              id="qa-confirm-auto-run"
              checked={startAutoRun}
              disabled={loading}
              onCheckedChange={(checked) => setStartAutoRun(checked === true)}
            />
            확정 후 자동 실행 시작
          </label>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            취소
          </Button>
          <Button
            disabled={loading}
            onClick={() => onConfirm(hasAutoItems ? startAutoRun : undefined)}
          >
            {loading && <Loader2 className="animate-spin" />}
            {copy.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
