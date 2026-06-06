import { test, expect } from '@playwright/test';

/**
 * 최고위험 흐름 S1 (04 §11-8): 비로그인 상태로 보호 라우트 접근 → /login 리다이렉트.
 * 토큰 미주입 → protectedLoader(refreshToken 부재)가 redirect.
 */
test('비로그인 상태로 / 접근 시 /login 으로 리다이렉트된다', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/login$/);
});
