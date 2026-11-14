import { describe, expect, it } from 'vitest';
import { noticeFormSchema } from '@/features/notices/schemas';
import { FIELD_LIMITS } from '@/shared/constants/fieldLimits';

const valid = {
  title: '원문_CODE',
  summary: '요약',
  content: '# 원문\n**Markdown**',
  pinned: true,
};

describe('공지 폼', () => {
  it('필수 입력이 비면 해요체 안내를 주고 입력을 거부해요', () => {
    const result = noticeFormSchema.safeParse({ ...valid, title: '' });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.message).toBe('제목을 입력해 주세요.');
  });
  it.each(['title', 'summary', 'content'] as const)(
    '%s의 기존 최대 길이를 허용하고 한 글자 초과를 거부해요',
    (field) => {
      const max = FIELD_LIMITS.notice[field];
      expect(noticeFormSchema.safeParse({ ...valid, [field]: '가'.repeat(max) }).success).toBe(
        true,
      );
      const result = noticeFormSchema.safeParse({ ...valid, [field]: '가'.repeat(max + 1) });
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.error.issues[0]?.message).toBe(`${max}자 이내로 입력해 주세요.`);
    },
  );
  it('원문 Markdown과 상단 고정 값은 변형하지 않아요', () => {
    expect(noticeFormSchema.parse(valid)).toEqual(valid);
  });
});
