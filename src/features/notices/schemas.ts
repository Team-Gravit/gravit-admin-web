import { z } from 'zod';
import { FIELD_LIMITS } from '@/shared/constants/fieldLimits';

export const noticeStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);

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
  hasNext: z.boolean(),
  contents: z.array(noticeListItemSchema),
});

export type NoticeListItem = z.infer<typeof noticeListItemSchema>;
export type NoticeListResponse = z.infer<typeof noticeListResponseSchema>;

export const noticeFormSchema = z.object({
  title: z
    .string()
    .min(1, '제목은 필수 항목입니다.')
    .max(FIELD_LIMITS.notice.title, `${FIELD_LIMITS.notice.title}자 이내로 입력해주세요.`),
  summary: z
    .string()
    .min(1, '요약은 필수 항목입니다.')
    .max(FIELD_LIMITS.notice.summary, `${FIELD_LIMITS.notice.summary}자 이내로 입력해주세요.`),
  content: z
    .string()
    .min(1, '본문은 필수 항목입니다.')
    .max(FIELD_LIMITS.notice.content, `${FIELD_LIMITS.notice.content}자 이내로 입력해주세요.`),
  pinned: z.boolean(),
});

export type NoticeFormValues = z.infer<typeof noticeFormSchema>;

export const noticeDetailSchema = z.object({
  noticeId: z.number(),
  title: z.string(),
  summary: z.string(),
  content: z.string(),
  status: noticeStatusSchema,
  pinned: z.boolean(),
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
});

export type NoticeDetail = z.infer<typeof noticeDetailSchema>;

export const noticeEditFormSchema = noticeFormSchema.extend({ status: noticeStatusSchema });
export type NoticeEditFormValues = z.infer<typeof noticeEditFormSchema>;
