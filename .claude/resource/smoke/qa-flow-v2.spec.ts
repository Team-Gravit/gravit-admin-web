import { expect, test, type Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('gravit_admin_session', 'true'));
});
const group = (page: Page) => page.getByRole('region', { name: 'ACC-01 로그인', exact: true });
const row = (page: Page, title = '로그인 버튼 동작') =>
  group(page).getByRole('row', { name: title, exact: true });
async function api(page: Page, path: string, method = 'GET', body?: object) {
  return page.evaluate(
    async ({ path, method, body }) => {
      const res = await fetch(`/qa-api${path}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      return { status: res.status, data: res.status === 204 ? null : await res.json() };
    },
    { path, method, body },
  );
}

test('목록은 필터 없는 3열이며 행별 상세를 조회하지 않는다', async ({ page }) => {
  const details: string[] = [];
  page.on('request', (req) => {
    if (/\/qa-api\/sprints\/\d+$/.test(req.url())) details.push(req.url());
  });
  await page.goto('/qa/sprints');
  await expect(page.getByRole('columnheader')).toHaveText(['스프린트', '약식 설명', '현재 상태']);
  await expect(page.getByRole('row')).toHaveCount(10);
  await expect(page.getByRole('combobox')).toHaveCount(0);
  await expect(page.getByText('실패', { exact: true })).toHaveCount(0);
  expect(details).toHaveLength(0);
});

for (const [id, path] of [
  [7, 'setup'],
  [6, 'setup'],
  [8, 'setup'],
  [4, 'design-review'],
  [3, 'checklist/1'],
  [2, 'checklist/2'],
  [1, 'checklist/2'],
] as const) {
  test(`스프린트 ${id}는 상태에 맞는 ${path} 탭으로 진입한다`, async ({ page }) => {
    await page.goto(`/qa/sprints/${id}`);
    await expect(page).toHaveURL(new RegExp(`/qa/sprints/${id}/${path}$`));
    await expect(page.getByRole('navigation', { name: 'QA 탭' }).getByRole('link')).toHaveText([
      '연결 현황',
      '디자인 검수',
      '1차 체크리스트',
      '2차 체크리스트',
    ]);
    await expect(page.getByText('Notion에서 보기')).toHaveCount(0);
    await expect(page.getByText('지금 할 일')).toHaveCount(0);
    if (id === 8)
      await expect(page.getByRole('list', { name: '진행 단계' }).getByText('실패')).toBeVisible();
  });
}

test('빈 목록과 미생성 검수 목록을 표시하고 round는 필수다', async ({ page }) => {
  await page.goto('/qa/sprints?qaMock=empty');
  await expect(page.getByText('등록된 스프린트가 없습니다.', { exact: false })).toBeVisible();
  await page.goto('/qa/sprints/7/design-review');
  await expect(page.getByText('아직 생성된 항목이 없습니다.')).toBeVisible();
  await expect(page.getByRole('meter')).toHaveCount(4);
  const response = await api(page, '/sprints/7/checklist');
  expect(response.status).toBe(400);
});

test('등록 모달은 URL 검증 후 새 스프린트의 연결 현황으로 이동한다', async ({ page }) => {
  await page.goto('/qa/sprints');
  await page.getByRole('button', { name: '스프린트 등록' }).first().click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: '등록', exact: true }).click();
  await expect(dialog.getByText('Notion 스프린트 페이지 URL을 입력하세요.')).toBeVisible();
  await dialog.getByRole('textbox').fill('https://www.notion.so/bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');
  await dialog.getByRole('button', { name: '등록', exact: true }).click();
  await expect(page).toHaveURL(/\/qa\/sprints\/11\/setup$/);
  await expect(page.getByRole('button', { name: '시작', exact: true })).toBeVisible();
});

test('연결 현황은 5개 대상과 DONE 단계 메시지, 제목 오른쪽 태그를 표시한다', async ({ page }) => {
  await page.goto('/qa/sprints/9/setup');
  const connections = page.getByRole('region', { name: '연결 상태' });
  await expect(connections.getByText('연결됨', { exact: true })).toHaveCount(5);
  const steps = page.getByRole('region', { name: '준비 작업' });
  await expect(steps.getByText('완료', { exact: true })).toHaveCount(5);
  await expect(
    steps.getByText('API 명세 일부가 없어 해당 항목은 수동 확인이 필요합니다.'),
  ).toBeVisible();
  await expect(steps.getByText('시도 1회')).toHaveCount(5);
  await expect(steps.getByText(/요청 \d|시작 \d|종료 \d/)).toHaveCount(0);
});

test('반영 실패는 DB의 새 버전을 읽어 다시 승인하고 나머지 제안을 거절한다', async ({ page }) => {
  await page.goto('/qa/sprints/6/setup?qaMock=reflection-fail');
  const proposal = page.getByRole('article', { name: 'ACC-01 반영 제안' });
  await expect(proposal.getByRole('region', { name: '바뀌기 전' })).toBeVisible();
  await expect(proposal.getByRole('region', { name: '바뀐 후' })).toBeVisible();
  await proposal.getByRole('button', { name: '승인', exact: true }).click();
  await expect(proposal.getByText('반영 실패', { exact: true })).toBeVisible();
  await expect(proposal.getByRole('status')).toContainText('Notion 본문 반영에 실패');
  await proposal.getByRole('button', { name: '다시 승인' }).click();
  await expect(proposal.getByText('반영 완료')).toBeVisible();
  await page
    .getByRole('article', { name: 'G-APP 반영 제안' })
    .getByRole('button', { name: '거절', exact: true })
    .click();
  await expect(page.getByText('승인 대기 0건')).toBeVisible();
  const reflections = await api(page, '/sprints/6/reflections');
  expect(reflections.data.map((r: { state: string }) => r.state)).toEqual(['APPLIED', 'REJECTED']);
});

test('승인 대기 중 다시 수집은 확인 후 대기·실패 제안을 삭제한다', async ({ page }) => {
  await page.goto('/qa/sprints/6/setup');
  await page.getByRole('button', { name: '다시 수집', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('대기·실패 상태의 반영 제안이 삭제');
  await dialog.getByRole('button', { name: '다시 수집', exact: true }).click();
  await expect(page.getByText('승인 대기 0건')).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(0);
  const reflections = await api(page, '/sprints/6/reflections');
  expect(reflections.data).toHaveLength(0);
  const sprint = await api(page, '/sprints/6');
  expect(sprint.data.setupSteps[0].status).toBe('DONE');
  expect(sprint.data.setupSteps[1].attempt).toBe(2);
});

test('명세 변경 충돌은 다시 수집을 안내한다', async ({ page }) => {
  await page.goto('/qa/sprints/6/setup?qaMock=reflection-changed');
  const proposal = page.getByRole('article', { name: 'ACC-01 반영 제안' });
  await proposal.getByRole('button', { name: '승인', exact: true }).click();
  await expect(proposal.getByRole('alert')).toContainText('다시 수집');
  await expect(proposal.getByRole('button', { name: '승인', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: '다시 수집', exact: true })).toBeEnabled();
});

test('디자인 자동 판정을 변경하고 원래 사유를 이력에서 확인한다', async ({ page }) => {
  await page.goto('/qa/sprints/2/design-review');
  await expect(page.getByRole('meter')).toHaveCount(4);
  for (const name of ['Design', 'Web', 'APP', 'Server'])
    await expect(page.getByRole('meter', { name: `${name} 완료율` })).toBeVisible();
  const missing = page.getByRole('article', { name: 'APP Figma 프레임 없음', exact: true });
  await expect(missing).toContainText('명세의 Figma 칸이 -');
  const before = await api(page, '/sprints/2');
  await missing.getByRole('button', { name: '해당 없음', exact: true }).click();
  await expect(missing.getByRole('button', { name: '해당 없음', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  const after = await api(page, '/sprints/2');
  expect(after.data.progress[0].total).toBe(before.data.progress[0].total - 1);
  await missing.getByRole('button', { name: '이력 보기' }).click();
  const history = page.getByRole('dialog');
  await expect(history).toContainText('수동 판정');
  await expect(history).toContainText('명세의 Figma 칸이 -');
});

test('셀은 round별로 분리되고 자동 결과도 변경·해당 없음·이력 조회가 가능하다', async ({
  page,
}) => {
  const rounds: string[] = [];
  page.on('request', (req) => {
    if (req.url().includes('/sprints/2/checklist?'))
      rounds.push(new URL(req.url()).searchParams.get('round') ?? '');
  });
  await page.goto('/qa/sprints/2/checklist/1');
  const target = row(page, '필수 입력 안내');
  await target.getByRole('button', { name: 'APP 미검수 — 변경', exact: true }).click();
  await page.getByRole('menuitemcheckbox', { name: 'Pass', exact: true }).click();
  await expect(target.getByRole('button', { name: 'APP Pass — 변경', exact: true })).toBeVisible();
  await target.getByRole('button', { name: 'APP Pass — 변경', exact: true }).click();
  await page.getByRole('menuitem', { name: '변경 이력', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('release 코드에서 명세');
  await expect(page.getByRole('dialog')).toContainText('수동 판정');
  await page.getByRole('dialog').getByRole('button', { name: '닫기' }).click();
  await target.getByRole('button', { name: 'APP Pass — 변경', exact: true }).click();
  await page.getByRole('menuitemcheckbox', { name: '해당 없음', exact: true }).click();
  await target.getByRole('button', { name: 'APP 해당 없음 — 변경', exact: true }).click();
  await page.getByRole('menuitem', { name: '변경 이력', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('해당 없음');
  await page.getByRole('dialog').getByRole('button', { name: '닫기' }).click();
  await page
    .getByRole('navigation', { name: 'QA 탭' })
    .getByRole('link', { name: '2차 체크리스트' })
    .click();
  await expect(
    row(page, '필수 입력 안내').getByRole('button', { name: 'APP 미검수 — 변경', exact: true }),
  ).toBeVisible();
  expect(rounds).toContain('1');
  expect(rounds).toContain('2');
  expect(rounds).not.toContain('');
});

test('다음 미검수는 접힌 그룹을 펼쳐 현재 파트의 셀로 포커스를 옮긴다', async ({ page }) => {
  await page.goto('/qa/sprints/2/checklist/1');
  const header = group(page).getByRole('button', { expanded: true });
  await header.click();
  await page.getByRole('button', { name: '다음 미검수', exact: true }).click();
  await expect(group(page).getByRole('button', { expanded: true })).toBeVisible();
  await expect(
    row(page, '필수 입력 안내').getByRole('button', { name: 'APP 미검수 — 변경', exact: true }),
  ).toBeFocused();
  await page.getByRole('combobox', { name: '파트 필터' }).click();
  await page.getByRole('option', { name: 'Server', exact: true }).click();
  await expect(group(page).getByRole('columnheader')).toHaveText(['항목', 'Server', '항목 관리']);
});

test('항목 수정은 초기화 확인 후 모든 셀과 이력을 초기화하고 추가·삭제를 지원한다', async ({
  page,
}) => {
  await page.goto('/qa/sprints/2/checklist/2');
  const target = row(page);
  await target.getByRole('button', { name: '수정', exact: true }).click();
  await page.getByLabel(/^설명/).fill('수정한 설명');
  await page.getByRole('dialog').getByRole('button', { name: '저장', exact: true }).click();
  const confirm = page.getByRole('dialog', { name: '항목을 수정할까요?' });
  await expect(confirm).toContainText('판정 결과가 미검수로 초기화됩니다');
  await confirm.getByRole('button', { name: '수정', exact: true }).click();
  await expect(target).toContainText('수정한 설명');
  await expect(target.getByRole('button', { name: /미검수 — 변경/ })).toHaveCount(3);
  const checklist = await api(page, '/sprints/2/checklist?round=2');
  const item = checklist.data.features[0].items[0];
  const history = await api(page, `/checklist-items/${item.id}/cells/WEB/history`);
  expect(history.data[0].reason).toBe('항목 수정으로 판정 초기화');
  await group(page).getByRole('button', { name: '항목 추가', exact: true }).click();
  await page.getByLabel(/^행위/).fill('직접 추가한 행위');
  await page.getByLabel(/^설명/).fill('직접 추가한 설명');
  await page.getByRole('dialog').getByRole('checkbox', { name: 'Web', exact: true }).check();
  await page.getByRole('dialog').getByRole('button', { name: '추가', exact: true }).click();
  const added = row(page, '직접 추가한 행위');
  await expect(added).toContainText('직접 추가한 설명');
  await added.getByRole('button', { name: '삭제', exact: true }).click();
  await page
    .getByRole('dialog', { name: '항목을 삭제할까요?' })
    .getByRole('button', { name: '삭제', exact: true })
    .click();
  await expect(added).toHaveCount(0);
});

test('항목 폼은 미저장 입력을 닫기 전에 확인한다', async ({ page }) => {
  await page.goto('/qa/sprints/2/checklist/2');
  await row(page).getByRole('button', { name: '수정', exact: true }).click();
  await page.getByLabel(/^행위/).fill('저장하지 않은 행위');
  await page.getByRole('dialog').getByRole('button', { name: '취소', exact: true }).click();
  const guard = page.getByRole('dialog', {
    name: '변경 사항이 있습니다. 페이지를 나가시겠습니까?',
  });
  await expect(guard).toBeVisible();
  await guard.getByRole('button', { name: '나가기', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('준비 실행 중 항목 추가·수정·삭제는 비활성화한다', async ({ page }) => {
  await page.goto('/qa/sprints/4/checklist/1');
  await expect(group(page).getByRole('button', { name: '항목 추가' })).toBeDisabled();
  await expect(row(page).getByRole('button', { name: '수정', exact: true })).toBeDisabled();
  await expect(row(page).getByRole('button', { name: '삭제', exact: true })).toBeDisabled();
});

test('버전 충돌은 재조회 안내를 표시하고 판정은 유지한다', async ({ page }) => {
  await page.goto('/qa/sprints/2/checklist/1?qaMock=stale');
  const target = row(page);
  await target.getByRole('button', { name: 'Web Pass — 변경', exact: true }).click();
  await page.getByRole('menuitemcheckbox', { name: 'Fail', exact: true }).click();
  await expect(
    page.getByText('다른 운영자가 먼저 변경했습니다. 최신 내용을 다시 불러왔습니다.'),
  ).toBeVisible();
  await expect(target.getByRole('button', { name: 'Web Pass — 변경', exact: true })).toBeVisible();
});

test('종료는 2차 탭에만 있고 디자인 미검수도 종료를 막는다', async ({ page }) => {
  await page.goto('/qa/sprints/9/checklist/1');
  await expect(page.getByRole('button', { name: '스프린트 종료', exact: true })).toHaveCount(0);
  await page
    .getByRole('navigation', { name: 'QA 탭' })
    .getByRole('link', { name: '디자인 검수' })
    .click();
  await group(page)
    .getByRole('article')
    .first()
    .getByRole('button', { name: '미검수로 변경' })
    .click();
  await page
    .getByRole('navigation', { name: 'QA 탭' })
    .getByRole('link', { name: '2차 체크리스트' })
    .click();
  await expect(page.getByRole('button', { name: '스프린트 종료', exact: true })).toBeDisabled();
});

test('종료 기준점 기록 실패는 모달을 유지하고 다시 시도할 수 있다', async ({ page }) => {
  await page.goto('/qa/sprints/9/checklist/2?qaMock=close-fail');
  await page.getByRole('button', { name: '스프린트 종료', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: '종료', exact: true }).click();
  await expect(dialog.getByRole('alert')).toContainText('QA 기준점 기록에 실패');
  expect((await api(page, '/sprints/9')).data.status).toBe('MANUAL_REVIEW');
  await dialog.getByRole('button', { name: '다시 시도', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByText('종료된 스프린트입니다.', { exact: false })).toBeVisible();
  await row(page).getByRole('button', { name: 'Web Pass — 변경 이력', exact: true }).click();
  await expect(page.getByRole('menuitemcheckbox')).toHaveCount(0);
  await page.getByRole('menuitem', { name: '변경 이력', exact: true }).click();
  await expect(page.getByRole('dialog', { name: '변경 이력' })).toBeVisible();
});

test('503 조회 실패는 QA 오류를 표시하고 세션을 유지한다', async ({ page }) => {
  await page.goto('/qa/sprints?qaMock=503');
  await expect(
    page
      .getByText('인증 서버 응답이 없어 권한을 확인하지 못했습니다. 잠시 후 다시 시도하세요.')
      .first(),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/qa\/sprints\?qaMock=503$/);
  expect(await page.evaluate(() => localStorage.getItem('gravit_admin_session'))).toBe('true');
});

test('삭제 버전 충돌은 재조회 후 확인창을 닫아 구버전 재시도를 막는다', async ({ page }) => {
  await page.goto('/qa/sprints/2/checklist/2?qaMock=stale');
  await row(page).getByRole('button', { name: '삭제', exact: true }).click();
  await page
    .getByRole('dialog', { name: '항목을 삭제할까요?' })
    .getByRole('button', { name: '삭제', exact: true })
    .click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(
    page.getByText('다른 운영자가 먼저 변경했습니다. 최신 내용을 다시 불러왔습니다.'),
  ).toBeVisible();
  await expect(row(page)).toBeVisible();
});

test('준비 시작은 jobId로 진행을 추적하고 다른 탭에서도 완료를 반영한다', async ({ page }) => {
  test.setTimeout(45_000);
  const starts: object[] = [];
  page.on('request', (req) => {
    if (req.method() === 'POST' && req.url().endsWith('/sprints/7/setup-jobs'))
      starts.push(req.postDataJSON());
  });
  await page.goto('/qa/sprints/7/setup');
  await page.getByRole('button', { name: '시작', exact: true }).click();
  await expect(
    page.getByRole('region', { name: '준비 작업' }).getByText('진행 중', { exact: true }),
  ).toBeVisible();
  expect(starts).toEqual([{ version: 0 }]);
  await page
    .getByRole('navigation', { name: 'QA 탭' })
    .getByRole('link', { name: '1차 체크리스트' })
    .click();
  await expect(
    page.getByRole('list', { name: '진행 단계' }).locator('[aria-current="step"]'),
  ).toContainText('2차 수동 검수', { timeout: 30_000 });
  await expect(page).toHaveURL(/\/qa\/sprints\/7\/checklist\/1$/);
  await expect(group(page).getByRole('button', { name: '항목 추가' })).toBeEnabled();
});

test('실패 단계부터 재시도하고 진행 중 작업을 취소할 수 있다', async ({ page }) => {
  await page.goto('/qa/sprints/8/setup');
  const setup = page.getByRole('region', { name: '준비 작업' });
  await setup.getByRole('button', { name: '다시 시도', exact: true }).click();
  await expect(setup.getByText('시도 2회', { exact: true })).toBeVisible();
  await setup.getByRole('button', { name: '작업 취소', exact: true }).click();
  await page
    .getByRole('dialog', { name: '준비 작업을 취소할까요?' })
    .getByRole('button', { name: '작업 취소', exact: true })
    .click();
  await expect(setup.getByRole('button', { name: '시작', exact: true })).toBeVisible();
  const sprint = await api(page, '/sprints/8');
  expect(sprint.data.latestJob.status).toBe('CANCELLED');
  expect(sprint.data.latestJob.finishedAt).toMatch(/\+09:00$/);
});
