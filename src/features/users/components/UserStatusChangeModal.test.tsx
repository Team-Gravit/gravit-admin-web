import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/render';
import {
  UserStatusChangeModal,
  type UserChange,
} from '@/features/users/components/UserStatusChangeModal';

const cases: Array<{ change: UserChange; title: string; action: string; value: string }> = [
  {
    change: { kind: 'status', value: 'ACTIVE' },
    title: '유저 상태를 바꿀까요?',
    action: '상태 변경하기',
    value: 'ACTIVE',
  },
  {
    change: { kind: 'status', value: 'SUSPENDED' },
    title: '유저 상태를 바꿀까요?',
    action: '상태 변경하기',
    value: 'SUSPENDED',
  },
  {
    change: { kind: 'status', value: 'DELETED' },
    title: '유저를 삭제 처리할까요?',
    action: '삭제 처리하기',
    value: 'DELETED',
  },
  {
    change: { kind: 'role', value: 'ADMIN' },
    title: '관리자 권한을 부여할까요?',
    action: '권한 부여하기',
    value: '모든 운영 권한을 사용할 수 있어요.',
  },
  {
    change: { kind: 'role', value: 'USER' },
    title: '관리자 권한을 회수할까요?',
    action: '권한 회수하기',
    value: '관리자 권한을 회수해요.',
  },
];

describe('UserStatusChangeModal', () => {
  it.each(cases)(
    '$action 확인 전에는 요청하지 않고 대상 원문을 보존해요 ($value)',
    async ({ change, title, action, value }) => {
      const onConfirm = vi.fn();
      renderWithProviders(
        <UserStatusChangeModal
          open
          change={change}
          nickname="검증_CODE_01"
          handle="raw_handle"
          onConfirm={onConfirm}
          onCancel={vi.fn()}
        />,
      );
      expect(screen.getByRole('dialog', { name: title })).toHaveTextContent(
        '검증_CODE_01 (@raw_handle)',
      );
      expect(screen.getByRole('dialog')).toHaveTextContent(value);
      expect(onConfirm).not.toHaveBeenCalled();
      await userEvent.setup().click(screen.getByRole('button', { name: action }));
      expect(onConfirm).toHaveBeenCalledTimes(1);
    },
  );

  it('닫기를 누르면 확인 없이 원래 취소 콜백을 불러요', async () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    renderWithProviders(
      <UserStatusChangeModal
        open
        change={{ kind: 'role', value: 'ADMIN' }}
        nickname="이름"
        handle={null}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );
    await userEvent.setup().click(screen.getAllByRole('button', { name: '닫기' })[0]!);
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('처리 중에는 확인과 하단 닫기를 막고 삭제 주의를 유지해요', () => {
    renderWithProviders(
      <UserStatusChangeModal
        open
        loading
        change={{ kind: 'status', value: 'DELETED' }}
        nickname="이름"
        handle={null}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: '삭제 처리하기' })).toBeDisabled();
    expect(
      screen
        .getAllByRole('button', { name: '닫기' })
        .some((button) => button.hasAttribute('disabled')),
    ).toBe(true);
    expect(screen.getByRole('dialog')).toHaveTextContent('이 작업은 되돌리기 어려워요.');
  });
});
