import { useEffect, useState, type ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

/**
 * Strict Match Modal (DS-01 §5-6, 폭 480px). 스테이징 promote 전용.
 * 라벨명을 정확히(대소문자·공백 포함) 입력해야 [반영] 활성 (01 §6-7-8, decisions).
 * ⚠️ promote 는 비가역 — 실제 실행은 사람. 이 컴포넌트는 입력 일치 게이트 + onConfirm 호출만.
 */
interface StrictMatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 정확히 일치해야 하는 라벨명 */
  label: string;
  title?: string;
  description?: ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
  loading?: boolean;
}

export function StrictMatchModal({
  open,
  onOpenChange,
  label,
  title = '라벨을 반영하시겠습니까?',
  description,
  confirmLabel = '반영',
  onConfirm,
  loading = false,
}: StrictMatchModalProps) {
  const [value, setValue] = useState('');
  const matched = value === label;

  // 모달이 닫힐 때 입력 초기화
  useEffect(() => {
    if (!open) setValue('');
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-modal-wide">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="space-y-2">
          <p className="text-body text-fg-secondary">
            확인을 위해 라벨명 <span className="font-mono font-medium text-foreground">{label}</span>{' '}
            을(를) 정확히 입력하세요.
          </p>
          {/* placeholder 없음 (04 §10-2): 라벨을 placeholder 로 노출하면 strict-match 안전성 약화 */}
          <Input value={value} onChange={(e) => setValue(e.target.value)} autoComplete="off" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            취소
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={!matched || loading}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
