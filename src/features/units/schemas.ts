import { z } from 'zod';
import { FIELD_LIMITS } from '@/shared/constants/fieldLimits';

export const unitDetailSchema = z.object({
  unitId: z.number(),
  chapterId: z.number(),
  title: z.string(),
  description: z.string(),
  lessonCount: z.number(),
});

export type UnitDetail = z.infer<typeof unitDetailSchema>;

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
