import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/render';
import { ConfirmModal } from '@/shared/components/modals/ConfirmModal';

describe('ConfirmModal', () => {
  it('기본 닫기 버튼을 누르면 확인 없이 창을 닫아요', async () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    renderWithProviders(
      <ConfirmModal open onOpenChange={onOpenChange} title="삭제할까요?" onConfirm={onConfirm} />,
    );
    const close = screen.getAllByRole('button', { name: '닫기' })[0];
    if (!close) throw new Error('닫기 버튼 없음');
    await userEvent.setup().click(close);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onConfirm).not.toHaveBeenCalled();
  });
  it('전달한 행동 이름으로 확인하면 기존 콜백을 불러요', async () => {
    const onConfirm = vi.fn();
    renderWithProviders(
      <ConfirmModal
        open
        onOpenChange={vi.fn()}
        title="삭제할까요?"
        cancelLabel="돌아가기"
        confirmLabel="삭제하기"
        onConfirm={onConfirm}
      />,
    );
    expect(screen.getByRole('button', { name: '돌아가기' })).toBeEnabled();
    await userEvent.setup().click(screen.getByRole('button', { name: '삭제하기' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
  it('처리 중이면 기존 확인과 하단 닫기를 비활성화해요', () => {
    renderWithProviders(
      <ConfirmModal open loading onOpenChange={vi.fn()} title="삭제할까요?" onConfirm={vi.fn()} />,
    );
    expect(screen.getByRole('button', { name: '확인' })).toBeDisabled();
    expect(
      screen.getAllByRole('button', { name: '닫기' }).filter((b) => b.hasAttribute('disabled')),
    ).toHaveLength(1);
  });
});
