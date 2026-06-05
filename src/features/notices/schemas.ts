import { z } from 'zod';

/** 공지 상태 (03 §5, enums NoticeStatus 와 동일 값). */
export const noticeStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);

/** 공지 목록 아이템 (03 §9-1). publishedAt 은 DRAFT 시 null. */
export const noticeListItemSchema = z.object({
  noticeId: z.number(),
  title: z.string(),
  status: noticeStatusSchema,
  pinned: z.boolean(),
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
});

export const noticeListResponseSchema = z.object({
  page: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
  content: z.array(noticeListItemSchema),
});

export type NoticeListItem = z.infer<typeof noticeListItemSchema>;
export type NoticeListResponse = z.infer<typeof noticeListResponseSchema>;
