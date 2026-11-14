import { describe, expect, it } from 'vitest';
import { inquiryAnswerFormSchema } from '@/features/inquiries/schemas';

describe('문의 답변 폼', () => {
  it('공백만 있는 답변을 거부하고 입력 방법을 알려줘요', () => {
    const result = inquiryAnswerFormSchema.safeParse({ content: ' \n ' });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.message).toBe('답변 내용을 입력해 주세요.');
  });
  it('기존 trim만 적용하고 내부 원문과 줄바꿈을 보존해요', () => {
    expect(inquiryAnswerFormSchema.parse({ content: '  원문_CODE\n두 번째  줄  ' })).toEqual({
      content: '원문_CODE\n두 번째  줄',
    });
  });
});
