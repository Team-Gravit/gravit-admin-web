import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('gravit_admin_session', 'true'));
});

test('로그아웃 확인을 닫거나 Escape로 나와도 세션과 화면을 유지한다', async ({ page }) => {
  await page.goto('/users/1001');
  await page.getByRole('button', { name: '로그아웃', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: '로그아웃할까요?' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: '닫기', exact: true }).first().click();
  await expect(dialog).toBeHidden();
  await page.getByRole('button', { name: '로그아웃', exact: true }).click();
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: '닫기', exact: true }).first()).toBeFocused();
  await expect
    .poll(() =>
      dialog.evaluate((element) =>
        element.getAnimations().some((animation) => animation.playState === 'running'),
      ),
    )
    .toBe(false);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/\/users\/1001$/);
  await expect(page.getByRole('heading', { name: '유저 상세' })).toBeVisible();
});

test('키보드로 역할 메뉴를 탐색하고 Escape로 나와도 값을 유지한다', async ({ page }) => {
  await page.goto('/users/1001');
  const role = page.getByRole('combobox').first();
  await role.focus();
  await page.keyboard.press('ArrowDown');
  const current = page.getByRole('option', { name: '일반', exact: true });
  await expect(current).toBeFocused();
  await page.keyboard.press('ArrowUp');
  await expect(page.getByRole('option', { name: '관리자', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('listbox')).toBeHidden();
  await expect(role).toHaveText('일반');
  await expect(role).toBeFocused();
});

test('strict-match는 닫고 다시 열면 정확 일치 입력을 초기화한다', async ({ page }) => {
  const label = '2026-04-25-update';
  await page.goto(`/staging/labels/${label}`);
  await page.getByRole('button', { name: '반영 완료 처리' }).click();
  const dialog = page.getByRole('dialog');
  const input = dialog.getByRole('textbox');
  const confirm = dialog.getByRole('button', { name: '반영', exact: true });
  await input.fill(label + ' ');
  await expect(confirm).toBeDisabled();
  await input.fill(label);
  await expect(confirm).toBeEnabled();
  await dialog.getByRole('button', { name: '닫기', exact: true }).first().click();
  await expect(dialog).toBeHidden();
  await page.getByRole('button', { name: '반영 완료 처리' }).click();
  await expect(input).toHaveValue('');
  await expect(confirm).toBeDisabled();
});

test('미저장 확인을 닫으면 편집 중인 원문을 보존한다', async ({ page }) => {
  await page.goto('/notices/1');
  await page.getByRole('button', { name: '편집', exact: true }).click();
  await page.getByLabel('제목', { exact: false }).fill('검증용 제목 CODE_01');
  await page.getByRole('link', { name: '유저 관리', exact: true }).click();
  const dialog = page.getByRole('dialog', {
    name: '저장하지 않은 변경 사항이 있어요. 페이지를 나갈까요?',
  });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: '닫기', exact: true }).first().click();
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/\/notices\/1$/);
  await expect(page.getByLabel('제목', { exact: false })).toHaveValue('검증용 제목 CODE_01');
});
