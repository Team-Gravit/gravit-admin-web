import { z } from 'zod';
import { FIELD_LIMITS } from '@/shared/constants/fieldLimits';

/** 문제 유형 (03 §5 / §7-11, enums ProblemType 와 동일 값). */
export const problemTypeSchema = z.enum(['OBJECTIVE', 'SUBJECTIVE']);

/** 레슨 상세 (03 §7-9). problemCount = 이 레슨의 문제 수(디자인 단계 추가 요청 필드). */
export const lessonDetailSchema = z.object({
  lessonId: z.number(),
  unitId: z.number(),
  title: z.string(),
  problemCount: z.number(),
});

export type LessonDetail = z.infer<typeof lessonDetailSchema>;

/** 레슨의 문제 목록 아이템 (03 §7-11). */
export const lessonProblemItemSchema = z.object({
  problemId: z.number(),
  problemType: problemTypeSchema,
  instruction: z.string(),
});

export const lessonProblemListResponseSchema = z.object({
  page: z.number(),
  totalPages: z.number(),
  hasNext: z.boolean(),
  contents: z.array(lessonProblemItemSchema),
});

export type LessonProblemItem = z.infer<typeof lessonProblemItemSchema>;
export type LessonProblemListResponse = z.infer<typeof lessonProblemListResponseSchema>;

/**
 * 레슨 편집 폼 (01 §6-5-4 편집 필드 = 제목만, 03 §7-10, §9-5 FIELD_LIMITS).
 * 레슨은 description 필드 자체가 없음 → title 단일.
 */
export const lessonEditFormSchema = z.object({
  title: z
    .string()
    .min(1, '제목은 필수 항목입니다.')
    .max(FIELD_LIMITS.lesson.title, `${FIELD_LIMITS.lesson.title}자 이내로 입력해주세요.`),
});

export type LessonEditFormValues = z.infer<typeof lessonEditFormSchema>;
