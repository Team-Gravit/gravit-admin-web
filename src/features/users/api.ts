import { apiClient } from '@/shared/api/client';
import type { UserRole, UserStatus } from '@/shared/constants/enums';
import {
  userDetailSchema,
  userListResponseSchema,
  type UserDetail,
  type UserListResponse,
} from '@/features/users/schemas';

export interface UserListFilters {
  page: number;
  search?: string;
  status?: UserStatus;
  role?: UserRole;
}

export async function getUsers(filters: UserListFilters): Promise<UserListResponse> {
  const params: Record<string, string | number> = { page: filters.page };
  if (filters.search) params.search = filters.search;
  if (filters.status) params.status = filters.status;
  if (filters.role) params.role = filters.role;
  const { data } = await apiClient.get('/users', { params });
  return userListResponseSchema.parse(data);
}

export async function getUser(userId: number): Promise<UserDetail> {
  const { data } = await apiClient.get(`/users/${userId}`);
  return userDetailSchema.parse(data);
}

export async function updateUserStatus(userId: number, status: UserStatus): Promise<void> {
  await apiClient.patch(`/users/${userId}/status`, { status });
}

export async function updateUserRole(userId: number, role: UserRole): Promise<void> {
  await apiClient.patch(`/users/${userId}/role`, { role });
}
