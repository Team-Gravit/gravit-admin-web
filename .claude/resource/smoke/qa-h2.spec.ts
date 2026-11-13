import { expect, test, type Page } from '@playwright/test';

const group = (page: Page) => page.getByRole('region', { name: 'ACC-01 로그인', exact: true });
const recollect = (page: Page) =>
  page.getByRole('dialog', { name: '명세를 다시 수집할까요?', exact: true });
const generation = (page: Page) =>
  page.getByRole('listitem', { name: '체크리스트 생성 현재 단계', exact: true });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('gravit_admin_session', 'true'));
});

for (const lastDecision of ['승인', '거절']) {
  test(`K-11 마지막 ${lastDecision} 뒤 새로고침 없이 체크리스트 생성으로 전환한다`, async ({
    page,
  }) => {
    await page.goto('/qa/sprints/6/setup');
    await page
      .getByRole('article', { name: 'G-APP 반영 제안' })
      .getByRole('button', { name: '거절', exact: true })
      .click();
    await expect(page.getByText('승인 대기 1건')).toBeVisible();
    const detail = page.waitForResponse(
      (response) => response.url().endsWith('/qa-api/sprints/6') && response.status() === 200,
    );
    await page
      .getByRole('article', { name: 'ACC-01 반영 제안' })
      .getByRole('button', { name: lastDecision, exact: true })
      .click();
    const sprint = await (await detail).json();
    expect(sprint).toMatchObject({
      status: 'CHECKLIST',
      pendingReflectionCount: 0,
      latestJob: { type: 'QA_PREPARE' },
    });
    expect(sprint.setupSteps[1].status).toBe('DONE');
    await expect(generation(page)).toBeVisible();
    await expect(page.getByRole('button', { name: '다시 수집', exact: true })).toHaveCount(0);
    await expect(page).toHaveURL('/qa/sprints/6/setup');
  });
}

for (const scenario of ['recollect-conflict', 'recollect-error']) {
  test(`K-11 재수집 ${scenario} 오류도 확인창을 닫는다`, async ({ page }) => {
    await page.goto(`/qa/sprints/6/setup?qaMock=${scenario}`);
    await page.getByRole('button', { name: '다시 수집', exact: true }).click();
    await recollect(page).getByRole('button', { name: '다시 수집', exact: true }).click();
    await expect(
      page.getByText(
        scenario === 'recollect-conflict'
          ? '현재 상태에서는 요청을 처리할 수 없습니다.'
          : '준비 작업을 시작하지 못했습니다.',
        { exact: true },
      ),
    ).toBeVisible();
    await expect(recollect(page)).toHaveCount(0);
    await expect(page.getByRole('button', { name: '다시 수집', exact: true })).toBeEnabled();
  });
}

test('K-11 마지막 승인 응답으로 waiting이 풀리면 열어 둔 재수집 창을 닫는다', async ({ page }) => {
  await page.goto('/qa/sprints/6/setup?qaMock=reflection-delay');
  await page
    .getByRole('article', { name: 'G-APP 반영 제안' })
    .getByRole('button', { name: '거절', exact: true })
    .click();
  await expect(page.getByText('승인 대기 1건')).toBeVisible();
  await page
    .getByRole('article', { name: 'ACC-01 반영 제안' })
    .getByRole('button', { name: '승인', exact: true })
    .click();
  await page.getByRole('button', { name: '다시 수집', exact: true }).click();
  await expect(recollect(page)).toBeVisible();
  await expect(recollect(page)).toHaveCount(0);
  await expect(generation(page)).toBeVisible();
});

for (const id of [7, 6, 5, 4, 3]) {
  test(`K-12 검수 전 스프린트 ${id}의 셀은 클릭·키보드 메뉴를 차단한다`, async ({ page }) => {
    await page.goto(`/qa/sprints/${id}/checklist/2?qaMock=pre-review-cells`);
    const cell = group(page)
      .getByRole('row', { name: '로그인 버튼 동작', exact: true })
      .getByRole('button', { name: 'Web Pass — 변경 이력', exact: true });
    await cell.hover();
    await expect(page.getByRole('tooltip')).toHaveText('1차 검수가 끝난 뒤 변경할 수 있습니다.');
    // aria-disabled communicates the lock while allowing the hover explanation.
    await cell.click({ force: true });
    await expect(page.getByRole('menu')).toHaveCount(0);
    await cell.focus();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Space');
    await expect(page.getByRole('menu')).toHaveCount(0);
  });
}

test('K-12 해당 없음 셀의 기존 이력 메뉴를 유지한다', async ({ page }) => {
  await page.goto('/qa/sprints/2/checklist/1');
  const locked = group(page).getByRole('button', {
    name: 'Server 해당 없음 — 변경 이력',
    exact: true,
  });
  await locked.click();
  await expect(page.getByRole('menuitemcheckbox')).toHaveCount(0);
  await page.getByRole('menuitem', { name: '변경 이력', exact: true }).click();
  await expect(page.getByRole('dialog', { name: '변경 이력', exact: true })).toBeVisible();
});

test('K-8 범례는 호버·포커스·클릭으로 바로 열리고 Esc로 닫힌다', async ({ page }) => {
  await page.goto('/qa/sprints/2/checklist/1');
  const trigger = page.getByRole('button', { name: '상태 아이콘 안내', exact: true });
  const legend = page.getByRole('dialog', { name: '상태 아이콘 안내', exact: true });
  await trigger.hover();
  await expect(legend).toBeVisible();
  await expect(page.getByRole('tooltip')).toHaveCount(0);
  await legend.hover();
  await expect(legend).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(legend).toHaveCount(0);
  await page.getByRole('link', { name: '연결 현황', exact: true }).focus();
  await trigger.focus();
  await expect(legend).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(legend).toHaveCount(0);
  await trigger.click();
  await expect(legend).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(legend).toHaveCount(0);
});

test('K-9·K-10 Pass·Fail은 툴팁이 없고 미검수는 캡션·최소 여백을 쓴다', async ({ page }) => {
  await page.goto('/qa/sprints/2/checklist/1');
  for (const label of ['Web Pass — 변경', 'Web Fail — 변경']) {
    await group(page).getByRole('button', { name: label, exact: true }).hover();
    await expect(page.getByRole('tooltip')).toHaveCount(0);
  }
  await group(page).getByRole('button', { name: 'Web 미검수 — 변경', exact: true }).hover();
  const tooltip = page.getByRole('tooltip');
  await expect(tooltip).toHaveText('미검수');
  const visibleContent = page.locator('[data-radix-popper-content-wrapper] > div');
  await expect(visibleContent).toHaveCSS('padding', '4px');
  await expect(visibleContent.locator('> span.block')).toHaveCSS('font-size', '12px');
  await page.goto('/qa/sprints/2/design-review?qaMock=auto-fail');
  await group(page).getByRole('button', { name: 'Web Fail — 변경', exact: true }).hover();
  await expect(page.getByRole('tooltip')).toHaveCount(0);
});

test('K-8 호버 닫힘은 기존 포커스를 보존하고 Tab은 다음 컨트롤로 이동한다', async ({ page }) => {
  await page.goto('/qa/sprints/2/checklist/1');
  const filter = page.getByRole('combobox');
  const trigger = page.getByRole('button', { name: '상태 아이콘 안내', exact: true });
  const legend = page.getByRole('dialog', { name: '상태 아이콘 안내', exact: true });
  await filter.focus();
  await trigger.hover();
  await expect(legend).toBeVisible();
  await page.getByRole('heading', { name: '2th Agile', exact: true }).hover();
  await expect(legend).toHaveCount(0);
  await expect(filter).toBeFocused();
  await trigger.focus();
  await expect(legend).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(legend).toHaveCount(0);
  await expect(trigger).not.toBeFocused();
});
