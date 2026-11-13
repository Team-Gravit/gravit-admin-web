import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CheckCellButton } from '@/features/qa/components/CheckCellButton';
import type { CheckCell, ChecklistItem, SprintStatus } from '@/features/qa/schemas';
import { renderWithProviders } from '@/test/render';

const cell: CheckCell = {
  part: 'WEB',
  state: 'UNCHECKED',
  source: 'MANUAL',
  reason: null,
  evidence: [],
  editable: true,
  version: 3,
};

const item: ChecklistItem = {
  id: 11,
  featureId: 1,
  title: '로그인 버튼을 누르면 홈으로 이동한다',
  expected: '홈 화면이 보인다',
  parts: ['WEB'],
  classification: 'MANUAL',
  origin: 'HUMAN',
  cells: [cell],
  version: 1,
};

function renderCell({
  sprintStatus = 'MANUAL_REVIEW',
  closed = false,
  override = {},
}: { sprintStatus?: SprintStatus; closed?: boolean; override?: Partial<CheckCell> } = {}) {
  return renderWithProviders(
    <CheckCellButton
      sprintId={1}
      round={2}
      item={item}
      cell={{ ...cell, ...override }}
      closed={closed}
      sprintStatus={sprintStatus}
      registerRef={() => {}}
      onFocusCell={() => {}}
    />,
  );
}

describe('CheckCellButton 메뉴', () => {
  it('2차 수동 검수 중 편집 가능한 셀은 판정 3종과 변경 이력을 보여 준다', async () => {
    const user = userEvent.setup();
    renderCell();

    await user.click(screen.getByRole('button', { name: 'Web 미검수 — 변경' }));

    const states = screen.getAllByRole('menuitemcheckbox').map((el) => el.textContent);
    expect(states).toEqual(['미검수', 'Pass', 'Fail']);
    expect(screen.getByRole('menuitemcheckbox', { name: '미검수' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('menuitem', { name: '변경 이력' })).toBeInTheDocument();
  });

  it('종료된 스프린트의 셀은 변경 이력만 보여 준다', async () => {
    const user = userEvent.setup();
    renderCell({ sprintStatus: 'CLOSED', closed: true, override: { state: 'PASS' } });

    await user.click(screen.getByRole('button', { name: 'Web Pass — 변경 이력' }));

    expect(screen.queryAllByRole('menuitemcheckbox')).toHaveLength(0);
    expect(screen.getByRole('menuitem', { name: '변경 이력' })).toBeInTheDocument();
  });

  it('1차 검수가 끝나기 전에는 메뉴를 열지 않는다', async () => {
    const user = userEvent.setup();
    renderCell({ sprintStatus: 'AUTO_REVIEW' });

    const trigger = screen.getByRole('button', { name: 'Web 미검수 — 변경' });
    expect(trigger).toHaveAttribute('aria-disabled', 'true');
    await user.click(trigger);

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
