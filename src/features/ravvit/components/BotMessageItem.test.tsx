import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/render';
import { BotMessageItem } from '@/features/ravvit/components/BotMessageItem';
import type { BotMessage } from '@/features/ravvit/types';

const message: BotMessage = {
  role: 'assistant', id: 'answer1', status: 'done', toolLogs: [],
  answer: '## 원문 제목\n\n전체 답변 **ANSWER_COMPLETE**', usage: null, errorMessage: null, revealed: false,
};
const callbacks = () => ({ onRegenerate: vi.fn(), onReveal: vi.fn(), onRevealed: vi.fn() });

describe('BotMessageItem', () => {
  it('첫 렌더부터 완성 답변과 액션을 즉시 표시하고 표시 완료를 알려요', () => {
    const handlers = callbacks();
    const { rerender } = renderWithProviders(<BotMessageItem message={message} isLast streaming={false} {...handlers} />);
    expect(screen.getByText('ANSWER_COMPLETE')).toBeVisible();
    expect(screen.getByRole('heading', { name: '원문 제목' })).toBeVisible();
    expect(screen.getByRole('button', { name: '복사' })).toBeEnabled();
    expect(screen.getByRole('button', { name: '다시 생성' })).toBeEnabled();
    expect(handlers.onReveal).toHaveBeenCalledTimes(1);
    expect(handlers.onRevealed).toHaveBeenCalledTimes(1);
    rerender(<BotMessageItem message={{ ...message, revealed: true }} isLast streaming={false} {...handlers} />);
    expect(handlers.onReveal).toHaveBeenCalledTimes(1);
    expect(handlers.onRevealed).toHaveBeenCalledTimes(1);
  });
  it('재진입한 이전 답변은 재생성 없이 원문 복사만 유지해요', async () => {
    const user = userEvent.setup();
    const write = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    const handlers = callbacks();
    renderWithProviders(<BotMessageItem message={{ ...message, revealed: true }} isLast={false} streaming={false} {...handlers} />);
    expect(screen.queryByRole('button', { name: '다시 생성' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '복사' }));
    expect(write).toHaveBeenCalledWith(message.answer);
    expect(handlers.onReveal).not.toHaveBeenCalled();
    write.mockRestore();
  });
  it('대기에는 답변과 복사 대신 실제 대기 안내만 표시해요', () => {
    renderWithProviders(<BotMessageItem message={{ ...message, status: 'pending', answer: null }} isLast streaming {...callbacks()} />);
    expect(screen.getByText('답변을 만들고 있어요…')).toBeVisible();
    expect(screen.queryByRole('button', { name: '복사' })).not.toBeInTheDocument();
    expect(screen.queryByText('ANSWER_COMPLETE')).not.toBeInTheDocument();
  });
  it('서버 오류 원문을 보존하고 같은 재시도 콜백을 호출해요', async () => {
    const handlers = callbacks();
    renderWithProviders(<BotMessageItem message={{ ...message, status: 'error', errorMessage: 'RAW_ERROR_CODE' }} isLast streaming={false} {...handlers} />);
    expect(screen.getByText('RAW_ERROR_CODE')).toBeVisible();
    await userEvent.setup().click(screen.getByRole('button', { name: '다시 시도하기' }));
    expect(handlers.onRegenerate).toHaveBeenCalledTimes(1);
  });
});
