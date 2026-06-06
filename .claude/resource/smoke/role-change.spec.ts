import { test, expect } from '@playwright/test';

/**
 * 최고위험 흐름 S10 (04 §11-8, §10-3): USER_DETAIL 역할 USER→ADMIN 변경 시
 * destructive 확인 모달("관리자 권한을 부여하시겠습니까?") 노출.
 * MSW GET /users/:id 는 role=USER 반환. 모달까지만 검증(실제 PATCH 확인은 별도).
 */
test.beforeEach(async ({ page }) => {
  // auth-stub: protectedLoader 는 refreshToken 존재만 확인(MSW 가 토큰을 검증하지 않음).
  await page.addInitScript(() => {
    localStorage.setItem('gravit_admin_refresh_token', 'e2e-stub-refresh-token');
  });
});

test('역할 USER→ADMIN 변경 시 destructive 확인 모달이 뜬다', async ({ page }) => {
  await page.goto('/users/1001');
  // 첫 번째 combobox = 역할 Select(두 번째는 상태).
  await page.getByRole('combobox').first().click();
  await page.getByRole('option', { name: '관리자' }).click();
  await expect(page.getByText('관리자 권한을 부여하시겠습니까?')).toBeVisible();
});
