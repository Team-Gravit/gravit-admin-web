import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { renderWithProviders } from '@/test/render';
import { MarkdownEditor } from '@/shared/components/markdown/MarkdownEditor';

function Example() {
  const { register, watch } = useForm({ defaultValues: { content: '' } });
  return (
    <>
      <label htmlFor="body">본문</label>
      <MarkdownEditor id="body" registration={register('content')} value={watch('content')} />
    </>
  );
}
describe('MarkdownEditor', () => {
  it('빈 미리보기는 해요체로 안내하고 모드 전환 뒤 입력값을 보존해요', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Example />);
    await user.click(screen.getByRole('button', { name: '미리보기' }));
    expect(screen.getByText('표시할 내용이 없어요.')).toBeVisible();
    await user.click(screen.getByRole('button', { name: '작성' }));
    await user.type(screen.getByRole('textbox', { name: '본문' }), '# 테스트 본문');
    await user.click(screen.getByRole('button', { name: '미리보기' }));
    expect(screen.getByRole('heading', { name: '테스트 본문' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: '작성' }));
    expect(screen.getByRole('textbox', { name: '본문' })).toHaveValue('# 테스트 본문');
  });
});
