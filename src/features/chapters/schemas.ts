import { z } from 'zod';
import { FIELD_LIMITS } from '@/shared/constants/fieldLimits';

/** 챕터 목록 아이템 (03 §7-1). */
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

/** 챕터 상세 (03 §7-2). unitCount = 이 챕터의 유닛 수(디자인 단계 추가 요청 필드). */
export const chapterDetailSchema = z.object({
  chapterId: z.number(),
  title: z.string(),
  description: z.string(),
  unitCount: z.number(),
});

export type ChapterDetail = z.infer<typeof chapterDetailSchema>;

/**
 * 챕터 풀이 현황 (03 §7-3). 비페이지네이션(units 배열).
 * averageProgress = 0~100 정수 퍼센트 (03 §7-3 v1.1 확정).
 */
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

/** 챕터의 유닛 목록 아이템 (03 §7-5). */
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

/**
 * 챕터 편집 폼 (01 §6-5-2 편집 필드 = 제목·설명, 03 §7-4, §9-5 FIELD_LIMITS).
 * 제목 필수, 설명 선택(빈 문자열 허용).
 */
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
