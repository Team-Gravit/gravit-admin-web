import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('gravit_admin_session', 'true'));
});

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test(`대시보드 집계와 독립 차트를 즉시 읽고 관리 화면으로 이동해요: ${reducedMotion}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });
    const requests: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/api/v1/admin/dashboard/')) requests.push(request.url());
    });
    await page.goto('/');
    const users = page.getByRole('link', { name: /총 유저 수/ });
    await expect(users).toContainText('12,345');
    await expect(page.getByRole('link', { name: /PENDING 라벨/ })).toContainText('8');
    await expect(page.getByRole('link', { name: /미해결 신고/ })).toContainText('24');
    await expect(page.getByRole('heading', { name: 'DAU', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'MAU', exact: true })).toBeVisible();
    await expect(page.locator('.recharts-bar-rectangle')).toHaveCount(12);
    await expect(page.locator('.recharts-area-curve')).toBeVisible();
    await expect(page.getByText('마지막 막대는 이번 달 집계 중이에요. 지난달과 직접 비교할 수 없어요.')).toBeVisible();
    expect(requests).toHaveLength(3);
    expect(requests.every((url) => new URL(url).search === '')).toBe(true);
    const bars = page.locator('.recharts-bar-rectangle path');
    expect(await bars.last().evaluate((element) => getComputedStyle(element).fill)).toBe('rgb(124, 137, 153)');
    expect(await bars.first().evaluate((element) => getComputedStyle(element).fill)).toBe('rgb(89, 102, 119)');
    await bars.last().hover();
    await expect(page.locator('.recharts-tooltip-wrapper').last()).toContainText('(집계 중)');
    await expect(page.locator('.recharts-tooltip-wrapper').last()).toContainText('121');
    await users.click();
    await expect(page).toHaveURL('/users');
  });
}

test('빈 차트도 요약 카드와 독립적으로 표시해요', async ({ page }) => {
  await page.addInitScript(() => {
    const open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
      if (method === 'GET' && String(url).includes('/dashboard/active-users/')) {
        this.send = () => {
          queueMicrotask(() => {
            const raw = JSON.stringify({ points: [] });
            for (const [key, value] of Object.entries({ status: 200, statusText: 'OK', responseText: raw, response: raw, readyState: 4 })) {
              Object.defineProperty(this, key, { configurable: true, value });
            }
            this.onloadend?.(new ProgressEvent('loadend'));
          });
        };
      }
      open.call(this, method, url, true);
    };
  });
  await page.goto('/');
  await expect(page.getByText('아직 집계된 데이터가 없어요.')).toHaveCount(2);
  await expect(page.getByRole('link', { name: /총 유저 수/ })).toContainText('12,345');
});
