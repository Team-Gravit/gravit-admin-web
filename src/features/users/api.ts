import { apiClient } from '@/shared/api/client';
import type { UserRole, UserStatus } from '@/shared/constants/enums';
import { userListResponseSchema, type UserListResponse } from '@/features/users/schemas';

/** 유저 목록 필터 (03 §5-1). search=email/nickname/handle 통합 키워드. */
export interface UserListFilters {
  page: number;
  search?: string;
  status?: UserStatus;
  role?: UserRole;
}

/** GET /users?page&search&status&role — 유저 목록 (03 §5-1). 미지정 파라미터는 전송 안 함. */
export async function getUsers(filters: UserListFilters): Promise<UserListResponse> {
  const params: Record<string, string | number> = { page: filters.page };
  if (filters.search) params.search = filters.search;
  if (filters.status) params.status = filters.status;
  if (filters.role) params.role = filters.role;
  const { data } = await apiClient.get('/users', { params });
  return userListResponseSchema.parse(data);
}
