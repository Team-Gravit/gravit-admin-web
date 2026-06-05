import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UserRole, UserStatus } from '@/shared/constants/enums';
import { updateUserRole, updateUserStatus } from '@/features/users/api';
import { userKeys } from '@/features/users/queries';

/** 유저 상태 변경 (03 §5-3). 성공 시 detail+lists invalidate (04 §9-1). */
export function useUpdateUserStatus(userId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: UserStatus) => updateUserStatus(userId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      void queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/** 유저 역할 변경 (03 §5-4). 성공 시 detail+lists invalidate. */
export function useUpdateUserRole(userId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (role: UserRole) => updateUserRole(userId, role),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      void queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}
