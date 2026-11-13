import { describe, expect, it } from 'vitest';
import { fixReportsSchema } from '@/features/qa/schemas';

// G1 GET /sprints/{id}/fix-reports 응답 (docs/conventions/decisions.md D12).
const readyReports = {
  sprintId: 7,
  status: 'CLOSED',
  ready: true,
  unchecked: { design: 0, first: 0, second: 0 },
  parts: [
    { part: 'DESIGN', failCount: 2, fileName: 'S7-design.txt' },
    { part: 'WEB', failCount: 0, fileName: '' },
    { part: 'APP', failCount: 1, fileName: 'S7-app.txt' },
    { part: 'SERVER', failCount: 0, fileName: '' },
  ],
};

describe('fixReportsSchema', () => {
  it('준비 완료면 4개 파트를 받고, Fail 이 없는 파트는 파일명이 비어도 된다', () => {
    const parsed = fixReportsSchema.parse(readyReports);
    expect(parsed.parts.map(({ part }) => part)).toEqual(['DESIGN', 'WEB', 'APP', 'SERVER']);
  });

  it('준비 전이면 파트 목록이 비어도 된다', () => {
    const result = fixReportsSchema.safeParse({
      ...readyReports,
      status: 'MANUAL_REVIEW',
      ready: false,
      unchecked: { design: 1, first: 0, second: 3 },
      parts: [],
    });
    expect(result.success).toBe(true);
  });

  it('준비 완료인데 파트가 4개가 아니면 거부한다', () => {
    const result = fixReportsSchema.safeParse({
      ...readyReports,
      parts: readyReports.parts.slice(0, 3),
    });
    expect(result.success).toBe(false);
  });

  it('준비 완료인데 Fail 이 있는 파트의 파일명이 비면 거부한다', () => {
    const result = fixReportsSchema.safeParse({
      ...readyReports,
      parts: readyReports.parts.map((p) => (p.part === 'APP' ? { ...p, fileName: '' } : p)),
    });
    expect(result.success).toBe(false);
  });

  it('같은 파트가 두 번 오면 거부한다', () => {
    const result = fixReportsSchema.safeParse({
      ...readyReports,
      ready: false,
      parts: [readyReports.parts[0], readyReports.parts[0]],
    });
    expect(result.success).toBe(false);
  });

  it('미검수 수가 음수면 거부한다', () => {
    const result = fixReportsSchema.safeParse({
      ...readyReports,
      unchecked: { design: -1, first: 0, second: 0 },
    });
    expect(result.success).toBe(false);
  });
});
