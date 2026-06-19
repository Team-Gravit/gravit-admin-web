import { z } from 'zod';
import { FIELD_LIMITS } from '@/shared/constants/fieldLimits';

export const problemOptionSchema = z.object({
  optionId: z.number(),
  content: z.string(),
  explanation: z.string(),
  isAnswer: z.boolean(),
});
export type ProblemOption = z.infer<typeof problemOptionSchema>;

export const problemAnswerSchema = z.object({
  answerId: z.number(),
  content: z.string(),
  explanation: z.string(),
});
export type ProblemAnswer = z.infer<typeof problemAnswerSchema>;

export const objectiveProblemSchema = z.object({
  problemId: z.number(),
  lessonId: z.number(),
  problemType: z.literal('OBJECTIVE'),
  instruction: z.string(),
  content: z.string(),
  options: z.array(problemOptionSchema),
});

export const subjectiveProblemSchema = z.object({
  problemId: z.number(),
  lessonId: z.number(),
  problemType: z.literal('SUBJECTIVE'),
  instruction: z.string(),
  content: z.string(),
  answer: problemAnswerSchema,
});

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
