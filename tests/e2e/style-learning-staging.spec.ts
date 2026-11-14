import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('gravit_admin_session', 'true'));
});

test('챕터 편집은 원문 설명과 기존 요청 필드를 보존한다', async ({ page }) => {
  await page.goto('/chapters/1');
  await page.getByRole('button', { name: '편집', exact: true }).click();
  const description = await page.getByLabel('설명').inputValue();
  await page.getByLabel('제목', { exact: false }).fill('수정_CODE');
  const sent = page.waitForRequest(
    (request) => request.method() === 'PATCH' && request.url().endsWith('/chapters/1'),
  );
  await page.getByRole('button', { name: '저장하기', exact: true }).click();
  expect((await sent).postDataJSON()).toEqual({ title: '수정_CODE', description });
  await expect(page.getByRole('button', { name: '편집', exact: true })).toBeVisible();
  await expect(page.getByText('저장했어요.', { exact: true })).toBeVisible();
});

test('주관식은 단일 콤마 정답 객체와 원문 해설로 저장한다', async ({ page }) => {
  await page.goto('/problems/513');
  await page.getByRole('button', { name: '편집', exact: true }).click();
  const answer = page.getByLabel('정답 (인정 표기는 콤마로 구분)', { exact: false });
  await expect(answer).toHaveCount(1);
  const explanation = await page.getByLabel('해설', { exact: false }).inputValue();
  await answer.fill('원문, comma_CODE,표기');
  const sent = page.waitForRequest(
    (request) => request.method() === 'PATCH' && request.url().endsWith('/problems/513/subjective'),
  );
  await page.getByRole('button', { name: '저장하기', exact: true }).click();
  const body = (await sent).postDataJSON();
  expect(body.answer).toMatchObject({ content: '원문, comma_CODE,표기', explanation });
  expect(Array.isArray(body.answer)).toBe(false);
  expect(typeof body.answer.answerId).toBe('number');
  expect(body).not.toHaveProperty('answers');
});

test('객관식은 보기4개와 선택한 정답1개를 그대로 전송한다', async ({ page }) => {
  await page.goto('/problems/512');
  await page.getByRole('button', { name: '편집', exact: true }).click();
  const original = await page.getByLabel('본문', { exact: false }).inputValue();
  await expect(page.getByRole('radio')).toHaveCount(4);
  await page.getByRole('radio').nth(1).check();
  const sent = page.waitForRequest(
    (request) => request.method() === 'PATCH' && request.url().endsWith('/problems/512/objective'),
  );
  await page.getByRole('button', { name: '저장하기', exact: true }).click();
  const body = (await sent).postDataJSON();
  expect(body.content).toBe(original);
  expect(body.options).toHaveLength(4);
  expect(body.options.map((option: { isAnswer: boolean }) => option.isAnswer)).toEqual([
    false,
    true,
    false,
    false,
  ]);
});

test('스테이징은 항목을 바꿔도 미저장 입력과 반영 잠금을 유지한다', async ({ page }) => {
  await page.goto('/staging/labels/2026-04-25-update');
  const title = page.locator('#lesson-title');
  await title.fill('미저장_CODE');
  await expect(page.getByRole('button', { name: '반영 완료 처리' })).toBeDisabled();
  const nav = page.getByRole('navigation', { name: '스테이징 항목' });
  await nav.getByRole('button', { name: /문제 3/ }).click();
  await expect(page.locator('#subj-answer-1003')).toHaveValue('0,영,zero');
  await nav.getByRole('button', { name: /레슨/ }).click();
  await expect(title).toHaveValue('미저장_CODE');
  expect(await nav.evaluate((element) => element.getBoundingClientRect().width)).toBe(288);
  await page.getByRole('link', { name: '공지 관리', exact: true }).click();
  const dialog = page.getByRole('dialog', {
    name: '저장하지 않은 항목이 1건 있어요. 페이지를 나갈까요?',
  });
  await dialog.getByRole('button', { name: '닫기', exact: true }).first().click();
  await expect(title).toHaveValue('미저장_CODE');
});

test('스테이징 객관식 정답 변경은 이전·새 옵션을 모두 PATCH한다', async ({ page }) => {
  await page.goto('/staging/labels/2026-04-25-update');
  await page
    .getByRole('navigation', { name: '스테이징 항목' })
    .getByRole('button', { name: /문제 1/ })
    .click();
  await page.getByRole('radio').nth(1).check();
  const previous = page.waitForRequest(
    (request) => request.method() === 'PATCH' && request.url().endsWith('/staging/options/10011'),
  );
  const next = page.waitForRequest(
    (request) => request.method() === 'PATCH' && request.url().endsWith('/staging/options/10012'),
  );
  await page.getByRole('button', { name: '저장하기', exact: true }).click();
  expect((await previous).postDataJSON()).toEqual({ isAnswer: false });
  expect((await next).postDataJSON()).toEqual({ isAnswer: true });
  await expect(page.getByText('저장했어요.', { exact: true })).toBeVisible();
  await expect(page.getByRole('radio').nth(1)).toBeChecked();
  // 정답만 변경한 뒤 dirty가 남는 기존 결함은 T0에서도 재현했어요.
  // 스타일 범위에서 resetField/등록 정책을 바꾸지 않으며 계획서에 별도 기록해요.
});

test('스테이징 부분 실패는 실패한 정답 원문만 다시 저장한다', async ({ page }) => {
  await page.goto('/staging/labels/2026-04-25-update');
  await page
    .getByRole('navigation', { name: '스테이징 항목' })
    .getByRole('button', { name: /문제 3/ })
    .click();
  // 기존 answer PATCH만 브라우저에서 네트워크 오류로 재현한다.
  await page.evaluate(() => {
    const op = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
      const target = new URL(String(url), location.href).pathname;
      if (method === 'PATCH' && target.endsWith('/staging/answers/10031')) {
        this.send = () => {
          queueMicrotask(() => this.onerror?.(new ProgressEvent('error')));
        };
      }
      op.call(this, method, url, true);
    };
  });
  await page.locator('#subj-instruction-1003').fill('성공한 지시문_CODE');
  await page.locator('#subj-answer-1003').fill('실패한,정답_CODE');
  await page.getByRole('button', { name: '저장하기', exact: true }).click();
  await expect(page.getByText('일부 항목만 저장했어요. (1/2 성공)', { exact: true })).toBeVisible();
  await expect(page.locator('#subj-answer-1003')).toHaveValue('실패한,정답_CODE');
  await expect(page.getByRole('button', { name: '반영 완료 처리' })).toBeDisabled();
  let problemRequests = 0;
  page.on('request', (request) => {
    if (request.method() === 'PATCH' && request.url().endsWith('/staging/problems/1003'))
      problemRequests++;
  });
  await page.getByRole('button', { name: '저장하기', exact: true }).click();
  await expect(
    page.getByText('저장하지 못했어요. 다시 시도해 주세요.', { exact: true }),
  ).toBeVisible();
  expect(problemRequests).toBe(0);
  await expect(page.locator('#subj-instruction-1003')).toHaveValue('성공한 지시문_CODE');
  await expect(page.locator('#subj-answer-1003')).toHaveValue('실패한,정답_CODE');
});

test('실제 저장 대기만 표시하고 reduced에서는 회전을 끈다', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/staging/labels/2026-04-25-update');
  await expect(page.locator('#lesson-title')).toBeVisible();
  await page.evaluate(() => {
    const op = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
      if (
        method === 'PATCH' &&
        new URL(String(url), location.href).pathname.endsWith('/staging/lessons/901')
      )
        this.send = () => undefined;
      op.call(this, method, url, true);
    };
  });
  await page.locator('#lesson-title').fill('대기_CODE');
  await page.getByRole('button', { name: '저장하기', exact: true }).click();
  const pending = page.getByRole('button', { name: '저장하고 있어요…', exact: true });
  await expect(pending).toBeDisabled();
  await expect(page.locator('#lesson-title')).toBeDisabled();
  expect(
    await pending.locator('svg').evaluate((element) => getComputedStyle(element).animationName),
  ).toBe('none');
});
