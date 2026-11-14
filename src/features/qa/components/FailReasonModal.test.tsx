import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/render';
import { FailReasonModal } from '@/features/qa/components/FailReasonModal';

const defaults = {
  initialReason: '',
  editingReason: false,
  pending: false,
  locked: false,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
  restoreFocus: vi.fn(),
};
describe('FailReasonModal', () => {
  it('선택 사유는 짧게 안내하고 닫기는 제출하지 않아요', async () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    renderWithProviders(<FailReasonModal {...defaults} onClose={onClose} onConfirm={onConfirm} />);
    expect(screen.getByText('수정할 내용을 남겨 주세요.')).toBeVisible();
    expect(screen.getByRole('textbox', { name: '사유 (선택)' })).toBeVisible();
    const close = screen.getAllByRole('button', { name: '닫기' })[0];
    if (!close) throw new Error('닫기 버튼 없음');
    await userEvent.setup().click(close);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });
  it('빈 사유로도 기존 Fail 제출을 허용해요', async () => {
    const onConfirm = vi.fn();
    renderWithProviders(<FailReasonModal {...defaults} onConfirm={onConfirm} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Fail로 변경' }));
    expect(onConfirm).toHaveBeenCalledWith('');
  });
  it('수정할 때 기존 사유 원문과 빈 값의 유지 안내를 보여줘요', () => {
    renderWithProviders(
      <FailReasonModal {...defaults} editingReason initialReason="CASE_01  원문" />,
    );
    expect(screen.getByRole('textbox', { name: '사유 (선택)' })).toHaveValue('CASE_01  원문');
    expect(screen.getByText('사유를 수정해 주세요. 비워 두면 기존 사유를 유지해요.')).toBeVisible();
  });
  it('처리 중에는 닫기와 제출 콜백을 부르지 않아요', async () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <FailReasonModal {...defaults} pending onClose={onClose} onConfirm={onConfirm} />,
    );
    const close = screen.getAllByRole('button', { name: '닫기' })[0];
    if (!close) throw new Error('닫기 버튼 없음');
    await user.click(close);
    await user.click(screen.getByRole('button', { name: 'Fail로 변경' }));
    expect(onClose).not.toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
