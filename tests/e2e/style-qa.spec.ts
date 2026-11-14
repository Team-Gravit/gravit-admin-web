import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('gravit_admin_session', 'true'));
});

test('디자인 다음 미검수는 기존 판정 셀로 포커스를 옮긴다', async ({ page }) => {
  await page.goto('/qa/sprints/2/design-review');
  const next = page.getByRole('button', { name: '다음 미검수로 이동', exact: true });
  await expect(next).toBeEnabled();
  const unchecked = page.getByRole('button', { name: /미검수 — 변경$/ }).first();
  await next.click();
  await expect(unchecked).toBeFocused();
  const bounds = await unchecked.boundingBox();
  expect(bounds?.y).toBeGreaterThanOrEqual(56);
  await expect(
    page
      .getByRole('row')
      .filter({ hasText: '주요 버튼 배치' })
      .first()
      .getByRole('button', { name: '수정', exact: true }),
  ).toBeVisible();
});

test('등록 대기와 reduced 상태에서도 입력 원문과 잠금을 유지한다', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/qa/sprints');
  await page.getByRole('button', { name: '스프린트 등록', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: '스프린트 등록', exact: true });
  const input = dialog.getByRole('textbox');
  const raw = 'https://www.notion.so/bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
  await input.fill(raw);
  await page.evaluate(() => {
    const open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
      if (method === 'POST' && new URL(String(url), location.href).pathname === '/qa-api/sprints')
        this.send = () => undefined;
      open.call(this, method, url, true);
    };
  });
  await dialog.getByRole('button', { name: '스프린트 등록하기', exact: true }).click();
  await expect(input).toBeDisabled();
  await expect(input).toHaveValue(raw);
  await expect(dialog.getByRole('button', { name: '스프린트 등록하기' })).toBeDisabled();
  expect(
    await dialog
      .locator('svg.animate-spin')
      .evaluate((element) => getComputedStyle(element).animationName),
  ).toBe('none');
  const close = dialog.getByRole('button', { name: '닫기', exact: true }).first();
  await expect(close).toBeDisabled();
});

test('종료 대기는 기존 미해결 안내와 reduced 잠금을 유지한다', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/qa/sprints/9/checklist/2');
  const action = page.getByRole('button', { name: 'QA 종료', exact: true });
  await expect(action).toHaveAttribute('aria-disabled', 'false');
  await action.click();
  const dialog = page.getByRole('dialog', { name: 'QA를 종료할까요?', exact: true });
  await expect(dialog).toContainText('종료 후에는 판정을 바꿀 수 없어요.');
  await page.evaluate(() => {
    const open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
      if (
        method === 'POST' &&
        new URL(String(url), location.href).pathname.endsWith('/sprints/9/close')
      )
        this.send = () => undefined;
      open.call(this, method, url, true);
    };
  });
  const close = dialog.getByRole('button', { name: 'QA 종료하기', exact: true });
  await close.click();
  await expect(close).toBeDisabled();
  await expect(close).toHaveAttribute('aria-busy', 'true');
  expect(
    await close.locator('svg').evaluate((element) => getComputedStyle(element).animationName),
  ).toBe('none');
  await expect(page).toHaveURL(/\/qa\/sprints\/9\/checklist\/2$/);
});
