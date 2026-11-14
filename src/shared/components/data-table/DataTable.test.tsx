import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/render';
import { DataTable } from '@/shared/components/data-table/DataTable';

const columns = [{ key: 'id', header: 'ID', cell: (row: { id: string }) => row.id }];
const rowKey = (row: { id: string }) => row.id;
describe('DataTable', () => {
  it('빈 데이터면 기본 해요체 문구를 보여줘요', () => {
    renderWithProviders(<DataTable columns={columns} data={[]} rowKey={rowKey} />);
    expect(screen.getByText('표시할 데이터가 없어요.')).toBeVisible();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
  it('오류는 빈 상태보다 먼저 보여주며 전달 문구를 보존해요', () => {
    renderWithProviders(
      <DataTable columns={columns} data={[]} rowKey={rowKey} isError errorMessage="원문 오류" />,
    );
    expect(screen.getByText('원문 오류')).toBeVisible();
    expect(screen.queryByText('표시할 데이터가 없어요.')).not.toBeInTheDocument();
  });
  it('로딩은 오류와 데이터보다 먼저 보여줘요', () => {
    renderWithProviders(
      <DataTable
        columns={columns}
        data={[{ id: 'CODE_01' }]}
        rowKey={rowKey}
        isLoading
        isError
        errorMessage="원문 오류"
      />,
    );
    expect(screen.queryByText('원문 오류')).not.toBeInTheDocument();
    expect(screen.queryByText('CODE_01')).not.toBeInTheDocument();
  });
  it('전달한 빈 상태 문구와 행동을 보존해요', () => {
    renderWithProviders(
      <DataTable
        columns={columns}
        data={[]}
        rowKey={rowKey}
        emptyMessage="고유한 빈 상태"
        emptyAction={<button>등록하기</button>}
      />,
    );
    expect(screen.getByText('고유한 빈 상태')).toBeVisible();
    expect(screen.getByRole('button', { name: '등록하기' })).toBeVisible();
  });
  it('정상 데이터 원문과 행 클릭 콜백을 보존해요', async () => {
    const onRowClick = vi.fn();
    const row = { id: 'CODE_01' };
    renderWithProviders(
      <DataTable columns={columns} data={[row]} rowKey={rowKey} onRowClick={onRowClick} />,
    );
    await userEvent.setup().click(screen.getByRole('cell', { name: 'CODE_01' }));
    expect(onRowClick).toHaveBeenCalledWith(row);
  });
});
