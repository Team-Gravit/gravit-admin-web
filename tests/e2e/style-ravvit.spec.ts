import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('gravit_admin_session', 'true'));
});

test('추천은 초안만 채우고 완성 답변·원문 복사·history·재생성을 유지해요', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const bodies: unknown[] = [];
  page.on('request', (request) => { if (request.method() === 'POST' && new URL(request.url()).pathname.endsWith('/chat')) bodies.push(request.postDataJSON()); });
  await page.goto('/ravvit');
  const input = page.getByRole('textbox');
  await page.getByRole('button', { name: '마감이 다가오는 작업 알려줘' }).click();
  await expect(input).toHaveValue('마감이 다가오는 작업 알려줘');
  await expect(input).toBeFocused();
  expect(bodies).toHaveLength(0);
  await input.press('Enter');
  await expect(page.getByText('마지막 문장: ANSWER_COMPLETE')).toBeVisible();
  await expect(page.getByRole('button', { name: '복사', exact: true })).toBeEnabled();
  await expect(page.getByRole('cell', { name: '원문_CODE', exact: true })).toBeVisible();
  await expect(page.getByText('search_mock', { exact: false })).toHaveCount(0);
  await page.getByRole('button', { name: '도구 1회 호출' }).click();
  await expect(page.getByText('search_mock({"query":"원문_CODE"})')).toBeVisible();
  const link = page.getByRole('link', { name: '확인 문서' });
  await expect(link).toHaveAttribute('target', '_blank');
  await page.getByRole('button', { name: '복사', exact: true }).click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain('## 목 답변');
  expect(copied).toContain('```ts');
  expect(copied).toContain('ANSWER_COMPLETE');
  expect(bodies[0]).toEqual({ question: '마감이 다가오는 작업 알려줘', history: [] });
  await input.fill('두 번째 원문_CODE');
  await input.press('Enter');
  await expect(page.getByRole('button', { name: '복사', exact: true })).toHaveCount(2);
  const history = ['OPAQUE_MOCK_CONTEXT', { nested: ['원문_CODE', 1, null] }];
  expect(bodies[1]).toEqual({ question: '두 번째 원문_CODE', history });
  await expect(page.getByRole('button', { name: '다시 생성', exact: true })).toHaveCount(1);
  await page.getByRole('button', { name: '다시 생성', exact: true }).click();
  await expect(page.getByRole('button', { name: '다시 생성', exact: true })).toBeEnabled();
  expect(bodies[2]).toEqual(bodies[1]);
  await page.getByRole('link', { name: '유저 관리', exact: true }).click();
  await page.getByRole('link', { name: 'Ravvit', exact: true }).click();
  await expect(page.getByRole('button', { name: '복사', exact: true })).toHaveCount(2);
  expect(await page.evaluate(() => Object.values(localStorage).join(' '))).not.toContain('OPAQUE_MOCK_CONTEXT');
  await page.getByRole('button', { name: '새 채팅', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: '새 채팅 시작하기', exact: true }).click();
  await expect(page.getByRole('button', { name: '복사', exact: true })).toHaveCount(0);
  await input.fill('새 질문'); await input.press('Enter');
  await expect(page.getByText('마지막 문장: ANSWER_COMPLETE')).toBeVisible();
  expect(bodies[3]).toEqual({ question: '새 질문', history: [] });
  await page.reload();
  await expect(input).toBeEnabled();
  await expect(page.getByRole('button', { name: '새 채팅', exact: true })).toHaveCount(0);
});

test('대기 중 메뉴를 옮겨도 SSE를 유지하고 복귀 후 답변을 읽어요', async ({ page }) => {
  await page.goto('/ravvit');
  const input = page.getByRole('textbox');
  await expect(input).toBeEnabled(); await input.fill('[목] 느린 답변'); await input.press('Enter');
  await expect(page.getByText('답변을 만들고 있어요…')).toBeVisible();
  await expect(input).toBeDisabled();
  await page.getByRole('link', { name: '유저 관리', exact: true }).click();
  await page.getByRole('link', { name: 'Ravvit', exact: true }).click();
  await expect(page.getByText('마지막 문장: ANSWER_COMPLETE')).toBeVisible();
  await expect(input).toBeEnabled();
});

test('중단은 누적 로그를 남기고 입력을 복원하며 history를 갱신하지 않아요', async ({ page }) => {
  const bodies: unknown[] = [];
  page.on('request', (request) => { if (request.method() === 'POST' && new URL(request.url()).pathname.endsWith('/chat')) bodies.push(request.postDataJSON()); });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/ravvit');
  const input = page.getByRole('textbox');
  await expect(input).toBeEnabled(); await input.fill('[목] 대기'); await input.press('Enter');
  await expect(page.getByText('search_mock({"query":"원문_CODE"})')).toBeVisible();
  await expect.poll(() => page.locator('main').evaluate((element) => element.getAnimations({ subtree: true }).filter((animation) => animation.playState === 'running').length)).toBe(0);
  await page.getByRole('button', { name: '응답 중단' }).click();
  await expect(page.getByText('응답을 중단했어요.')).toBeVisible();
  await expect(input).toBeEnabled();
  await expect(page.getByRole('button', { name: '도구 1회 호출' })).toBeVisible();
  await expect(page.getByText('search_mock({"query":"원문_CODE"})')).toHaveCount(0);
  await input.fill('중단 뒤 질문'); await input.press('Enter');
  await expect(page.getByText('마지막 문장: ANSWER_COMPLETE')).toBeVisible();
  expect(bodies[1]).toEqual({ question: '중단 뒤 질문', history: [] });
});

test('서버 오류는 원문이며 재시도는 같은 질문과 history를 보내요', async ({ page }) => {
  const bodies: unknown[] = [];
  page.on('request', (request) => { if (request.method() === 'POST' && new URL(request.url()).pathname.endsWith('/chat')) bodies.push(request.postDataJSON()); });
  await page.goto('/ravvit');
  const input = page.getByRole('textbox');
  await expect(input).toBeEnabled(); await input.fill('[목] 오류'); await input.press('Enter');
  await expect(page.getByText('RAW_ERROR_CODE: 원문 오류예요.')).toBeVisible();
  await page.getByRole('button', { name: '다시 시도하기', exact: true }).click();
  await expect(page.getByRole('button', { name: '다시 시도하기', exact: true })).toBeEnabled();
  expect(bodies).toHaveLength(2); expect(bodies[1]).toEqual(bodies[0]);
  await expect(input).toBeEnabled();
});

for (const status of [403, 503]) {
  test(`HTTP ${status} 배너와 잠금은 기존 인증 의미를 유지해요`, async ({ page }) => {
    await page.goto('/ravvit');
    const input = page.getByRole('textbox'); await expect(input).toBeEnabled();
    await page.evaluate((code) => {
      const fetch = window.fetch;
      window.fetch = (url, options) => String(url).endsWith('/chat') ? Promise.resolve(new Response(null, { status: code })) : fetch(url, options);
    }, status);
    await input.fill('권한 확인'); await input.press('Enter');
    await expect(page.getByText(status === 403 ? 'Ravvit 사용 권한이 없어요. 관리자에게 문의해 주세요.' : '인증 서버에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.')).toBeVisible();
    await expect(input).toBeDisabled();
    await expect(page.getByRole('button', { name: '다시 확인', exact: true })).toHaveCount(status === 403 ? 0 : 1);
    expect(await page.evaluate(() => localStorage.getItem('gravit_admin_session'))).toBe('true');
  });
}

test('위로 읽는 동안 새 답변이 와도 끌어내리지 않고 맨 아래에서 추종을 재개해요', async ({ page }) => {
  await page.goto('/ravvit'); const input = page.getByRole('textbox'); await expect(input).toBeEnabled();
  await input.fill('[목] 긴 답변'); await input.press('Enter');
  await expect(page.getByText('LONG_ANSWER_COMPLETE')).toBeVisible();
  const scroll = page.locator('main div.overflow-y-auto');
  await scroll.evaluate((element) => { element.scrollTop = 0; element.dispatchEvent(new Event('scroll', { bubbles: true })); });
  await expect(page.getByRole('button', { name: '맨 아래로' })).toBeVisible();
  await input.fill('다음 질문'); await input.press('Enter');
  await expect(page.getByRole('button', { name: '복사', exact: true })).toHaveCount(2);
  expect(await scroll.evaluate((element) => element.scrollTop)).toBeLessThanOrEqual(1);
  await page.getByRole('button', { name: '맨 아래로' }).click();
  await expect(page.getByRole('button', { name: '맨 아래로' })).toHaveCount(0);
  expect(await scroll.evaluate((element) => element.scrollHeight - element.scrollTop - element.clientHeight)).toBeLessThan(24);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});
