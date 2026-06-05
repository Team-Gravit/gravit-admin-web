import { z } from 'zod';

/** 유저 enum (03 §5). */
export const userStatusSchema = z.enum(['ACTIVE', 'SUSPENDED', 'DELETED']);
export const userRoleSchema = z.enum(['ADMIN', 'USER']);

/** 유저 목록 아이템 (03 §5-1). handle 은 @ prefix 없는 순수 값. */
export const userListItemSchema = z.object({
  userId: z.number(),
  email: z.string(),
  nickname: z.string(),
  handle: z.string(),
  role: userRoleSchema,
  status: userStatusSchema,
  createdAt: z.string(),
});

export const userListResponseSchema = z.object({
  page: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
  content: z.array(userListItemSchema),
});

export type UserListItem = z.infer<typeof userListItemSchema>;
export type UserListResponse = z.infer<typeof userListResponseSchema>;
