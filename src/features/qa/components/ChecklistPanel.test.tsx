import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/render';
import { ChecklistPanel } from '@/features/qa/components/ChecklistPanel';
import { buildFixture, checklistResponse } from '@/mocks/qaChecklist';
import type { Checklist, Sprint } from '@/features/qa/schemas';

interface View {
  data?: Checklist;
  isLoading: boolean;
  isError: boolean;
  error?: Error;
  refetch: () => void;
}
const view = vi.hoisted((): View => ({ isLoading: false, isError: false, refetch: vi.fn() }));
vi.mock('@/features/qa/queries', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/qa/queries')>()),
  useChecklist: () => view,
}));
// Gauge rendering has its own first-render/empty-data contract tests.
vi.mock('@/features/qa/components/ProgressGauges', () => ({ ProgressGauges: () => null }));
const sprint: Sprint = {
  id: 2,
  sprintKey: '2th Agile',
  summary: null,
  status: 'MANUAL_REVIEW',
  version: 1,
  connections: [],
  progress: [],
  setupSteps: [],
  latestJob: null,
  pendingReflectionCount: 0,
};

beforeEach(() => {
  view.data = checklistResponse(2, 'MANUAL_REVIEW', buildFixture(2), 1);
  view.isLoading = false;
  view.isError = false;
  view.error = undefined;
  vi.mocked(view.refetch).mockClear();
});
describe('ChecklistPanel', () => {
  it('정상 항목의 원문과 새 이동 행동을 보여줘요', () => {
    renderWithProviders(<ChecklistPanel sprint={sprint} round={1} />);
    expect(screen.getByRole('button', { name: '다음 미검수로 이동' })).toBeEnabled();
    expect(screen.getAllByText('입력한 계정으로 로그인하면 학습 홈으로 이동합니다.')).toHaveLength(
      2,
    );
    expect(screen.getAllByRole('button', { name: '수정' })).toHaveLength(6);
    expect(screen.getAllByRole('button', { name: '삭제' })).toHaveLength(6);
  });
  it('빈 체크리스트면 해요체 안내와 비활성 이동을 보여줘요', () => {
    view.data = { sprintId: 2, sprintStatus: 'MANUAL_REVIEW', features: [] };
    renderWithProviders(<ChecklistPanel sprint={sprint} round={1} />);
    expect(screen.getByText('아직 생성된 항목이 없어요.')).toBeVisible();
    expect(screen.getByRole('button', { name: '다음 미검수로 이동' })).toBeDisabled();
  });
  it('오류면 기존 재시도 콜백을 연결해요', async () => {
    view.isError = true;
    view.error = new Error('mock');
    renderWithProviders(<ChecklistPanel sprint={sprint} round={1} />);
    await userEvent.setup().click(screen.getByRole('button', { name: '다시 시도하기' }));
    expect(view.refetch).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
  it('로딩이면 오류나 빈 안내 및 기존 항목을 먼저 보여주지 않아요', () => {
    view.isLoading = true;
    view.isError = true;
    renderWithProviders(<ChecklistPanel sprint={sprint} round={1} />);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '다시 시도하기' })).not.toBeInTheDocument();
    expect(screen.queryByText('아직 생성된 항목이 없어요.')).not.toBeInTheDocument();
  });
});
