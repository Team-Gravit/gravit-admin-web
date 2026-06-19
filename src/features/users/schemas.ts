import { z } from 'zod';

export const userStatusSchema = z.enum(['ACTIVE', 'SUSPENDED', 'DELETED']);
export const userRoleSchema = z.enum(['ADMIN', 'USER']);

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
  hasNext: z.boolean(),
  contents: z.array(userListItemSchema),
});

export type UserListItem = z.infer<typeof userListItemSchema>;
export type UserListResponse = z.infer<typeof userListResponseSchema>;

export const userDetailSchema = z.object({
  userId: z.number(),
  email: z.string(),
  nickname: z.string(),
  handle: z.string(),
  profileImgNumber: z.number(),
  role: userRoleSchema,
  status: userStatusSchema,
  level: z.number(),
  createdAt: z.string(),
});

export type UserDetail = z.infer<typeof userDetailSchema>;
