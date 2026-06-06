import { expect, test } from '@playwright/test';

/**
 * 최고위험 흐름 S12 + promote (04 §11-8, §10-2-7/§10-2-8): StrictMatch 모달 —
 * 라벨명 오타 시 [반영] 비활성, 정확 입력 시 활성 → promote → 토스트 + 목록 이동.
 * MSW: 2026-04-25-update = PENDING(편집 가능), PATCH status mock 200.
 */
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('gravit_admin_refresh_token', 'e2e-stub-refresh-token');
  });
});

test('promote StrictMatch: 오타 시 [반영] 비활성, 정확 입력 시 반영된다', async ({ page }) => {
  const label = '2026-04-25-update';
  await page.goto(`/staging/labels/${label}`);

  await page.getByRole('button', { name: '반영 완료 처리' }).click();

  const dialog = page.getByRole('dialog');
  const input = dialog.getByRole('textbox');
  const confirm = dialog.getByRole('button', { name: '반영', exact: true });

  await input.fill('2026-04-25-updatX'); // 오타 → 비활성
  await expect(confirm).toBeDisabled();

  await input.fill(label); // 정확 일치 → 활성
  await expect(confirm).toBeEnabled();

  await confirm.click();
  await expect(page.getByText('라벨이 반영되었습니다.')).toBeVisible();
  await expect(page).toHaveURL(/\/staging\/labels$/);
});
