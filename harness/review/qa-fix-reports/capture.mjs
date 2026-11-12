// Run against a local VITE_USE_MOCK=true dev server. No live server mutations.
import { chromium, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const output = new URL('./after/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 1080 },
  reducedMotion: 'reduce',
});
await context.addInitScript(() => localStorage.setItem('gravit_admin_session', 'true'));
const page = await context.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const region = () => page.getByRole('region', { name: 'ACC-01 로그인', exact: true });
async function capture(name) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.allSettled(document.getAnimations()
      .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
      .map((animation) => animation.finished));
  });
  await page.screenshot({
    path: new URL(`${name}.png`, output).pathname,
    fullPage: !name.includes('reason') && !name.endsWith('-history'),
  });
}
for (const [name, path] of [['list', '/qa/sprints'], ['empty', '/qa/sprints?qaMock=empty']]) {
  await page.goto(`http://localhost:5173${path}`);
  if (name === 'list') await expect(page.getByRole('row')).toHaveCount(10);
  else await expect(page.getByText('등록된 스프린트가 없습니다.', { exact: false })).toBeVisible();
  await capture(name);
}
for (const name of ['checklist', 'design']) {
  await page.goto(`http://localhost:5173/qa/sprints/2/${name === 'checklist' ? 'checklist/1' : 'design-review'}`);
  const row = region().getByRole('row', { name: name === 'checklist' ? '로그인 버튼 동작' : 'WEB 주요 버튼 배치', exact: true });
  await row.getByRole('button', { name: 'Web Pass — 변경', exact: true }).click();
  await page.getByRole('menuitemcheckbox', { name: 'Fail', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Fail 사유', exact: true });
  await dialog.getByRole('textbox').fill('버튼을 눌러도 다음 화면으로 이동하지 않습니다.\n재현 후 수정해 주세요.');
  await capture(`${name}-reason`);
  await dialog.getByRole('button', { name: 'Fail로 변경', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(row.getByRole('button', { name: 'Web Fail — 변경', exact: true })).toHaveAttribute('aria-busy', 'false');
  await capture(name);
  await row.getByRole('button', { name: 'Web Fail — 변경', exact: true }).click();
  await page.getByRole('menuitem', { name: '변경 이력', exact: true }).click();
  await expect(page.getByRole('dialog', { name: '변경 이력', exact: true })).toContainText('재현 후 수정해 주세요.');
  await capture(`${name}-history`);
  await page.getByRole('dialog', { name: '변경 이력', exact: true }).getByRole('button', { name: '닫기', exact: true }).click();
  await row.getByRole('button', { name: 'Web Fail — 변경', exact: true }).click();
  await expect(page.getByRole('menuitem', { name: 'Fail 사유 수정', exact: true })).toBeVisible();
  await capture(`${name}-reason-menu`);
  await page.getByRole('menuitem', { name: 'Fail 사유 수정', exact: true }).click();
  await expect(dialog.getByRole('textbox')).toHaveValue('버튼을 눌러도 다음 화면으로 이동하지 않습니다.\n재현 후 수정해 주세요.');
  await capture(`${name}-reason-edit`);
  await dialog.getByRole('textbox').fill('가'.repeat(501));
  await dialog.getByRole('button', { name: 'Fail로 변경', exact: true }).click();
  await expect(dialog.getByRole('alert')).toHaveText('사유는 500자까지 입력할 수 있습니다.');
  await capture(`${name}-reason-limit`);
  await dialog.getByRole('button', { name: '취소', exact: true }).click();
}
for (const [name, path, ready] of [
  ['fixes-before-review', '/qa/sprints/7/fix-reports', '아직 검수가 완료되지 않았어요'],
  ['fixes-unchecked', '/qa/sprints/2/fix-reports', '남은 미검수: 디자인 4 · 1차 8 · 2차 8'],
  ['fixes-running', '/qa/sprints/4/fix-reports', '단계 작업이 실행 중입니다. 작업이 끝나면 수정사항을 확인할 수 있습니다.'],
  ['fixes-empty', '/qa/sprints/9/fix-reports', '수정할 항목이 없어요'],
  ['fixes-legacy', '/qa/sprints/2/fix-reports?qaMock=legacy', '대상을 찾을 수 없습니다.'],
]) {
  await page.goto(`http://localhost:5173${path}`);
  await expect(page.getByRole('main').getByText(ready, { exact: true }).first()).toBeVisible();
  await capture(name);
}
await page.goto('http://localhost:5173/qa/sprints/9/checklist/1');
await expect(region()).toBeVisible();
await page.evaluate(async () => {
  async function request(path, body) {
    const response = await fetch(`/qa-api${path}`, {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    if (!response.ok) throw new Error('Mock fixture failed');
  }
  for (const part of ['WEB', 'APP', 'SERVER'])
    await request(`/checklist-items/91000/cells/${part}`, {state:'FAIL',version:0,reason:'버튼 동작을 수정해 주세요.'});
  await request('/design-review-items/93000', {state:'FAIL',version:0,reason:'버튼 배치를 수정해 주세요.'});
});
await page.getByRole('navigation', { name: 'QA 탭' }).getByRole('link', { name: '파트별 수정사항', exact: true }).click();
await expect(page.getByRole('region', { name: '웹 수정사항', exact: true })).toContainText('Fail 1');
await capture('fixes-ready');
await page.setViewportSize({width:1280,height:900});
await capture('fixes-ready-1280');
expect(errors).toEqual([]);
await browser.close();
console.log('Captured 21 after states, including D1/D6 menus, prefilled dialogs, validation and 1280px. No page errors.');
