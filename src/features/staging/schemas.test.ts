import { describe, expect, it } from 'vitest';
import {
  stagingSubjectiveProblemSchema,
  stagingSubjectiveFormSchema,
  stagingLessonFormSchema,
} from '@/features/staging/schemas';
import { FIELD_LIMITS } from '@/shared/constants/fieldLimits';

const problem = {
  problemId: 1003,
  problemType: 'SUBJECTIVE',
  instruction: '원문 지시문',
  content: '# 본문',
  answer: { answerId: 2003, content: '영, zero,0', explanation: '원문 해설' },
};
const form = {
  instruction: '원문 지시문',
  content: '# 본문',
  answerContent: '영, zero,0',
  answerExplanation: '원문 해설',
};

describe('staging 주관식 계약', () => {
  it('정답은 콤마 문자열을 가진 단일 객체로 보존해요', () => {
    expect(stagingSubjectiveProblemSchema.parse(problem)).toEqual(problem);
    expect(stagingSubjectiveFormSchema.parse(form)).toEqual(form);
  });
  it('정답 배열이나 콤마를 분해한 배열을 받지 않아요', () => {
    expect(
      stagingSubjectiveProblemSchema.safeParse({ ...problem, answer: [problem.answer] }).success,
    ).toBe(false);
    expect(
      stagingSubjectiveProblemSchema.safeParse({
        ...problem,
        answer: { ...problem.answer, content: ['영', 'zero', '0'] },
      }).success,
    ).toBe(false);
  });
  it('레슨 제목이 비면 기존 제출을 막고 입력 방법을 알려줘요', () => {
    const result = stagingLessonFormSchema.safeParse({ title: '' });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.message).toBe('제목을 입력해 주세요.');
  });
  it('정답의 기존 최대 길이 경계를 유지해요', () => {
    expect(
      stagingSubjectiveFormSchema.safeParse({
        ...form,
        answerContent: '가'.repeat(FIELD_LIMITS.answer.content),
      }).success,
    ).toBe(true);
    expect(
      stagingSubjectiveFormSchema.safeParse({
        ...form,
        answerContent: '가'.repeat(FIELD_LIMITS.answer.content + 1),
      }).success,
    ).toBe(false);
  });
});
