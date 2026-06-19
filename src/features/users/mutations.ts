import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UserRole, UserStatus } from '@/shared/constants/enums';
import { updateUserRole, updateUserStatus } from '@/features/users/api';
import { userKeys } from '@/features/users/queries';

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
