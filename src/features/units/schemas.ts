import { z } from 'zod';
import { FIELD_LIMITS } from '@/shared/constants/fieldLimits';

/** 유닛 상세 (03 §7-6). lessonCount = 이 유닛의 레슨 수(디자인 단계 추가 요청 필드). */
export const unitDetailSchema = z.object({
  unitId: z.number(),
  chapterId: z.number(),
  title: z.string(),
  description: z.string(),
  lessonCount: z.number(),
});

export type UnitDetail = z.infer<typeof unitDetailSchema>;

/** 유닛의 레슨 목록 아이템 (03 §7-8). 레슨에는 description 필드 없음(제목만). */
export const unitLessonItemSchema = z.object({
  lessonId: z.number(),
  title: z.string(),
});

export const unitLessonListResponseSchema = z.object({
  page: z.number(),
  totalPages: z.number(),
  hasNext: z.boolean(),
  contents: z.array(unitLessonItemSchema),
});

export type UnitLessonItem = z.infer<typeof unitLessonItemSchema>;
export type UnitLessonListResponse = z.infer<typeof unitLessonListResponseSchema>;

/**
 * 유닛 편집 폼 (01 §6-5-3 편집 필드 = 제목·설명, 03 §7-7, §9-5 FIELD_LIMITS).
 * 제목 필수, 설명 선택(빈 문자열 허용).
 */
export const unitEditFormSchema = z.object({
  title: z
    .string()
    .min(1, '제목은 필수 항목입니다.')
    .max(FIELD_LIMITS.unit.title, `${FIELD_LIMITS.unit.title}자 이내로 입력해주세요.`),
  description: z
    .string()
    .max(FIELD_LIMITS.unit.description, `${FIELD_LIMITS.unit.description}자 이내로 입력해주세요.`),
});

export type UnitEditFormValues = z.infer<typeof unitEditFormSchema>;
