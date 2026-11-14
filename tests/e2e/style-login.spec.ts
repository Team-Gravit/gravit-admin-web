import { expect, test } from '@playwright/test';

for (const width of [1280, 1440]) {
  test(`개편 전 로그인 이미지와 브랜드 버튼을 복원하고 두 열과 56px 높이를 유지해요: ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/login');
    const buttons = page.getByRole('button');
    await expect(buttons).toHaveText(['Google로 시작하기', '카카오로 시작하기', '네이버로 시작하기']);
    for (const button of await buttons.all()) {
      expect((await button.boundingBox())?.height).toBe(56);
      await expect(button.locator('img')).toHaveCount(1);
    }
    await expect(page.locator('.max-w-5xl > div').first().locator('img')).toHaveAttribute('src', /login-illustration/);
    const columns = await page.locator('.max-w-5xl > div').evaluateAll((elements) => elements.map((element) => ({ width: element.getBoundingClientRect().width, y: element.getBoundingClientRect().y })));
    expect(columns).toHaveLength(2);
    expect(columns[0]?.width).toBe(511);
    expect(columns[0]).toEqual(columns[1]);
    await page.keyboard.press('Tab');
    await expect(buttons.first()).toBeFocused();
    await page.goto('/login?error=forbidden');
    await expect(page.getByText('백오피스 접근 권한이 없습니다.')).toBeVisible();
    await page.goto('/login?error=failed');
    await expect(page.getByText('로그인에 실패했습니다. 다시 시도해주세요.')).toBeVisible();
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
