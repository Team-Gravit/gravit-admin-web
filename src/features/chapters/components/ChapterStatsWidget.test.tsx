import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/render';
import { ChapterStatsWidget } from '@/features/chapters/components/ChapterStatsWidget';

const stats = {
  units: [{ unitId: 12, unitTitle: '원문_CODE', averageProgress: 125, participantCount: 2300 }],
};

describe('ChapterStatsWidget', () => {
  it('서버 원문과 참여 수를 유지하고 기존 진행률 범위로 즉시 표시해요', () => {
    renderWithProviders(
      <ChapterStatsWidget stats={stats} isLoading={false} isError={false} onRetry={vi.fn()} />,
    );
    expect(screen.getByText('원문_CODE')).toBeVisible();
    expect(screen.getByText('2,300')).toBeVisible();
    expect(screen.getByText('100%')).toBeVisible();
  });
  it('빈 데이터면 해요체 빈 안내만 보여줘요', () => {
    renderWithProviders(
      <ChapterStatsWidget
        stats={{ units: [] }}
        isLoading={false}
        isError={false}
        onRetry={vi.fn()}
      />,
    );
    expect(screen.getByText('아직 풀이 데이터가 없어요.')).toBeVisible();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
  it('오류면 데이터 대신 재시도를 제공해요', async () => {
    const retry = vi.fn();
    renderWithProviders(
      <ChapterStatsWidget stats={stats} isLoading={false} isError onRetry={retry} />,
    );
    await userEvent.setup().click(screen.getByRole('button', { name: '다시 시도하기' }));
    expect(retry).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('원문_CODE')).not.toBeInTheDocument();
  });
  it('로딩이 오류와 이전 데이터보다 우선해요', () => {
    renderWithProviders(<ChapterStatsWidget stats={stats} isLoading isError onRetry={vi.fn()} />);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByText('아직 풀이 데이터가 없어요.')).not.toBeInTheDocument();
  });
});
