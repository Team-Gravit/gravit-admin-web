import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/render';
import { QaConfirmModal } from '@/features/qa/components/QaConfirmModal';

describe('QaConfirmModal', () => {
  it('원문과 행동 이름을 보존하고 닫기는 확인을 실행하지 않아요', async () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    renderWithProviders(
      <QaConfirmModal
        open
        title="원문_CODE"
        description="원문 사유_CODE"
        confirmLabel="항목 삭제하기"
        onClose={onClose}
        onConfirm={onConfirm}
      />,
    );
    expect(screen.getByRole('dialog', { name: '원문_CODE' })).toHaveTextContent('원문 사유_CODE');
    expect(screen.queryByRole('button', { name: '취소' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '항목 삭제하기' })).toBeEnabled();
    const close = screen.getAllByRole('button', { name: '닫기' })[0];
    if (!close) throw new Error('닫기 버튼 없음');
    await userEvent.setup().click(close);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });
  it('처리 중이면 기존 확인과 닫기 콜백을 막아요', async () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    renderWithProviders(
      <QaConfirmModal
        open
        pending
        title="처리_CODE"
        description="원문"
        confirmLabel="삭제하기"
        onClose={onClose}
        onConfirm={onConfirm}
      />,
    );
    const confirm = screen.getByRole('button', { name: '삭제하기' });
    expect(confirm).toBeDisabled();
    expect(confirm).toHaveAttribute('aria-busy', 'true');
    await userEvent.setup().click(confirm);
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
  it('잠금 상태에서는 확인만 막고 닫기는 유지해요', () => {
    renderWithProviders(
      <QaConfirmModal
        open
        disabled
        title="잠금_CODE"
        description="원문"
        confirmLabel="수정하기"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: '수정하기' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: '취소' })).not.toBeInTheDocument();
    expect(
      screen
        .getAllByRole('button', { name: '닫기' })
        .some((button) => !button.hasAttribute('disabled')),
    ).toBe(true);
  });
});
