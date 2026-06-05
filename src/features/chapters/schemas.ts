import { z } from 'zod';

/** 챕터 목록 아이템 (03 §7-1). */
export const chapterListItemSchema = z.object({
  chapterId: z.number(),
  title: z.string(),
  description: z.string(),
});

export const chapterListResponseSchema = z.object({
  page: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
  content: z.array(chapterListItemSchema),
});

export type ChapterListItem = z.infer<typeof chapterListItemSchema>;
export type ChapterListResponse = z.infer<typeof chapterListResponseSchema>;
