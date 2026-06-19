import { z } from 'zod';
import { FIELD_LIMITS } from '@/shared/constants/fieldLimits';

export const chapterListItemSchema = z.object({
  chapterId: z.number(),
  title: z.string(),
  description: z.string(),
});

export const chapterListResponseSchema = z.object({
  page: z.number(),
  totalPages: z.number(),
  hasNext: z.boolean(),
  contents: z.array(chapterListItemSchema),
});

export type ChapterListItem = z.infer<typeof chapterListItemSchema>;
export type ChapterListResponse = z.infer<typeof chapterListResponseSchema>;

export const chapterDetailSchema = z.object({
  chapterId: z.number(),
  title: z.string(),
  description: z.string(),
  unitCount: z.number(),
});

export type ChapterDetail = z.infer<typeof chapterDetailSchema>;

export const chapterStatItemSchema = z.object({
  unitId: z.number(),
  unitTitle: z.string(),
  averageProgress: z.number(),
  participantCount: z.number(),
});

export const chapterStatsSchema = z.object({
  units: z.array(chapterStatItemSchema),
});

export type ChapterStatItem = z.infer<typeof chapterStatItemSchema>;
export type ChapterStats = z.infer<typeof chapterStatsSchema>;

export const chapterUnitItemSchema = z.object({
  unitId: z.number(),
  title: z.string(),
  description: z.string(),
});

export const chapterUnitListResponseSchema = z.object({
  page: z.number(),
  totalPages: z.number(),
  hasNext: z.boolean(),
  contents: z.array(chapterUnitItemSchema),
});

export type ChapterUnitItem = z.infer<typeof chapterUnitItemSchema>;
export type ChapterUnitListResponse = z.infer<typeof chapterUnitListResponseSchema>;

export const chapterEditFormSchema = z.object({
  title: z
    .string()
    .min(1, '제목은 필수 항목입니다.')
    .max(FIELD_LIMITS.chapter.title, `${FIELD_LIMITS.chapter.title}자 이내로 입력해주세요.`),
  description: z
    .string()
    .max(FIELD_LIMITS.chapter.description, `${FIELD_LIMITS.chapter.description}자 이내로 입력해주세요.`),
});

export type ChapterEditFormValues = z.infer<typeof chapterEditFormSchema>;
