import { z } from 'zod';
import { FIELD_LIMITS } from '@/shared/constants/fieldLimits';

/** 객관식 보기 (03 §7-12). 4개 고정, isAnswer 정확히 1개 true. */
export const problemOptionSchema = z.object({
  optionId: z.number(),
  content: z.string(),
  explanation: z.string(),
  isAnswer: z.boolean(),
});
export type ProblemOption = z.infer<typeof problemOptionSchema>;

/** 주관식 정답 (D1): 단일 객체, content = 콤마 구분 단일 텍스트(예: "데이터베이스,database"). */
export const problemAnswerSchema = z.object({
  answerId: z.number(),
  content: z.string(),
  explanation: z.string(),
});
export type ProblemAnswer = z.infer<typeof problemAnswerSchema>;

/** 객관식 문제 상세 (03 §7-12). */
export const objectiveProblemSchema = z.object({
  problemId: z.number(),
  lessonId: z.number(),
  problemType: z.literal('OBJECTIVE'),
  instruction: z.string(),
  content: z.string(),
  options: z.array(problemOptionSchema),
});

/** 주관식 문제 상세 (D1: 단일 answer 객체. 03 §7-12 answers 배열 표기는 stale). */
export const subjectiveProblemSchema = z.object({
  problemId: z.number(),
  lessonId: z.number(),
  problemType: z.literal('SUBJECTIVE'),
  instruction: z.string(),
  content: z.string(),
  answer: problemAnswerSchema,
});

/** 문제 상세 = problemType 분기 (03 §7-12). */
export const problemDetailSchema = z.discriminatedUnion('problemType', [
  objectiveProblemSchema,
  subjectiveProblemSchema,
]);

export type ObjectiveProblem = z.infer<typeof objectiveProblemSchema>;
export type SubjectiveProblem = z.infer<typeof subjectiveProblemSchema>;
export type ProblemDetail = z.infer<typeof problemDetailSchema>;

const instructionField = z
  .string()
  .min(1, '지시문은 필수 항목입니다.')
  .max(FIELD_LIMITS.problem.instruction, `${FIELD_LIMITS.problem.instruction}자 이내로 입력해주세요.`);
const contentField = z
  .string()
  .min(1, '본문은 필수 항목입니다.')
  .max(FIELD_LIMITS.problem.content, `${FIELD_LIMITS.problem.content}자 이내로 입력해주세요.`);

/**
 * 객관식 편집 폼 (01 §6-5-5, DS-02 §14-2, 03 §7-13).
 * 보기 4개 고정(추가/삭제 불가), 정답은 radio 단일 선택(answerOptionId). 제출 시 options 전체 교체.
 */
export const objectiveEditFormSchema = z.object({
  instruction: instructionField,
  content: contentField,
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
export type ObjectiveEditFormValues = z.infer<typeof objectiveEditFormSchema>;

/**
 * 주관식 편집 폼 (D1 B-single-comma, 01 §6-5-5, 03 §7-14).
 * 단일 정답(콤마 구분 content) + 단일 해설. 정답 추가/삭제 없음(개수 고정 D2).
 */
export const subjectiveEditFormSchema = z.object({
  instruction: instructionField,
  content: contentField,
  answerContent: z
    .string()
    .min(1, '정답을 입력해주세요.')
    .max(FIELD_LIMITS.answer.content, `${FIELD_LIMITS.answer.content}자 이내로 입력해주세요.`),
  answerExplanation: z
    .string()
    .min(1, '해설을 입력해주세요.')
    .max(FIELD_LIMITS.answer.explanation, `${FIELD_LIMITS.answer.explanation}자 이내로 입력해주세요.`),
});
export type SubjectiveEditFormValues = z.infer<typeof subjectiveEditFormSchema>;
