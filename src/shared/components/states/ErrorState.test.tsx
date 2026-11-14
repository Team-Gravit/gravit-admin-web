import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/render';
import { ErrorState } from '@/shared/components/states/ErrorState';

describe('ErrorState', () => {
  it('기본 안내와 재시도 행동을 보여줘요', async () => {
    const onRetry = vi.fn();
    renderWithProviders(<ErrorState onRetry={onRetry} />);
    expect(
      screen.getByText('데이터를 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요.'),
    ).toBeVisible();
    await userEvent.setup().click(screen.getByRole('button', { name: '다시 시도하기' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
  it('전달한 문구를 보존하고 콜백이 없으면 재시도 버튼을 숨겨요', () => {
    renderWithProviders(<ErrorState message="API_STATUS_503 원문" />);
    expect(screen.getByText('API_STATUS_503 원문')).toBeVisible();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
