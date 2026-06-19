import { z } from 'zod';
import { FIELD_LIMITS } from '@/shared/constants/fieldLimits';

export const stagingStatusSchema = z.enum(['PENDING', 'COMPLETED']);

export const stagingLabelListItemSchema = z.object({
  label: z.string(),
  unitId: z.number(),
  description: z.string(),
  status: stagingStatusSchema,
  createdAt: z.string(),
});

export const stagingLabelListResponseSchema = z.object({
  page: z.number(),
  totalPages: z.number(),
  hasNext: z.boolean(),
  contents: z.array(stagingLabelListItemSchema),
});

export type StagingLabelListItem = z.infer<typeof stagingLabelListItemSchema>;
export type StagingLabelListResponse = z.infer<typeof stagingLabelListResponseSchema>;

export const stagingLessonSchema = z.object({
  lessonId: z.number(),
  title: z.string(),
});

export const stagingOptionSchema = z.object({
  optionId: z.number(),
  content: z.string(),
  explanation: z.string(),
  isAnswer: z.boolean(),
});

export const stagingAnswerSchema = z.object({
  answerId: z.number(),
  content: z.string(),
  explanation: z.string(),
});

export const stagingObjectiveProblemSchema = z.object({
  problemId: z.number(),
  problemType: z.literal('OBJECTIVE'),
  instruction: z.string(),
  content: z.string(),
  options: z.array(stagingOptionSchema),
});

export const stagingSubjectiveProblemSchema = z.object({
  problemId: z.number(),
  problemType: z.literal('SUBJECTIVE'),
  instruction: z.string(),
  content: z.string(),
  answer: stagingAnswerSchema,
});

export const stagingProblemSchema = z.discriminatedUnion('problemType', [
  stagingObjectiveProblemSchema,
  stagingSubjectiveProblemSchema,
]);

export const stagingLabelDetailSchema = z.object({
  label: z.string(),
  unitId: z.number(),
  description: z.string(),
  status: stagingStatusSchema,
  createdAt: z.string(),
  lesson: stagingLessonSchema,
  problems: z.array(stagingProblemSchema),
});

export const stagingLessonFormSchema = z.object({
  title: z
    .string()
    .min(1, '제목은 필수 항목입니다.')
    .max(FIELD_LIMITS.lesson.title, `${FIELD_LIMITS.lesson.title}자 이내로 입력해주세요.`),
});
export type StagingLessonFormValues = z.infer<typeof stagingLessonFormSchema>;

export const stagingObjectiveFormSchema = z.object({
  instruction: z
    .string()
    .min(1, '지시문은 필수 항목입니다.')
    .max(FIELD_LIMITS.problem.instruction, `${FIELD_LIMITS.problem.instruction}자 이내로 입력해주세요.`),
  content: z
    .string()
    .min(1, '본문은 필수 항목입니다.')
    .max(FIELD_LIMITS.problem.content, `${FIELD_LIMITS.problem.content}자 이내로 입력해주세요.`),
  answerOptionId: z.number(),
  options: z.array(
    z.object({
      optionId: z.number(),
      content: z
        .string()
        .min(1, '보기 내용을 입력해주세요.')
        .max(FIELD_LIMITS.option.content, `${FIELD_LIMITS.option.content}자 이내로 입력해주세요.`),
      explanation: z
        .string()
        .min(1, '해설을 입력해주세요.')
        .max(
          FIELD_LIMITS.option.explanation,
          `${FIELD_LIMITS.option.explanation}자 이내로 입력해주세요.`,
        ),
    }),
  ),
});
export type StagingObjectiveFormValues = z.infer<typeof stagingObjectiveFormSchema>;

export const stagingSubjectiveFormSchema = z.object({
  instruction: z
    .string()
    .min(1, '지시문은 필수 항목입니다.')
    .max(FIELD_LIMITS.problem.instruction, `${FIELD_LIMITS.problem.instruction}자 이내로 입력해주세요.`),
  content: z
    .string()
    .min(1, '본문은 필수 항목입니다.')
    .max(FIELD_LIMITS.problem.content, `${FIELD_LIMITS.problem.content}자 이내로 입력해주세요.`),
  answerContent: z
    .string()
    .min(1, '정답을 입력해주세요.')
    .max(FIELD_LIMITS.answer.content, `${FIELD_LIMITS.answer.content}자 이내로 입력해주세요.`),
  answerExplanation: z
    .string()
    .min(1, '해설을 입력해주세요.')
    .max(FIELD_LIMITS.answer.explanation, `${FIELD_LIMITS.answer.explanation}자 이내로 입력해주세요.`),
});
export type StagingSubjectiveFormValues = z.infer<typeof stagingSubjectiveFormSchema>;

export type StagingLesson = z.infer<typeof stagingLessonSchema>;
export type StagingOption = z.infer<typeof stagingOptionSchema>;
export type StagingAnswer = z.infer<typeof stagingAnswerSchema>;
export type StagingObjectiveProblem = z.infer<typeof stagingObjectiveProblemSchema>;
export type StagingSubjectiveProblem = z.infer<typeof stagingSubjectiveProblemSchema>;
export type StagingProblem = z.infer<typeof stagingProblemSchema>;
export type StagingLabelDetail = z.infer<typeof stagingLabelDetailSchema>;
