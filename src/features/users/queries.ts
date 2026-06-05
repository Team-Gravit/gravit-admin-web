import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getUsers, type UserListFilters } from '@/features/users/api';

/** 유저 queryKey 팩토리 (04 §9-1). status/role 변경 시 detail+lists invalidate. */
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: UserListFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (userId: number | string) => [...userKeys.details(), userId] as const,
};

export function useUsers(filters: UserListFilters) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => getUsers(filters),
    placeholderData: keepPreviousData,
  });
}
