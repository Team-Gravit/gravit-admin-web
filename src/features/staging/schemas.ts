import { z } from 'zod';
import { FIELD_LIMITS } from '@/shared/constants/fieldLimits';

/** 스테이징 라벨 상태 (03 §5, enums StagingStatus). */
export const stagingStatusSchema = z.enum(['PENDING', 'COMPLETED']);

/** 스테이징 라벨 목록 아이템 (03 §8-1). */
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
  hasNextPage: z.boolean(),
  content: z.array(stagingLabelListItemSchema),
});

export type StagingLabelListItem = z.infer<typeof stagingLabelListItemSchema>;
export type StagingLabelListResponse = z.infer<typeof stagingLabelListResponseSchema>;

// ── 라벨 상세 그루핑 (03 §8-2, 04 §10-2-1) — 레슨 1 + 문제 6 ──

/** 스테이징 레슨 (04 §10-2-1). */
export const stagingLessonSchema = z.object({
  lessonId: z.number(),
  title: z.string(),
});

/** 스테이징 객관식 옵션 (04 §10-2-1). optionId ASC, 4개, isAnswer 1개. */
export const stagingOptionSchema = z.object({
  optionId: z.number(),
  content: z.string(),
  explanation: z.string(),
  isAnswer: z.boolean(),
});

/** 스테이징 주관식 정답 (D1): 단일 객체, content = 콤마 구분 단일 텍스트. (03 §8-2 answers 배열 표기는 stale.) */
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

/** 스테이징 문제 = problemType 분기 (D1: 객관식 options[4] / 주관식 단일 answer 객체). */
export const stagingProblemSchema = z.discriminatedUnion('problemType', [
  stagingObjectiveProblemSchema,
  stagingSubjectiveProblemSchema,
]);

/** 라벨 상세 그루핑 응답 (03 §8-2, 04 §10-2-1). */
export const stagingLabelDetailSchema = z.object({
  label: z.string(),
  unitId: z.number(),
  description: z.string(),
  status: stagingStatusSchema,
  createdAt: z.string(),
  lesson: stagingLessonSchema,
  problems: z.array(stagingProblemSchema),
});

/** 스테이징 레슨 편집 폼 (DS-02 §16-4-1, 03 §8-3): 제목만. */
export const stagingLessonFormSchema = z.object({
  title: z
    .string()
    .min(1, '제목은 필수 항목입니다.')
    .max(FIELD_LIMITS.lesson.title, `${FIELD_LIMITS.lesson.title}자 이내로 입력해주세요.`),
});
export type StagingLessonFormValues = z.infer<typeof stagingLessonFormSchema>;

/**
 * 스테이징 객관식 편집 폼 (DS-02 §16-4-2, 04 §11 검증표, 03 §8-4/§8-5).
 * 보기 4 고정, 정답 radio 단일(answerOptionId). 모든 텍스트 빈값 불가.
 */
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

export type StagingLesson = z.infer<typeof stagingLessonSchema>;
export type StagingOption = z.infer<typeof stagingOptionSchema>;
export type StagingAnswer = z.infer<typeof stagingAnswerSchema>;
export type StagingObjectiveProblem = z.infer<typeof stagingObjectiveProblemSchema>;
export type StagingSubjectiveProblem = z.infer<typeof stagingSubjectiveProblemSchema>;
export type StagingProblem = z.infer<typeof stagingProblemSchema>;
export type StagingLabelDetail = z.infer<typeof stagingLabelDetailSchema>;
