import { describe, expect, it } from 'vitest';
import { formatDate, formatDateTime } from '@/shared/lib/formatDate';

describe('formatDate', () => {
  it.each([null, undefined, ''])('값이 없으면(%s) "-" 를 돌려준다', (input) => {
    expect(formatDate(input)).toBe('-');
    expect(formatDateTime(input)).toBe('-');
  });

  it('날짜만 있는 값(yyyy-MM-dd)은 시간대 변환 없이 그대로 돌려준다', () => {
    expect(formatDate('2026-11-13')).toBe('2026-11-13');
  });

  it('Date 는 로컬 시각 기준으로 형식을 맞춘다', () => {
    const date = new Date(2026, 0, 5, 9, 7);
    expect(formatDate(date)).toBe('2026-01-05');
    expect(formatDateTime(date)).toBe('2026-01-05 09:07');
  });
});
