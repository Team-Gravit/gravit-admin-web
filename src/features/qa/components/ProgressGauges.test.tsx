import { describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { renderWithProviders } from '@/test/render';
import { ProgressGauges } from '@/features/qa/components/ProgressGauges';

// jsdom has no layout; preserve the real meter/copy, isolate only the SVG canvas.
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  PieChart: ({ children }: { children: ReactNode }) => <svg>{children}</svg>,
  Pie: () => null,
  Cell: () => null,
}));
vi.mock('@/shared/hooks/usePrefersReducedMotion', () => ({ usePrefersReducedMotion: () => false }));

describe('ProgressGauges', () => {
  it('서버의 집계를 첫 렌더부터 수치와 meter에 동일하게 보여줘요', () => {
    renderWithProviders(
      <ProgressGauges progress={[{ part: 'WEB', total: 3, checked: 1, pass: 1, fail: 0 }]} />,
    );
    const meter = screen.getByRole('meter', { name: 'Web 완료율' });
    expect(meter).toHaveAttribute('aria-valuenow', '33');
    expect(meter).toHaveAttribute('aria-valuetext', '1 / 3, 33%');
    expect(within(meter).getByText('33%')).toBeVisible();
    expect(screen.getByText('1 / 3')).toBeVisible();
    expect(screen.getAllByRole('meter')).toHaveLength(4);
  });
  it('집계가 없거나 total이0이면 대상 없음과 대시를 유지해요', () => {
    renderWithProviders(
      <ProgressGauges progress={[{ part: 'DESIGN', total: 0, checked: 0, pass: 0, fail: 0 }]} />,
    );
    for (const meter of screen.getAllByRole('meter')) {
      expect(meter).toHaveAttribute('aria-valuenow', '0');
      expect(meter).toHaveAttribute('aria-valuetext', '대상 없음');
      expect(within(meter).getByText('-')).toBeVisible();
    }
    expect(screen.getAllByText('대상 없음')).toHaveLength(4);
  });
});
