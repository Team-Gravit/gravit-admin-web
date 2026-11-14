import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { renderWithProviders } from '@/test/render';
import { StrictMatchModal } from '@/shared/components/modals/StrictMatchModal';

const label = '2026-04-25-a3f9';
function Example({ loading = false }: { loading?: boolean }) {
  const [open, setOpen] = useState(true);
  return (
    <>
      <button onClick={() => setOpen(true)}>다시 열기</button>
      <StrictMatchModal
        open={open}
        loading={loading}
        onOpenChange={setOpen}
        label={label}
        onConfirm={vi.fn()}
      />
    </>
  );
}
describe('StrictMatchModal', () => {
  it('새 기본 제목을 보여주고 완전 일치할 때만 반영을 허용해요', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Example />);
    expect(screen.getByRole('heading', { name: '라벨을 반영할까요?' })).toBeVisible();
    const input = screen.getByRole('textbox');
    const confirm = screen.getByRole('button', { name: '반영' });
    expect(input).not.toHaveAttribute('placeholder');
    expect(confirm).toBeDisabled();
    for (const value of [label.toUpperCase(), label + ' ', ' ' + label, 'other-label']) {
      await user.clear(input);
      await user.type(input, value);
      expect(confirm).toBeDisabled();
    }
    await user.clear(input);
    await user.type(input, label);
    expect(confirm).toBeEnabled();
  });
  it('닫고 다시 열면 입력값이 초기화돼요', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Example />);
    await user.type(screen.getByRole('textbox'), label);
    const close = screen.getAllByRole('button', { name: '닫기' })[0];
    if (!close) throw new Error('닫기 버튼 없음');
    await user.click(close);
    await user.click(screen.getByRole('button', { name: '다시 열기' }));
    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(screen.getByRole('button', { name: '반영' })).toBeDisabled();
  });
  it('일치하더라도 처리 중이면 반영을 허용하지 않아요', async () => {
    renderWithProviders(<Example loading />);
    await userEvent.setup().type(screen.getByRole('textbox'), label);
    expect(screen.getByRole('button', { name: '반영' })).toBeDisabled();
  });
});
