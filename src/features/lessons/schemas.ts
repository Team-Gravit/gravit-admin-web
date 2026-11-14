import { z } from 'zod';
import { FIELD_LIMITS } from '@/shared/constants/fieldLimits';

export const problemTypeSchema = z.enum(['OBJECTIVE', 'SUBJECTIVE']);

export const lessonDetailSchema = z.object({
  lessonId: z.number(),
  unitId: z.number(),
  title: z.string(),
  problemCount: z.number(),
});

export type LessonDetail = z.infer<typeof lessonDetailSchema>;

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

export const lessonEditFormSchema = z.object({
  title: z
    .string()
    .min(1, '제목을 입력해 주세요.')
    .max(FIELD_LIMITS.lesson.title, `${FIELD_LIMITS.lesson.title}자 이내로 입력해 주세요.`),
});

export type LessonEditFormValues = z.infer<typeof lessonEditFormSchema>;
