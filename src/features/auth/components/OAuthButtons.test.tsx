import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/render';
import { OAuthButtons } from '@/features/auth/components/OAuthButtons';

describe('OAuthButtons', () => {
  it('이름과 순서를 유지하며 각 제공자 id를 그대로 전달해요', async () => {
    const onLogin = vi.fn();
    renderWithProviders(<OAuthButtons onLogin={onLogin} />);
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual([
      'Google로 시작하기', '카카오로 시작하기', '네이버로 시작하기',
    ]);
    const user = userEvent.setup();
    for (const button of screen.getAllByRole('button')) await user.click(button);
    expect(onLogin.mock.calls).toEqual([['GOOGLE'], ['KAKAO'], ['NAVER']]);
  });
  it('기존 disabled에서 세 제공자의 콜백을 모두 막아요', async () => {
    const onLogin = vi.fn();
    renderWithProviders(<OAuthButtons onLogin={onLogin} disabled />);
    const user = userEvent.setup();
    for (const button of screen.getAllByRole('button')) {
      expect(button).toBeDisabled();
      await user.click(button);
    }
    expect(onLogin).not.toHaveBeenCalled();
  });
});
