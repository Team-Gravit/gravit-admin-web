import { useState } from 'react';
import { useParams } from 'react-router';
import { User } from 'lucide-react';
import { toast } from 'sonner';
import { ROUTES } from '@/shared/constants/routes';
import { formatDate } from '@/shared/lib/formatDate';
import { useSetBreadcrumb } from '@/shared/hooks/useBreadcrumb';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { ErrorState } from '@/shared/components/states/ErrorState';
import { LoadingSkeleton } from '@/shared/components/states/LoadingSkeleton';
import type { UserRole, UserStatus } from '@/shared/constants/enums';
import { useUser } from '@/features/users/queries';
import { useUpdateUserRole, useUpdateUserStatus } from '@/features/users/mutations';
import { UserStatusBadge } from '@/features/users/components/UserStatusBadge';
import { UserRoleBadge } from '@/features/users/components/UserRoleBadge';
import {
  UserStatusChangeModal,
  type UserChange,
} from '@/features/users/components/UserStatusChangeModal';

export function UserDetailPage() {
  const { userId } = useParams();
  const id = Number(userId);
  const { data, isLoading, isError, refetch } = useUser(id);
  const updateStatus = useUpdateUserStatus(id);
  const updateRole = useUpdateUserRole(id);
  const [pending, setPending] = useState<UserChange | null>(null);

  useSetBreadcrumb([
    { label: '유저 관리', href: ROUTES.USERS },
    ...(data ? [{ label: data.nickname }] : []),
  ]);

  if (isLoading) return <LoadingSkeleton />;
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />;

  const onConfirm = () => {
    if (!pending) return;
    const opts = {
      onSuccess: () => {
        toast.success('변경되었습니다.');
        setPending(null);
      },
    };
    if (pending.kind === 'status') updateStatus.mutate(pending.value, opts);
    else updateRole.mutate(pending.value, opts);
  };

  const loading = updateStatus.isPending || updateRole.isPending;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h1 text-foreground">유저 상세</h1>

      <div className="flex items-center gap-6 rounded-lg border border-border bg-surface p-6">
        <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-hover">
          <User className="size-10 text-fg-muted" />
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-h3 text-foreground">{data.nickname}</h3>
          <p className="text-body text-fg-muted">@{data.handle}</p>
          <p className="text-body text-fg-muted">{data.email}</p>
          <p className="text-body text-fg-muted">가입일: {formatDate(data.createdAt)}</p>
          <p className="text-body text-fg-muted">레벨: Lv.{data.level}</p>
        </div>
      </div>

      <div className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-6">
        <h3 className="text-h3 text-foreground">권한 및 상태</h3>

        <div className="flex items-center gap-4">
          <span className="w-16 text-body text-fg-secondary">역할</span>
          <Select
            value={data.role}
            onValueChange={(value) => {
              if (value !== data.role) setPending({ kind: 'role', value: value as UserRole });
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMIN">관리자</SelectItem>
              <SelectItem value="USER">일반</SelectItem>
            </SelectContent>
          </Select>
          <UserRoleBadge role={data.role} />
        </div>

        <div className="flex items-center gap-4">
          <span className="w-16 text-body text-fg-secondary">상태</span>
          <Select
            value={data.status}
            onValueChange={(value) => {
              if (value !== data.status) setPending({ kind: 'status', value: value as UserStatus });
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">활성</SelectItem>
              <SelectItem value="SUSPENDED">정지</SelectItem>
              <SelectItem value="DELETED">삭제됨</SelectItem>
            </SelectContent>
          </Select>
          <UserStatusBadge status={data.status} />
        </div>
      </div>

      <UserStatusChangeModal
        open={pending !== null}
        change={pending}
        nickname={data.nickname}
        handle={data.handle}
        loading={loading}
        onConfirm={onConfirm}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}
