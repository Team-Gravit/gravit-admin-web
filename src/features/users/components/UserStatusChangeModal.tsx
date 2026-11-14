import { ConfirmModal } from '@/shared/components/modals/ConfirmModal';
import type { UserRole, UserStatus } from '@/shared/constants/enums';

export type UserChange = { kind: 'status'; value: UserStatus } | { kind: 'role'; value: UserRole };

interface UserStatusChangeModalProps {
  open: boolean;
  change: UserChange | null;
  nickname: string;
  handle: string | null;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function UserStatusChangeModal({
  open,
  change,
  nickname,
  handle,
  loading,
  onConfirm,
  onCancel,
}: UserStatusChangeModalProps) {
  if (!change) return null;

  const who = handle ? `${nickname} (@${handle})` : nickname;
  const props =
    change.kind === 'status'
      ? change.value === 'DELETED'
        ? {
            variant: 'destructive' as const,
            title: '유저를 삭제 처리할까요?',
            description: `${who} 계정 상태를 바꿔요: DELETED. 이 작업은 되돌리기 어려워요.`,
            confirmLabel: '삭제 처리하기',
          }
        : {
            variant: 'default' as const,
            title: '유저 상태를 바꿀까요?',
            description: `${who} 계정 상태를 바꿔요: ${change.value}.`,
            confirmLabel: '상태 변경하기',
          }
      : change.value === 'ADMIN'
        ? {
            variant: 'destructive' as const,
            title: '관리자 권한을 부여할까요?',
            description: `${who}에게 관리자 권한을 부여해요. 백오피스 접근 등 모든 운영 권한을 사용할 수 있어요.`,
            confirmLabel: '권한 부여하기',
          }
        : {
            variant: 'default' as const,
            title: '관리자 권한을 회수할까요?',
            description: `${who}의 관리자 권한을 회수해요.`,
            confirmLabel: '권한 회수하기',
          };

  return (
    <ConfirmModal
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
      title={props.title}
      description={props.description}
      variant={props.variant}
      confirmLabel={props.confirmLabel}
      loading={loading}
      onConfirm={onConfirm}
    />
  );
}
