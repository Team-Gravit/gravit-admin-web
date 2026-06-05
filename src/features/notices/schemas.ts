import { z } from 'zod';
import { FIELD_LIMITS } from '@/shared/constants/fieldLimits';

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

/** 공지 작성/수정 폼 (04 §9-2, §9-5 FIELD_LIMITS). title/summary/content 필수. */
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
