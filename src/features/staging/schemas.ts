import { z } from 'zod';

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

/** 스테이징 주관식 정답 (03 §8-2). D1(B-single-comma): content 콤마 구분, answers 는 1요소 배열. */
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
  answers: z.array(stagingAnswerSchema),
});

/** 스테이징 문제 = problemType 분기 (03 §8-2: 주관식은 answers 배열, D1 = 1요소). */
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

export type StagingLesson = z.infer<typeof stagingLessonSchema>;
export type StagingOption = z.infer<typeof stagingOptionSchema>;
export type StagingAnswer = z.infer<typeof stagingAnswerSchema>;
export type StagingObjectiveProblem = z.infer<typeof stagingObjectiveProblemSchema>;
export type StagingSubjectiveProblem = z.infer<typeof stagingSubjectiveProblemSchema>;
export type StagingProblem = z.infer<typeof stagingProblemSchema>;
export type StagingLabelDetail = z.infer<typeof stagingLabelDetailSchema>;
