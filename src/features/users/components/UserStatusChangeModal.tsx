import { ConfirmModal } from '@/shared/components/modals/ConfirmModal';
import type { UserRole, UserStatus } from '@/shared/constants/enums';

/** 변경 의도 (status 또는 role). */
export type UserChange = { kind: 'status'; value: UserStatus } | { kind: 'role'; value: UserRole };

/**
 * 유저 status/role 변경 Confirm 모달 (04 §10-3, 01 §6-3-2). 5케이스 → variant/문구 매핑.
 * DELETED·ADMIN = destructive. 취소 시 onCancel(드롭다운 원복은 호출부 controlled value 가 처리).
 */
interface UserStatusChangeModalProps {
  open: boolean;
  change: UserChange | null;
  nickname: string;
  handle: string;
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

  const who = `${nickname} (@${handle})`;
  const props =
    change.kind === 'status'
      ? change.value === 'DELETED'
        ? {
            variant: 'destructive' as const,
            title: '유저를 삭제 처리하시겠습니까?',
            description: `${who}을(를) DELETED 상태로 변경합니다. 이 작업은 되돌리기 어렵습니다.`,
            confirmLabel: '삭제',
          }
        : {
            variant: 'default' as const,
            title: '유저 상태를 변경하시겠습니까?',
            description: `${who}을(를) ${change.value} 상태로 변경합니다.`,
            confirmLabel: '확인',
          }
      : change.value === 'ADMIN'
        ? {
            variant: 'destructive' as const,
            title: '관리자 권한을 부여하시겠습니까?',
            description: `${who}에게 관리자 권한을 부여합니다. 백오피스 접근 등 모든 운영 권한이 부여됩니다.`,
            confirmLabel: '부여',
          }
        : {
            variant: 'default' as const,
            title: '관리자 권한을 회수하시겠습니까?',
            description: `${who}의 관리자 권한을 회수합니다.`,
            confirmLabel: '확인',
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
