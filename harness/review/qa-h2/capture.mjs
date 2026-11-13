import { chromium, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

// VITE_USE_MOCK=true development server, no real-server writes.
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.addInitScript(() => localStorage.setItem('gravit_admin_session', 'true'));
const root = 'harness/review/qa-h2';
const shot = (name) => `${root}/screenshots/after/${name}.png`;
await page.goto('http://localhost:5173/qa/sprints/2/checklist/1');
const group = () => page.getByRole('region', { name: 'ACC-01 로그인', exact: true });
await group().waitFor();
await page.locator('main header').screenshot({ path: shot('header') });
const metrics = await page.getByRole('navigation', { name: 'QA 탭' }).evaluate((nav) => {
  const link = nav.querySelector('a');
  const steps = document.querySelector('[aria-label="진행 단계"]');
  return {
    navHeight: nav.getBoundingClientRect().height,
    alignItems: getComputedStyle(nav).alignItems,
    linkHeight: link.getBoundingClientRect().height,
    linkPaddingBottom: getComputedStyle(link).paddingBottom,
    legendHeight: nav.querySelector('button').getBoundingClientRect().height,
    legendMarginBottom: getComputedStyle(nav.querySelector('button')).marginBottom,
    stageToNav: nav.getBoundingClientRect().top - steps.getBoundingClientRect().bottom,
  };
});
await page.getByRole('button', { name: '상태 아이콘 안내', exact: true }).hover();
await page.getByRole('dialog', { name: '상태 아이콘 안내' }).screenshot({ path: shot('legend') });
await page.keyboard.press('Escape');
await expect(page.getByRole('dialog')).toHaveCount(0);
await group().getByRole('row', { name: '로그인 버튼 동작', exact: true }).getByRole('button', { name: 'Web Pass — 변경', exact: true }).hover();
await expect(page.getByRole('tooltip')).toHaveCount(0);
await page.screenshot({ path: shot('pass-tooltip') });
await page.goto('http://localhost:5173/qa/sprints/2/design-review');
const missing = page.getByRole('row', { name: 'APP AOS 시안 프레임이 없다', exact: true }).first();
await missing.getByRole('button', { name: 'APP 미검수 — 변경', exact: true }).hover();
await expect(page.getByRole('tooltip')).toHaveText('미검수');
metrics.tooltip = await page.locator('[data-radix-popper-content-wrapper] > div').evaluate((content) => ({ padding: getComputedStyle(content).padding, fontSize: getComputedStyle(content.querySelector('span.block')).fontSize }));
await page.screenshot({ path: shot('design-tooltip') });
await page.goto('http://localhost:5173/qa/sprints/6/setup');
await page.getByRole('article', { name: 'ACC-01 반영 제안' }).getByRole('img').hover();
await expect(page.getByRole('tooltip')).toHaveText('승인 대기');
await page.screenshot({ path: shot('reflection-tooltip') });
await page.goto('http://localhost:5173/qa/sprints');
await page.getByRole('table').waitFor();
await page.getByRole('region', { name: '스프린트 목록', exact: true }).screenshot({ path: shot('list') });
metrics.tableHeader = await page.getByRole('columnheader').first().evaluate((head) => ({ weight: getComputedStyle(head).fontWeight, color: getComputedStyle(head).color, background: getComputedStyle(head.closest('thead')).backgroundColor }));
await writeFile(`${root}/after-metrics.json`, JSON.stringify(metrics, null, 2));
await browser.close();
