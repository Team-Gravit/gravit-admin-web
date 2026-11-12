import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const fixesLink = (page: Page) =>
  page
    .getByRole('navigation', { name: 'QA 탭' })
    .getByRole('link', { name: '파트별 수정사항', exact: true });
const failDialog = (page: Page) => page.getByRole('dialog', { name: 'Fail 사유', exact: true });
async function prepareFixes(page: Page, scenario = '') {
  await page.goto(`/qa/sprints/9/checklist/1${scenario ? `?qaMock=${scenario}` : ''}`);
  await expect(group(page)).toBeVisible();
  const checklist = (await api(page, '/sprints/9/checklist?round=1')).data;
  const item = checklist.features[0].items[0];
  for (const part of ['WEB', 'APP', 'SERVER']) {
    const response = await api(page, `/checklist-items/${item.id}/cells/${part}`, 'PUT', {
      state: 'FAIL',
      version: 0,
      reason: `${part} 수정 사유입니다.\n한글 줄바꿈을 보존합니다.`,
    });
    expect(response.status).toBe(200);
  }
  const design = (await api(page, '/sprints/9/design-review')).data.features[0].items[0];
  expect(
    (
      await api(page, `/design-review-items/${design.id}`, 'PUT', {
        state: 'FAIL',
        version: 0,
        reason: '디자인 수정 사유입니다.',
      })
    ).status,
  ).toBe(200);
  await fixesLink(page).click();
  await expect(page.getByRole('region', { name: '디자인 수정사항', exact: true })).toBeVisible();
}

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
  [5, 'setup'],
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
      '파트별 수정사항',
    ]);
    await expect(page.getByText('Notion에서 보기')).toHaveCount(0);
    await expect(page.getByText('지금 할 일')).toHaveCount(0);
    if (id === 8)
      await expect(
        page
          .getByRole('list', { name: '진행 단계' })
          .getByRole('listitem', { name: '기능 명세서 로드 실패', exact: true }),
      ).toBeVisible();
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

test('연결 현황은 5개 대상과 DONE 단계 메시지, 공통 상태 아이콘을 표시한다', async ({ page }) => {
  await page.goto('/qa/sprints/9/setup');
  const connections = page.getByRole('region', { name: '연결 상태' });
  await expect(connections.getByRole('img', { name: '연결됨', exact: true })).toHaveCount(5);
  const steps = page.getByRole('region', { name: '준비 작업' });
  await expect(steps.getByRole('img', { name: '완료', exact: true })).toHaveCount(5);
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
  await expect(proposal.getByRole('img', { name: '반영 실패', exact: true })).toBeVisible();
  await expect(proposal.getByRole('status')).toContainText('Notion 본문 반영에 실패');
  await proposal.getByRole('button', { name: '다시 승인' }).click();
  await expect(proposal.getByRole('img', { name: '반영 완료', exact: true })).toBeVisible();
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
  const missing = page.getByRole('row', { name: 'APP AOS 시안 프레임이 없다', exact: true });
  await expect(missing.getByText('Figma 프레임 없음', { exact: true })).toBeVisible();
  await expect(page.getByText('Figma와 화면 명세를 비교한 자동 검수 결과입니다.')).toHaveCount(0);
  const before = await api(page, '/sprints/2');
  await missing.getByRole('button', { name: 'APP 미검수 — 변경', exact: true }).click();
  await page.getByRole('menuitemcheckbox', { name: '해당 없음', exact: true }).click();
  await expect(
    missing.getByRole('button', { name: 'APP 해당 없음 — 변경', exact: true }),
  ).toBeVisible();
  const after = await api(page, '/sprints/2');
  expect(after.data.progress[0].total).toBe(before.data.progress[0].total - 1);
  await missing.getByRole('button', { name: 'APP 해당 없음 — 변경', exact: true }).click();
  await page.getByRole('menuitem', { name: '변경 이력', exact: true }).click();
  const history = page.getByRole('dialog');
  await expect(history).toContainText('수동 판정');
  await expect(history).toContainText('Figma 프레임 없음');
});

test('셀은 round별로 분리되고 자동 결과도 변경·이력 조회가 가능하며 해당 없음은 금지한다', async ({
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
  await expect(page.getByRole('dialog')).toContainText('qa-baseline 코드에서 명세');
  await expect(page.getByRole('dialog')).toContainText('수동 판정');
  await page.getByRole('dialog').getByRole('button', { name: '닫기' }).click();
  await target.getByRole('button', { name: 'APP Pass — 변경', exact: true }).click();
  await expect(page.getByRole('menuitemcheckbox')).toHaveText(['미검수', 'Pass', 'Fail']);
  await expect(page.getByRole('menuitemcheckbox', { name: '해당 없음', exact: true })).toHaveCount(
    0,
  );
  await page.keyboard.press('Escape');
  const current = (await api(page, '/sprints/2/checklist?round=1')).data.features[0].items[1];
  const cell = current.cells.find((c: { part: string }) => c.part === 'APP');
  const rejected = await api(page, `/checklist-items/${current.id}/cells/APP`, 'PUT', {
    state: 'NOT_APPLICABLE',
    version: cell.version,
  });
  expect(rejected.status).toBe(400);
  expect(rejected.data.error).toBe('CHECKLIST_4001');
  await expect(target.getByRole('button', { name: 'APP Pass — 변경', exact: true })).toBeVisible();
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
  await expect(group(page).getByRole('button', { name: '항목 추가' })).toHaveCount(0);
  await expect(row(page).getByRole('button', { name: '수정', exact: true })).toBeDisabled();
  await expect(row(page).getByRole('button', { name: '삭제', exact: true })).toBeDisabled();
});

test('버전 충돌은 재조회 안내를 표시하고 판정은 유지한다', async ({ page }) => {
  await page.goto('/qa/sprints/2/checklist/1?qaMock=stale');
  const target = row(page);
  await target.getByRole('button', { name: 'Web Pass — 변경', exact: true }).click();
  await page.getByRole('menuitemcheckbox', { name: 'Fail', exact: true }).click();
  await page
    .getByRole('dialog', { name: 'Fail 사유', exact: true })
    .getByRole('button', { name: 'Fail로 변경', exact: true })
    .click();
  await expect(
    page.getByText('다른 운영자가 먼저 변경했습니다. 최신 내용을 다시 불러왔습니다.'),
  ).toBeVisible();
  await expect(target.getByRole('button', { name: 'Web Pass — 변경', exact: true })).toBeVisible();
});

test('QA 종료는 모든 탭 상단에 있고 디자인 미검수도 종료를 막는다', async ({ page }) => {
  await page.goto('/qa/sprints/9/checklist/1');
  await expect(page.getByRole('button', { name: 'QA 종료', exact: true })).toBeEnabled();
  await page
    .getByRole('navigation', { name: 'QA 탭' })
    .getByRole('link', { name: '디자인 검수' })
    .click();
  await group(page)
    .getByRole('row', { name: 'WEB 주요 버튼 배치', exact: true })
    .getByRole('button', { name: 'Web Pass — 변경', exact: true })
    .click();
  await page.getByRole('menuitemcheckbox', { name: '미검수', exact: true }).click();
  const close = page.getByRole('button', { name: 'QA 종료', exact: true });
  await expect(close).toBeDisabled();
  await close.focus();
  await expect(page.getByRole('tooltip')).toContainText(
    '디자인 검수와 1·2차 체크리스트의 모든 미검수를 처리해야 종료할 수 있습니다.',
  );
  await page.keyboard.press('Escape');
  await page
    .getByRole('navigation', { name: 'QA 탭' })
    .getByRole('link', { name: '2차 체크리스트' })
    .click();
  await expect(close).toBeDisabled();
});

test('종료 기준점 기록 실패는 모달을 유지하고 다시 시도할 수 있다', async ({ page }) => {
  await page.goto('/qa/sprints/9/checklist/2?qaMock=close-fail');
  await page.getByRole('button', { name: 'QA 종료', exact: true }).click();
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
    page
      .getByRole('region', { name: '준비 작업' })
      .getByRole('img', { name: '진행 중', exact: true }),
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
  await expect(group(page).getByRole('button', { name: '항목 추가' })).toHaveCount(0);
  await expect(row(page).getByRole('button', { name: '수정', exact: true })).toBeEnabled();
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

for (const [id, message] of [
  [7, '지금 단계: 준비 전'],
  [8, '지금 단계: 기능 명세서 로드'],
  [2, '남은 미검수: 디자인 4 · 1차 8 · 2차 8'],
] as const) {
  test(`수정사항 미완료 화면: 스프린트 ${id}`, async ({ page }) => {
    await page.goto(`/qa/sprints/${id}/fix-reports`);
    await expect(page.getByText('아직 검수가 완료되지 않았어요', { exact: true })).toBeVisible();
    await expect(page.getByText(message, { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '내려받기', exact: true })).toHaveCount(0);
  });
}

for (const id of [3, 4, 5]) {
  test(`수정사항 실행 중 안내: 스프린트 ${id}`, async ({ page }) => {
    await page.goto(`/qa/sprints/${id}/fix-reports`);
    await expect(
      page.getByRole('status').filter({ hasText: '단계 작업이 실행 중입니다.' }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: '내려받기', exact: true })).toHaveCount(0);
  });
}

for (const id of [1, 9]) {
  test(`수정사항 준비 완료 0건 카드와 비활성 이유: 스프린트 ${id}`, async ({ page }) => {
    await page.goto(`/qa/sprints/${id}/fix-reports`);
    for (const part of ['디자인', '웹', '앱', '서버']) {
      const card = page.getByRole('region', { name: `${part} 수정사항`, exact: true });
      await expect(card.getByText('Fail 0', { exact: true })).toBeVisible();
      await expect(card.getByRole('button', { name: '내려받기', exact: true })).toBeDisabled();
    }
    await page.getByLabel('디자인: 수정할 항목이 없어요', { exact: true }).focus();
    await expect(page.getByRole('tooltip')).toHaveText('수정할 항목이 없어요');
  });
}

test('수정사항은 4개 파트를 인증 Blob으로 받아 G1 파일명과 UTF-8 내용을 저장한다', async ({
  page,
}) => {
  await prepareFixes(page);
  const summary = (await api(page, '/sprints/9/fix-reports')).data;
  for (const [part, label] of [
    ['DESIGN', '디자인'],
    ['WEB', '웹'],
    ['APP', '앱'],
    ['SERVER', '서버'],
  ] as const) {
    const card = page.getByRole('region', { name: `${label} 수정사항`, exact: true });
    await expect(card.getByText('Fail 1', { exact: true })).toBeVisible();
    const requestPromise = page.waitForRequest((req) => req.url().endsWith(`/fix-reports/${part}`));
    const downloadPromise = page.waitForEvent('download');
    await card.getByRole('button', { name: '내려받기', exact: true }).click();
    const request = await requestPromise;
    expect(request.method()).toBe('GET');
    expect(Object.hasOwn(request.headers(), 'authorization')).toBe(true);
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe(
      summary.parts.find((entry: { part: string }) => entry.part === part).fileName,
    );
    expect(download.suggestedFilename()).not.toBe('ignored-header.txt');
    const body = await readFile((await download.path())!, 'utf8');
    expect(body).toContain('임시 목 TXT — 서버 계약 예시 틀 확인 필요');
    expect(body).toContain(
      part === 'DESIGN'
        ? '디자인 수정 사유입니다.'
        : `${part} 수정 사유입니다.\n한글 줄바꿈을 보존합니다.`,
    );
    await expect(card.getByRole('button', { name: '내려받기', exact: true })).toBeEnabled();
  }
  await expect(page).toHaveURL(/\/fix-reports$/);
});

for (const scenario of ['fixes-download-conflict', 'fixes-download-404']) {
  test(`다운로드 실패 ${scenario}는 토스트 후 G1을 다시 조회한다`, async ({ page }) => {
    await prepareFixes(page, scenario);
    const refetch = page.waitForRequest((req) => /\/sprints\/9\/fix-reports$/.test(req.url()));
    await page
      .getByRole('region', { name: '웹 수정사항', exact: true })
      .getByRole('button', { name: '내려받기', exact: true })
      .click();
    await refetch;
    await expect(
      page.getByText(
        scenario === 'fixes-download-conflict'
          ? '검수가 완료되지 않아 파일을 내려받을 수 없습니다. 최신 상태를 다시 불러옵니다.'
          : '요청을 처리하지 못했습니다. 잠시 후 다시 시도하세요.',
        { exact: true },
      ),
    ).toBeVisible();
    await expect(
      page
        .getByRole('region', { name: '웹 수정사항', exact: true })
        .getByRole('button', { name: '내려받기', exact: true }),
    ).toBeEnabled();
  });
}

test('구서버 G1 404는 일반 오류를 표시하고 다른 탭을 사용할 수 있다', async ({ page }) => {
  await page.goto('/qa/sprints/2/fix-reports?qaMock=legacy');
  await expect(
    page.getByRole('main').getByText('대상을 찾을 수 없습니다.', { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: '다시 시도', exact: true })).toBeVisible();
  await page
    .getByRole('navigation', { name: 'QA 탭' })
    .getByRole('link', { name: '1차 체크리스트', exact: true })
    .click();
  await expect(row(page)).toBeVisible();
});

for (const type of ['1차', '2차', '디자인'] as const) {
  test(`${type} Fail 사유는 확인 전 요청이 없고 취소·저장·이력·해제를 지원한다`, async ({
    page,
  }) => {
    const design = type === '디자인';
    await page.goto(
      `/qa/sprints/2/${design ? 'design-review' : `checklist/${type === '1차' ? 1 : 2}`}`,
    );
    const target = design
      ? group(page).getByRole('row', { name: 'WEB 주요 버튼 배치', exact: true })
      : row(page);
    let puts = 0;
    page.on('request', (req) => {
      if (req.method() === 'PUT' && req.url().includes('/qa-api/')) puts++;
    });
    await target.getByRole('button', { name: 'Web Pass — 변경', exact: true }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Fail', exact: true }).click();
    await expect(
      failDialog(page).getByRole('textbox', { name: '사유 (선택)', exact: true }),
    ).toBeFocused();
    await expect(failDialog(page).getByText('0/500', { exact: true })).toBeVisible();
    await failDialog(page).getByRole('textbox').fill('취소할 사유');
    expect(puts).toBe(0);
    await failDialog(page).getByRole('button', { name: '취소', exact: true }).click();
    await expect(
      target.getByRole('button', { name: 'Web Pass — 변경', exact: true }),
    ).toBeFocused();
    expect(puts).toBe(0);
    await target.getByRole('button', { name: 'Web Pass — 변경', exact: true }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Fail', exact: true }).click();
    await expect(failDialog(page).getByRole('textbox')).toHaveValue('');
    const reason = '버튼을 눌러도 다음 화면으로 이동하지 않습니다.\n재현 후 수정해 주세요.';
    await failDialog(page).getByRole('textbox').fill(reason);
    const put = page.waitForRequest(
      (req) => req.method() === 'PUT' && req.url().includes('/qa-api/'),
    );
    await failDialog(page).getByRole('button', { name: 'Fail로 변경', exact: true }).click();
    expect((await put).postDataJSON()).toMatchObject({ state: 'FAIL', reason, version: 0 });
    await expect(failDialog(page)).toHaveCount(0);
    await target.getByRole('button', { name: 'Web Fail — 변경', exact: true }).click();
    await page.getByRole('menuitem', { name: '변경 이력', exact: true }).click();
    const history = page.getByRole('dialog', { name: '변경 이력', exact: true });
    await expect(history.getByText(reason, { exact: true })).toBeVisible();
    await expect(history.getByRole('listitem').first()).toContainText('수동 판정 (운영자 #1)');
    if (type !== '2차') await expect(history).toContainText('자동 판정');
    await history.getByRole('button', { name: '닫기', exact: true }).click();
    await target.getByRole('button', { name: 'Web Fail — 변경', exact: true }).click();
    const pass = page.waitForRequest(
      (req) => req.method() === 'PUT' && req.url().includes('/qa-api/'),
    );
    await page.getByRole('menuitemcheckbox', { name: 'Pass', exact: true }).click();
    expect((await pass).postDataJSON()).toEqual({ state: 'PASS', version: 1 });
    await expect(failDialog(page)).toHaveCount(0);
  });
}

for (const type of ['셀', '디자인']) {
  test(`${type} Fail 사유는 선택 입력이고 500자까지 저장하며 초과 요청은 거부한다`, async ({
    page,
  }) => {
    const design = type === '디자인';
    await page.goto(`/qa/sprints/2/${design ? 'design-review' : 'checklist/1'}`);
    const target = design
      ? group(page).getByRole('row', { name: 'WEB 주요 버튼 배치', exact: true })
      : row(page);
    await target.getByRole('button', { name: 'Web Pass — 변경', exact: true }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Fail', exact: true }).click();
    const requestPromise = page.waitForRequest(
      (req) => req.method() === 'PUT' && req.url().includes('/qa-api/'),
    );
    await failDialog(page).getByRole('button', { name: 'Fail로 변경', exact: true }).click();
    const request = await requestPromise;
    expect(request.postDataJSON()).toEqual({ state: 'FAIL', reason: '', version: 0 });
    const url = new URL(request.url());
    await expect(failDialog(page)).toHaveCount(0);
    await target.getByRole('button', { name: 'Web Fail — 변경', exact: true }).click();
    await page.getByRole('menuitem', { name: 'Fail 사유 수정', exact: true }).click();
    await failDialog(page).getByRole('textbox').fill('가'.repeat(501));
    await expect(failDialog(page).getByText('501/500', { exact: true })).toBeVisible();
    let extraPuts = 0;
    page.on('request', (req) => {
      if (req.method() === 'PUT' && req.url().includes('/qa-api/')) extraPuts++;
    });
    await failDialog(page).getByRole('button', { name: 'Fail로 변경', exact: true }).click();
    await expect(
      failDialog(page).getByText('사유는 500자까지 입력할 수 있습니다.', { exact: true }),
    ).toBeVisible();
    await expect(failDialog(page).getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    await expect(failDialog(page).getByRole('alert')).toHaveText(
      '사유는 500자까지 입력할 수 있습니다.',
    );
    expect(extraPuts).toBe(0);
    await failDialog(page)
      .getByRole('textbox')
      .fill(`  \n${'가'.repeat(500)} \n `);
    await expect(failDialog(page).getByText('500/500', { exact: true })).toBeVisible();
    const normalizedRequest = page.waitForRequest(
      (req) => req.method() === 'PUT' && req.url().includes('/qa-api/'),
    );
    await failDialog(page).getByRole('button', { name: 'Fail로 변경', exact: true }).click();
    expect((await normalizedRequest).postDataJSON()).toMatchObject({
      reason: '가'.repeat(500),
      version: 1,
    });
    await expect(failDialog(page)).toHaveCount(0);
    expect(
      (
        await api(page, url.pathname.replace('/qa-api', ''), 'PUT', {
          state: 'FAIL',
          reason: '가'.repeat(501),
          version: 2,
        })
      ).status,
    ).toBe(400);
    await target.getByRole('button', { name: 'Web Fail — 변경', exact: true }).click();
    await page.getByRole('menuitem', { name: 'Fail 사유 수정', exact: true }).click();
    await expect(failDialog(page).getByRole('textbox')).toHaveValue('가'.repeat(500));
    await page.keyboard.press('Escape');
    await expect(failDialog(page)).toHaveCount(0);
  });
}

test('구서버가 reason을 무시하는 목에서도 Fail 변경과 이력 화면이 유지된다', async ({ page }) => {
  await page.goto('/qa/sprints/2/checklist/1?qaMock=legacy');
  await row(page).getByRole('button', { name: 'Web Pass — 변경', exact: true }).click();
  await page.getByRole('menuitemcheckbox', { name: 'Fail', exact: true }).click();
  await failDialog(page).getByRole('textbox').fill('구서버 호환 목');
  await failDialog(page).getByRole('button', { name: 'Fail로 변경', exact: true }).click();
  await expect(failDialog(page)).toHaveCount(0);
  await row(page).getByRole('button', { name: 'Web Fail — 변경', exact: true }).click();
  await page.getByRole('menuitem', { name: '변경 이력', exact: true }).click();
  await expect(page.getByRole('dialog', { name: '변경 이력', exact: true })).toContainText(
    '수동 판정',
  );
});

test('판정과 항목 수정·삭제 뒤 수정사항의 수와 ready가 갱신된다', async ({ page }) => {
  await page.goto('/qa/sprints/9/fix-reports');
  const web = page.getByRole('region', { name: '웹 수정사항', exact: true });
  await expect(web).toContainText('Fail 0');
  await page
    .getByRole('navigation', { name: 'QA 탭' })
    .getByRole('link', { name: '2차 체크리스트', exact: true })
    .click();
  await row(page).getByRole('button', { name: 'Web Pass — 변경', exact: true }).click();
  await page.getByRole('menuitemcheckbox', { name: 'Fail', exact: true }).click();
  await failDialog(page).getByRole('button', { name: 'Fail로 변경', exact: true }).click();
  await expect(failDialog(page)).toHaveCount(0);
  await fixesLink(page).click();
  await expect(web).toContainText('Fail 1');
  await page
    .getByRole('navigation', { name: 'QA 탭' })
    .getByRole('link', { name: '2차 체크리스트', exact: true })
    .click();
  await row(page).getByRole('button', { name: '수정', exact: true }).click();
  const form = page.getByRole('dialog', { name: '항목 수정', exact: true });
  await form.getByRole('textbox', { name: /^행위/ }).fill('수정된 로그인 버튼 동작');
  await form.getByRole('button', { name: '저장', exact: true }).click();
  await page
    .getByRole('dialog', { name: '항목을 수정할까요?', exact: true })
    .getByRole('button', { name: '수정', exact: true })
    .click();
  await expect(form).toHaveCount(0);
  await fixesLink(page).click();
  await expect(
    page.getByText('남은 미검수: 디자인 0 · 1차 0 · 2차 3', { exact: true }),
  ).toBeVisible();
  await page
    .getByRole('navigation', { name: 'QA 탭' })
    .getByRole('link', { name: '2차 체크리스트', exact: true })
    .click();
  await row(page, '수정된 로그인 버튼 동작')
    .getByRole('button', { name: '삭제', exact: true })
    .click();
  await page
    .getByRole('dialog', { name: '항목을 삭제할까요?', exact: true })
    .getByRole('button', { name: '삭제', exact: true })
    .click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await fixesLink(page).click();
  await expect(web).toContainText('Fail 0');
});

for (const empty of [false, true]) {
  test(`목록 ${empty ? '0개' : '1개 이상'}의 매뉴얼·등록 버튼 위치와 링크 속성`, async ({
    page,
  }) => {
    await page.goto(`/qa/sprints${empty ? '?qaMock=empty' : ''}`);
    const heading = page
      .getByRole('heading', { name: 'QA', exact: true })
      .locator('..')
      .locator('..');
    const manual = heading.getByRole('link', { name: 'QA 매뉴얼', exact: true });
    await expect(manual).toHaveAttribute(
      'href',
      'https://app.notion.com/p/xunxxoie/QA-4165b32f003c80719229f197cec2d97f',
    );
    await expect(manual).toHaveAttribute('target', '_blank');
    await expect(manual).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(heading.getByRole('button', { name: '스프린트 등록', exact: true })).toHaveCount(
      0,
    );
    const list = page.getByRole('region', { name: '스프린트 목록', exact: true });
    const register = list.getByRole('button', { name: '스프린트 등록', exact: true });
    await expect(register).toBeVisible();
    await expect(page.getByRole('button', { name: '스프린트 등록', exact: true })).toHaveCount(1);
    if (!empty) {
      const table = await list.getByRole('table').boundingBox();
      const button = await register.boundingBox();
      expect(button!.y + button!.height).toBeLessThanOrEqual(table!.y);
      expect(button!.x).toBeGreaterThan(table!.x + table!.width / 2);
    }
    await register.click();
    await expect(page.getByRole('dialog', { name: '스프린트 등록', exact: true })).toBeVisible();
  });
}

for (const type of ['1차', '2차', '디자인'] as const) {
  test(`${type} 기존 Fail 사유 수정은 현재 사유를 채우고 빈 값·같은 값은 정상 무변경이다`, async ({
    page,
  }) => {
    const design = type === '디자인';
    const round = type === '1차' ? 1 : 2;
    await page.goto(
      `/qa/sprints/2/${design ? 'design-review?qaMock=auto-fail' : `checklist/${round}`}`,
    );
    const target = group(page).getByRole('row', {
      name: design ? 'WEB 주요 버튼 배치' : '필수 입력 안내',
      exact: true,
    });
    await expect(target).toBeVisible();
    const read = async () => {
      const result = await api(
        page,
        `/sprints/2/${design ? 'design-review' : `checklist?round=${round}`}`,
      );
      const item = result.data.features[0].items[design ? 0 : 1];
      const current = design
        ? item
        : item.cells.find((cell: { part: string }) => cell.part === 'WEB');
      const path = design
        ? `/design-review-items/${item.id}`
        : `/checklist-items/${item.id}/cells/WEB`;
      const history = (await api(page, `${path}/history`)).data;
      return { current, path, history };
    };
    let before = await read();
    const edit = async (input: string) => {
      await target.getByRole('button', { name: 'Web Fail — 변경', exact: true }).click();
      await page.getByRole('menuitem', { name: 'Fail 사유 수정', exact: true }).click();
      await expect(failDialog(page).getByRole('textbox')).toHaveValue(before.current.reason ?? '');
      await expect(failDialog(page)).toContainText('비워 두면 기존 사유가 유지됩니다.');
      await failDialog(page).getByRole('textbox').fill(input);
      const request = page.waitForRequest(
        (req) => req.method() === 'PUT' && req.url().endsWith(before.path),
      );
      await failDialog(page).getByRole('button', { name: 'Fail로 변경', exact: true }).click();
      expect((await request).postDataJSON()).toEqual({
        state: 'FAIL',
        reason: input.trim(),
        version: before.current.version,
      });
      await expect(failDialog(page)).toHaveCount(0);
      await expect(
        target.getByRole('button', { name: 'Web Fail — 변경', exact: true }),
      ).toHaveAttribute('aria-busy', 'false');
    };
    for (const input of [` \n${before.current.reason ?? ''}\t `, ' \n\t ']) {
      await edit(input);
      expect(await read()).toEqual(before);
    }
    await edit('  \n새로 확인한 Fail 사유입니다. \t');
    const saved = await read();
    expect(saved.current).toMatchObject({
      state: 'FAIL',
      reason: '새로 확인한 Fail 사유입니다.',
      version: before.current.version + 1,
      source: 'MANUAL',
    });
    expect(saved.history).toHaveLength(before.history.length + 1);
    expect(saved.history[0].reason).toBe('새로 확인한 Fail 사유입니다.');
    before = saved;
    await edit(' \n\t ');
    expect(await read()).toEqual(saved);
    await edit(' 새로 확인한 Fail 사유입니다. ');
    expect(await read()).toEqual(saved);
    const tooLong = await api(page, before.path, 'PUT', {
      state: 'FAIL',
      reason: ` ${'🙂'.repeat(251)} `,
      version: before.current.version,
    });
    expect(tooLong.status).toBe(400);
    expect(tooLong.data.error).toBe('GLOBAL_4001');
    expect(await read()).toEqual(saved);
    await target.getByRole('button', { name: 'Web Fail — 변경', exact: true }).click();
    await page.getByRole('menuitem', { name: '변경 이력', exact: true }).click();
    await expect(page.getByRole('dialog', { name: '변경 이력', exact: true })).toContainText(
      '새로 확인한 Fail 사유입니다.',
    );
  });
}
