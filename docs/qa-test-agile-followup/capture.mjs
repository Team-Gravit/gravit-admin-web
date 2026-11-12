import { chromium, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Run against the VITE_USE_MOCK=true development server. Captures contain fixtures only.
const directory = fileURLToPath(new URL('./images/', import.meta.url));
await mkdir(directory, { recursive: true });
const browser = await chromium.launch();
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
    reducedMotion: 'reduce',
  });
  await context.addInitScript(() => localStorage.setItem('gravit_admin_session', 'true'));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const capture = async (name, fullPage = false) => {
    await page.locator('[role="menu"][data-state="closed"]').waitFor({ state: 'detached' });
    return page.screenshot({ path: `${directory}after-${name}.png`, fullPage });
  };
  async function go(path) {
    await page.goto(`http://127.0.0.1:5173${path}`);
    await page.getByRole('navigation', { name: 'QA 탭' }).waitFor();
  }
  for (const [name, path] of [
    ['setup', '/qa/sprints/9/setup'],
    ['setup-failed', '/qa/sprints/8/setup'],
    ['design', '/qa/sprints/2/design-review'],
    ['checklist-1', '/qa/sprints/2/checklist/1'],
    ['checklist-2', '/qa/sprints/2/checklist/2'],
  ]) {
    await go(path);
    await page
      .getByRole('region', {
        name: name.startsWith('setup') ? '연결 상태' : 'ACC-01 로그인',
        exact: true,
      })
      .waitFor();
    if (name === 'setup')
      await expect(page.getByRole('button', { name: 'QA 종료', exact: true })).toBeEnabled();
    await capture(name, true);
  }
  const row = page.getByRole('row', { name: '로그인 버튼 동작', exact: true }).first();
  await row.getByRole('button', { name: 'Web Pass — 변경', exact: true }).click();
  await page.getByRole('menuitem', { name: '변경 이력', exact: true }).click();
  await page.getByRole('dialog').getByText('수동 판정', { exact: false }).waitFor();
  await expect(page.getByRole('dialog')).toHaveCSS('max-width', '768px');
  await capture('cell-history');
  await go('/qa/sprints/2/design-review');
  const design = page.getByRole('row', { name: 'WEB 주요 버튼 배치', exact: true }).first();
  await design.getByRole('button', { name: 'Web Pass — 변경', exact: true }).click();
  await page.getByRole('menuitem', { name: '변경 이력', exact: true }).click();
  await page.getByRole('dialog').getByText('Figma와 화면 명세', { exact: false }).waitFor();
  await capture('design-history');
  await page.getByRole('dialog').getByRole('button', { name: '닫기' }).click();
  await design.getByRole('button', { name: '수정', exact: true }).click();
  await page.getByRole('dialog', { name: '디자인 항목 수정', exact: true }).waitFor();
  await capture('design-edit');
  await page.getByRole('dialog').getByRole('button', { name: '취소', exact: true }).click();
  await page.getByRole('button', { name: '상태 아이콘 안내', exact: true }).click();
  await page.getByRole('dialog', { name: '상태 아이콘 안내' }).waitFor();
  await capture('legend');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'QA 종료', exact: true }).focus();
  await page.getByRole('tooltip').waitFor();
  await capture('close-tooltip');
  await go('/qa/sprints/4/design-review');
  await page.getByText('디자인 검수 중입니다.', { exact: true }).waitFor();
  await capture('running', true);
  await go('/qa/sprints/1/checklist/2');
  await page.getByRole('region', { name: 'ACC-01 로그인', exact: true }).waitFor();
  await capture('closed', true);
  await go('/qa/sprints/2/checklist/1');
  await page
    .getByRole('row', { name: '로그인 버튼 동작', exact: true })
    .first()
    .getByRole('button', { name: 'Web Pass — 변경', exact: true })
    .click();
  await page.getByRole('menuitem', { name: '변경 이력', exact: true }).click();
  await page.getByRole('dialog').getByText('qa-baseline 코드', { exact: false }).waitFor();
  await capture('auto-history');
  expect(errors).toEqual([]);
  console.log('Saved 13 screenshots; no page errors.');
} finally {
  await browser.close();
}
