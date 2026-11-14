import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/render';
import { UnsavedChangesModal } from '@/shared/components/modals/UnsavedChangesModal';

describe('UnsavedChangesModal', () => {
  it('기본 안내에서 닫기는 편집으로 돌아가고 나가기는 이탈 콜백을 불러요', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<UnsavedChangesModal open onConfirm={onConfirm} onCancel={onCancel} />);
    expect(
      screen.getByRole('heading', { name: '저장하지 않은 변경 사항이 있어요. 페이지를 나갈까요?' }),
    ).toBeVisible();
    const close = screen.getAllByRole('button', { name: '닫기' })[0];
    if (!close) throw new Error('닫기 버튼 없음');
    await user.click(close);
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: '나가기' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
  it('전달한 안내 문구를 보존해요', () => {
    renderWithProviders(
      <UnsavedChangesModal
        open
        message="특수한 이탈 안내"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByRole('heading', { name: '특수한 이탈 안내' })).toBeVisible();
  });
});
