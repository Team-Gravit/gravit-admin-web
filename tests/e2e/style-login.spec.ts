import { expect, test } from '@playwright/test';

for (const width of [1280, 1440]) {
  test(`중립 제공자도 같은 두 열과 56px 버튼을 유지해요: ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/login');
    const buttons = page.getByRole('button');
    await expect(buttons).toHaveText(['Google로 시작하기', '카카오로 시작하기', '네이버로 시작하기']);
    for (const button of await buttons.all()) {
      expect((await button.boundingBox())?.height).toBe(56);
      await expect(button.locator('img')).toHaveCount(0);
    }
    const columns = await page.locator('.max-w-5xl > div').evaluateAll((elements) => elements.map((element) => ({ width: element.getBoundingClientRect().width, y: element.getBoundingClientRect().y })));
    expect(columns).toHaveLength(2);
    expect(columns[0]?.width).toBe(511);
    expect(columns[0]).toEqual(columns[1]);
    await page.keyboard.press('Tab');
    await expect(buttons.first()).toBeFocused();
    await page.goto('/login?error=forbidden');
    await expect(page.getByText('백오피스 접근 권한이 없어요.')).toBeVisible();
    await page.goto('/login?error=failed');
    await expect(page.getByText('로그인하지 못했어요. 다시 시도해 주세요.')).toBeVisible();
  });
}

test('로그인 URL을 기다릴 때만 세 제공자를 잠가요', async ({ page }) => {
  await page.goto('/login');
  await page.evaluate(() => {
    const open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
      if (method === 'GET' && String(url).includes('/oauth/login-url/')) this.send = () => undefined;
      open.call(this, method, url, true);
    };
  });
  await page.getByRole('button', { name: 'Google로 시작하기' }).click();
  for (const button of await page.getByRole('button').all()) await expect(button).toBeDisabled();
  await expect(page).toHaveURL('/login');
});
