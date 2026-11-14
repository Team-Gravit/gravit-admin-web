import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('gravit_admin_session', 'true'));
});

for (const status of ['DRAFT', 'PUBLISHED'] as const) {
  test(`공지 ${status} 작성은 기존 원문과 상태를 전송한다`, async ({ page }) => {
    await page.goto('/notices/new');
    await page.getByLabel('제목', { exact: false }).fill('제목_CODE_01');
    await page.getByLabel('요약', { exact: false }).fill('원문 요약');
    await page.getByLabel('본문', { exact: false }).fill('# 원문\n**Markdown_CODE**');
    await page.getByRole('checkbox', { name: '상단 고정' }).check();
    const sent = page.waitForRequest(
      (request) =>
        request.method() === 'POST' && new URL(request.url()).pathname.endsWith('/notices'),
    );
    await page
      .getByRole('button', {
        name: status === 'DRAFT' ? '임시 저장하기' : '공지 게시하기',
        exact: true,
      })
      .click();
    expect((await sent).postDataJSON()).toEqual({
      title: '제목_CODE_01',
      summary: '원문 요약',
      content: '# 원문\n**Markdown_CODE**',
      pinned: true,
      status,
    });
    await expect(page).toHaveURL(/\/notices$/);
    await expect(
      page.getByText(status === 'DRAFT' ? '임시 저장했어요.' : '공지를 게시했어요.', {
        exact: true,
      }),
    ).toBeVisible();
  });
}

test('공지의 필수 검증과 입력 중 이탈 확인을 유지한다', async ({ page }) => {
  await page.goto('/notices/new');
  let posts = 0;
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().includes('/admin/notices')) posts++;
  });
  await page.getByRole('button', { name: '공지 게시하기', exact: true }).click();
  for (const field of ['제목', '요약', '본문'])
    await expect(page.getByText(`${field}을 입력해 주세요.`, { exact: true })).toBeVisible();
  expect(posts).toBe(0);
  await page.getByLabel('제목', { exact: false }).fill('저장하지 않은_CODE');
  await page.getByRole('button', { name: '목록으로', exact: true }).click();
  const dialog = page.getByRole('dialog', {
    name: '저장하지 않은 변경 사항이 있어요. 페이지를 나갈까요?',
  });
  await dialog.getByRole('button', { name: '닫기', exact: true }).first().click();
  await expect(page.getByLabel('제목', { exact: false })).toHaveValue('저장하지 않은_CODE');
  await expect(page).toHaveURL(/\/notices\/new$/);
});

test('공지 편집 저장은 본문과 기존 상태를 보존한다', async ({ page }) => {
  await page.goto('/notices/1');
  await page.getByRole('button', { name: '편집', exact: true }).click();
  const content = page.getByLabel('본문', { exact: false });
  const original = await content.inputValue();
  await page.getByLabel('제목', { exact: false }).fill('저장_CODE');
  const sent = page.waitForRequest(
    (request) =>
      request.method() === 'PATCH' && new URL(request.url()).pathname.endsWith('/notices/1'),
  );
  await page.getByRole('button', { name: '공지 저장하기', exact: true }).click();
  expect((await sent).postDataJSON()).toMatchObject({
    title: '저장_CODE',
    content: original,
    status: 'PUBLISHED',
  });
  await expect(page.getByRole('button', { name: '편집', exact: true })).toBeVisible();
});

test('유저 권한 확인창을 닫으면 요청 없이 원래 역할을 유지한다', async ({ page }) => {
  await page.goto('/users/1001');
  let writes = 0;
  page.on('request', (request) => {
    if (request.method() === 'PATCH' && request.url().includes('/users/1001')) writes++;
  });
  const role = page.getByRole('combobox').first();
  await role.click();
  await page.getByRole('option', { name: '관리자', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: '관리자 권한을 부여할까요?' });
  await expect(dialog).toContainText('홍길동 (@gildong)');
  await expect(dialog.getByRole('button', { name: '권한 부여하기' })).toBeVisible();
  await dialog.getByRole('button', { name: '닫기', exact: true }).first().click();
  await expect(role).toHaveText('일반');
  expect(writes).toBe(0);
});

test('미해결 신고 처리 후 목록으로 이동하고 기존 boolean을 전송한다', async ({ page }) => {
  await page.goto('/reports/1024');
  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: '해결됨', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: '신고 처리 상태를 바꿀까요?' });
  await expect(dialog).toContainText('해결됨 상태로 바꿔요.');
  const sent = page.waitForRequest(
    (request) => request.method() === 'PATCH' && request.url().endsWith('/reports/1024/status'),
  );
  await dialog.getByRole('button', { name: '처리 상태 변경하기' }).click();
  expect((await sent).postDataJSON()).toEqual({ isResolved: true });
  await expect(page).toHaveURL(/\/reports$/);
});

test('해결된 신고를 미해결로 바꾸면 상세에 머문다', async ({ page }) => {
  await page.goto('/reports');
  await expect(page.getByRole('heading', { name: '신고 관리' })).toBeVisible();
  // 기존 MSW 상세가 모든 ID에 isResolved:false를 반환하므로 이 GET의 응답만
  // 기존 schema의 해결된 fixture로 치환한다. PATCH는 실제 MSW handler가 처리한다.
  await page.evaluate(() => {
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
      if (
        method === 'GET' &&
        new URL(String(url), location.href).pathname.endsWith('/reports/1020')
      ) {
        this.addEventListener('load', () => {
          Object.defineProperty(this, 'responseText', {
            configurable: true,
            value: JSON.stringify({
              reportId: 1020,
              reportType: 'CONTENT_ERROR',
              problemId: 471,
              content: '원문_CODE',
              isResolved: true,
              submittedAt: '2026-04-20T18:45:00Z',
            }),
          });
        });
      }
      originalOpen.call(this, method, url, true);
    };
  });
  await page.getByRole('combobox').nth(1).click();
  await page.getByRole('option', { name: '해결됨', exact: true }).click();
  await page.getByRole('row').filter({ hasText: '#1020' }).click();
  await expect(page).toHaveURL(/\/reports\/1020$/);
  await expect(page.getByRole('heading', { name: '신고 #1020' })).toBeVisible();
  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: '미해결', exact: true }).click();
  const sent = page.waitForRequest(
    (request) => request.method() === 'PATCH' && request.url().endsWith('/reports/1020/status'),
  );
  await page.getByRole('dialog').getByRole('button', { name: '처리 상태 변경하기' }).click();
  expect((await sent).postDataJSON()).toEqual({ isResolved: false });
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page).toHaveURL(/\/reports\/1020$/);
  await expect(page.getByText('원문_CODE', { exact: true })).toBeVisible();
});

test('신고 목록의 문제 링크는 같은 탭에서 문제로 이동한다', async ({ page }) => {
  await page.goto('/reports');
  await page.getByRole('button', { name: 'P-512', exact: true }).click();
  await expect(page).toHaveURL(/\/problems\/512$/);
});

test('문의 답변 등록·수정·삭제가 기존 payload와 원문을 유지한다', async ({ page }) => {
  await page.goto('/inquiries/5001');
  const input = page.getByRole('textbox');
  const register = page.getByRole('button', { name: '답변 등록하기' });
  await expect(register).toBeDisabled();
  await input.fill('  원문_CODE\n두 번째  줄  ');
  const created = page.waitForRequest(
    (request) => request.method() === 'POST' && request.url().endsWith('/inquiries/5001/answer'),
  );
  await register.click();
  expect((await created).postDataJSON()).toEqual({ content: '원문_CODE\n두 번째  줄' });
  await expect(input).toHaveValue('원문_CODE\n두 번째  줄');
  await expect(page.getByRole('button', { name: '답변 수정하기' })).toBeDisabled();
  await input.fill('수정_CODE\n기존  간격');
  const updated = page.waitForRequest(
    (request) => request.method() === 'PUT' && request.url().endsWith('/inquiries/5001/answer'),
  );
  await page.getByRole('button', { name: '답변 수정하기' }).click();
  expect((await updated).postDataJSON()).toEqual({ content: '수정_CODE\n기존  간격' });
  await expect(input).toHaveValue('수정_CODE\n기존  간격');
  await page.getByRole('button', { name: '답변 삭제하기', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: '답변을 삭제할까요?' });
  await expect(dialog).toContainText("문의 상태가 '대기'로 돌아가요.");
  await dialog.getByRole('button', { name: '닫기', exact: true }).first().click();
  await expect(input).toHaveValue('수정_CODE\n기존  간격');
  await page.getByRole('button', { name: '답변 삭제하기', exact: true }).click();
  const deleted = page.waitForRequest(
    (request) => request.method() === 'DELETE' && request.url().endsWith('/inquiries/5001/answer'),
  );
  await dialog.getByRole('button', { name: '답변 삭제하기', exact: true }).click();
  await deleted;
  await expect(page.getByRole('button', { name: '답변 등록하기' })).toBeDisabled();
  await expect(input).toHaveValue('');
});
