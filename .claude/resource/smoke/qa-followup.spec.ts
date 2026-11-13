import { expect, test, type Page } from '@playwright/test';

const feature = (page: Page) => page.getByRole('region', { name: 'ACC-01 로그인', exact: true });
const checklistRow = (page: Page) =>
  feature(page).getByRole('row', { name: '로그인 버튼 동작', exact: true });
const designRow = (page: Page) =>
  feature(page).getByRole('row', { name: 'WEB 주요 버튼 배치', exact: true });
async function api(page: Page, path: string, method = 'GET', body?: object) {
  return page.evaluate(
    async ({ path, method, body }) => {
      const response = await fetch(`/qa-api${path}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      return {
        status: response.status,
        data: response.status === 204 ? null : await response.json(),
      };
    },
    { path, method, body },
  );
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('gravit_admin_session', 'true'));
});

test('연결 ref와 공통 범례를 표시하고 성공 툴팁 없이 키보드로 팝오버를 연다', async ({ page }) => {
  await page.goto('/qa/sprints/9/setup');
  const connections = page.getByRole('region', { name: '연결 상태' });
  await expect(connections.getByText('qa-baseline@abc1234', { exact: true })).toHaveCount(3);
  await expect(connections.getByText('(release)', { exact: false })).toHaveCount(0);
  await connections.getByRole('img', { name: '연결됨' }).first().hover();
  await expect(page.getByRole('tooltip')).toHaveCount(0);
  await page.getByRole('button', { name: '상태 아이콘 안내', exact: true }).focus();
  await page.keyboard.press('Enter');
  const legend = page.getByRole('dialog', { name: '상태 아이콘 안내' });
  await expect(legend.getByRole('listitem')).toHaveCount(6);
  await expect(legend.getByText('사람 조치 필요', { exact: true })).toBeVisible();
  await expect(legend).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(legend).toHaveCount(0);
  await expect(page.getByRole('button', { name: '상태 아이콘 안내', exact: true })).toBeFocused();
});

test('실패 사유는 실패 단계 아래 한 번만 보이고 종료 시 6단계가 완료된다', async ({ page }) => {
  await page.goto('/qa/sprints/8/setup');
  await expect(
    page.getByText('APP 저장소 qa-baseline 브랜치가 없습니다.', { exact: true }),
  ).toHaveCount(1);
  await expect(page.getByText('NonRetryableJobException', { exact: false })).toHaveCount(0);
  await expect(
    page
      .getByRole('list', { name: '진행 단계' })
      .getByRole('listitem', { name: '기능 명세서 로드 실패', exact: true }),
  ).toBeVisible();
  await page.goto('/qa/sprints/1/checklist/2');
  const steps = page.getByRole('list', { name: '진행 단계' });
  await expect(steps.getByRole('listitem', { name: /완료$/ })).toHaveCount(6);
  await expect(steps.locator('[aria-current="step"]')).toHaveCount(0);
});

for (const [url, message] of [
  ['/qa/sprints/4/design-review', '디자인 검수 중입니다.'],
  ['/qa/sprints/3/checklist/1', '1차 자동화 검수 중입니다.'],
  ['/qa/sprints/5/checklist/2', '체크리스트를 생성 중입니다.'],
] as const) {
  test(`실행 중 탭 안내: ${message}`, async ({ page }) => {
    await page.goto(url);
    await expect(page.getByRole('status').filter({ hasText: message })).toBeVisible();
    await expect(page.getByText('아직 생성된 항목이 없습니다.')).toHaveCount(0);
  });
}

test('파트 열과 상태 아이콘은 같은 중심에 있고 해당 없음은 자물쇠만 표시한다', async ({ page }) => {
  await page.goto('/qa/sprints/2/checklist/1');
  const row = checklistRow(page);
  for (const part of ['Web', 'APP', 'Server']) {
    const head = await feature(page)
      .getByRole('columnheader', { name: part, exact: true })
      .boundingBox();
    const icon = await row
      .getByRole('button', { name: `${part} Pass — 변경`, exact: true })
      .getByRole('img')
      .boundingBox();
    expect(head).not.toBeNull();
    expect(icon).not.toBeNull();
    expect(Math.abs(head!.x + head!.width / 2 - icon!.x - icon!.width / 2)).toBeLessThan(1);
  }
  const excluded = feature(page)
    .getByRole('row', { name: '실패 후 재시도', exact: true })
    .getByRole('button', { name: 'Server 해당 없음 — 변경 이력', exact: true });
  await expect(excluded.getByRole('img', { name: '해당 없음', exact: true })).toBeVisible();
  await expect(excluded.locator('svg')).toHaveCount(1);
  await expect(excluded).toHaveText('');
  await excluded.focus();
  await expect(page.getByRole('tooltip')).toHaveText('해당 없음');
  await excluded.click();
  await expect(page.getByRole('menuitemcheckbox')).toHaveCount(0);
  await expect(page.getByRole('menuitem', { name: '변경 이력' })).toBeVisible();
});

test('추가는 2차에서만 MANUAL로 보내며 AUTO 항목만 2차로 옮길 수 있다', async ({ page }) => {
  const creates: object[] = [];
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().endsWith('/sprints/2/checklist-items'))
      creates.push(request.postDataJSON());
  });
  await page.goto('/qa/sprints/2/checklist/1');
  await expect(page.getByRole('button', { name: '항목 추가', exact: true })).toHaveCount(0);
  await expect(checklistRow(page)).toBeVisible();
  const auto = (await api(page, '/sprints/2/checklist?round=1')).data.features[0].items[0];
  await checklistRow(page).getByRole('button', { name: '수정', exact: true }).click();
  await page.getByRole('checkbox', { name: '수동(2차)으로 옮기기', exact: true }).check();
  await page
    .getByRole('dialog', { name: '항목 수정', exact: true })
    .getByRole('button', { name: '저장', exact: true })
    .click();
  await page
    .getByRole('dialog', { name: '항목을 수정할까요?' })
    .getByRole('button', { name: '수정', exact: true })
    .click();
  await expect(checklistRow(page)).toHaveCount(0);
  await page
    .getByRole('navigation', { name: 'QA 탭' })
    .getByRole('link', { name: '2차 체크리스트' })
    .click();
  const manual = (await api(page, '/sprints/2/checklist?round=2')).data.features[0].items.find(
    (item: { id: number }) => item.id === auto.id,
  );
  expect(manual.classification).toBe('MANUAL');
  expect(manual.cells.every((cell: { state: string }) => cell.state === 'UNCHECKED')).toBe(true);
  await checklistRow(page).first().getByRole('button', { name: '수정', exact: true }).click();
  await expect(
    page.getByRole('checkbox', { name: '수동(2차)으로 옮기기', exact: true }),
  ).toHaveCount(0);
  await page.getByRole('dialog').getByRole('button', { name: '취소', exact: true }).click();
  expect(
    (
      await api(page, `/checklist-items/${manual.id}`, 'PATCH', {
        classification: 'AUTO',
        version: manual.version,
      })
    ).status,
  ).toBe(400);
  expect(
    (
      await api(page, `/checklist-items/${manual.id}`, 'PATCH', {
        classification: 'MANUAL',
        version: manual.version,
      })
    ).status,
  ).toBe(400);
  await feature(page).getByRole('button', { name: '항목 추가', exact: true }).click();
  const form = page.getByRole('dialog', { name: '항목 추가', exact: true });
  await expect(form.getByRole('combobox')).toHaveCount(0);
  await page.getByLabel(/^행위/).fill('수동 정책 확인');
  await page.getByLabel(/^설명/).fill('직접 작성한 설명');
  await form.getByRole('checkbox', { name: 'Web', exact: true }).check();
  await form.getByRole('button', { name: '추가', exact: true }).click();
  await expect(
    feature(page).getByRole('row', { name: '수동 정책 확인', exact: true }),
  ).toBeVisible();
  expect(creates).toEqual([expect.objectContaining({ classification: 'MANUAL' })]);
  const forced = await api(page, '/sprints/2/checklist-items', 'POST', {
    featureId: 101,
    title: '서버 고정 정책',
    expected: 'AUTO 요청도 MANUAL',
    parts: ['WEB'],
    classification: 'AUTO',
  });
  expect(forced.status).toBe(201);
  expect(forced.data.classification).toBe('MANUAL');
});

test('디자인 내용 수정은 판정을 초기화하고 버전을 올리며 삭제는 버전과 함께 204를 받는다', async ({
  page,
}) => {
  const deletes: string[] = [];
  page.on('request', (request) => {
    if (request.method() === 'DELETE') deletes.push(request.url());
  });
  await page.goto('/qa/sprints/2/design-review');
  await expect(feature(page).getByRole('columnheader')).toHaveText([
    '항목',
    'Web',
    'APP',
    '항목 관리',
  ]);
  const before = (await api(page, '/sprints/2/design-review')).data.features[0].items[0];
  const unchanged = await api(page, `/design-review-items/${before.id}`, 'PATCH', {
    title: before.title,
    version: before.version,
  });
  expect(unchanged.data.version).toBe(before.version);
  expect(unchanged.data.state).toBe('PASS');
  await designRow(page).getByRole('button', { name: '수정', exact: true }).click();
  await page.getByLabel(/^설명/).fill('수정한 디자인 설명');
  await page
    .getByRole('dialog', { name: '디자인 항목 수정', exact: true })
    .getByRole('button', { name: '저장', exact: true })
    .click();
  const confirm = page.getByRole('dialog', { name: '디자인 항목을 수정할까요?' });
  await expect(confirm).toContainText('판정 결과가 미검수로 초기화됩니다.');
  await confirm.getByRole('button', { name: '수정', exact: true }).click();
  await expect(designRow(page)).toContainText('수정한 디자인 설명');
  await expect(
    designRow(page).getByRole('button', { name: 'Web 미검수 — 변경', exact: true }),
  ).toBeVisible();
  const updated = (await api(page, '/sprints/2/design-review')).data.features[0].items[0];
  expect(updated.version).toBe(before.version + 1);
  await designRow(page).getByRole('button', { name: '삭제', exact: true }).click();
  const response = page.waitForResponse((res) => res.request().method() === 'DELETE');
  await page
    .getByRole('dialog', { name: '디자인 항목을 삭제할까요?' })
    .getByRole('button', { name: '삭제', exact: true })
    .click();
  expect((await response).status()).toBe(204);
  await expect(designRow(page)).toHaveCount(0);
  expect(deletes[0]).toContain(`/design-review-items/${before.id}?version=${updated.version}`);
});

for (const mode of ['legacy', 'current'] as const) {
  test(`${mode} 서버 셀·이력에서 사유만 표시하고 출처는 한 번 표시한다`, async ({ page }) => {
    await page.goto(`/qa/sprints/2/checklist/1${mode === 'legacy' ? '?qaMock=legacy' : ''}`);
    await checklistRow(page).getByRole('button', { name: 'Web Pass — 변경', exact: true }).click();
    await page.getByRole('menuitem', { name: '변경 이력', exact: true }).click();
    const history = page.getByRole('dialog', { name: '변경 이력', exact: true });
    await expect(history).toContainText('qa-baseline 코드에서 명세');
    await expect(history.getByText('자동 판정', { exact: false })).toHaveCount(1);
    await expect(history).not.toContainText('src/auth/login.ts');
    await expect(history).toHaveCSS('max-width', '768px');
    await expect.poll(async () => Math.round((await history.boundingBox())!.width)).toBe(768);
    const raw = (await api(page, '/sprints/2/checklist?round=1')).data.features[0].items[0]
      .cells[0];
    if (mode === 'legacy') expect(raw.evidence).toBeUndefined();
    else expect(raw.evidence).toEqual([{ path: 'src/auth/login.ts', startLine: 12, endLine: 28 }]);
    await history.getByRole('button', { name: '닫기' }).click();
    await checklistRow(page).getByRole('button', { name: 'Web Pass — 변경', exact: true }).click();
    await expect(page.getByRole('menuitem', { name: '변경 이력', exact: true })).toBeVisible();
  });
}

for (const operation of ['수정', '삭제'] as const) {
  test(`디자인 ${operation} 버전 충돌은 재조회 후 확인창을 닫고 원래 항목을 유지한다`, async ({
    page,
  }) => {
    await page.goto('/qa/sprints/2/design-review?qaMock=stale');
    await designRow(page).getByRole('button', { name: operation, exact: true }).click();
    if (operation === '수정') {
      await page.getByLabel(/^설명/).fill('충돌한 디자인 설명');
      await page
        .getByRole('dialog', { name: '디자인 항목 수정', exact: true })
        .getByRole('button', { name: '저장', exact: true })
        .click();
    }
    await page
      .getByRole('dialog', {
        name: operation === '수정' ? '디자인 항목을 수정할까요?' : '디자인 항목을 삭제할까요?',
      })
      .getByRole('button', { name: operation, exact: true })
      .click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(
      page.getByText('다른 운영자가 먼저 변경했습니다. 최신 내용을 다시 불러왔습니다.', {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      designRow(page).getByRole('button', { name: 'Web Pass — 변경', exact: true }),
    ).toBeVisible();
    await expect(designRow(page)).not.toContainText('충돌한 디자인 설명');
  });
}

for (const operation of ['판정', '수정', '삭제'] as const) {
  test(`옛 서버의 디자인 ${operation} 400·404는 오류를 안내하고 항목을 유지한다`, async ({
    page,
  }) => {
    await page.goto('/qa/sprints/2/design-review?qaMock=legacy');
    const target = designRow(page);
    if (operation === '판정') {
      await target.getByRole('button', { name: 'Web Pass — 변경', exact: true }).click();
      await page.getByRole('menuitemcheckbox', { name: '해당 없음', exact: true }).click();
      await expect(page.getByText('요청 형식이 올바르지 않습니다.', { exact: true })).toBeVisible();
      await expect(
        target.getByRole('button', { name: 'Web Pass — 변경', exact: true }),
      ).toBeVisible();
    } else {
      await target.getByRole('button', { name: operation, exact: true }).click();
      if (operation === '수정') {
        await page.getByLabel(/^설명/).fill('옛 서버 수정');
        await page
          .getByRole('dialog', { name: '디자인 항목 수정', exact: true })
          .getByRole('button', { name: '저장', exact: true })
          .click();
      }
      const dialog = page.getByRole('dialog', {
        name: operation === '수정' ? '디자인 항목을 수정할까요?' : '디자인 항목을 삭제할까요?',
      });
      await dialog.getByRole('button', { name: operation, exact: true }).click();
      await expect(dialog.getByRole('alert')).toHaveText('대상을 찾을 수 없습니다.');
      await expect(dialog).toBeVisible();
      const preserved = (await api(page, '/sprints/2/design-review')).data.features[0].items[0];
      expect(preserved.title).toBe('주요 버튼 배치');
      expect(preserved.state).toBe('PASS');
    }
  });
}

for (const type of ['셀', '디자인'] as const) {
  for (const outcome of ['delay', 'fail'] as const) {
    test(`${type} 판정 ${outcome}: 저장 중 이전 상태를 유지하고 회전 표시를 추가하지 않는다`, async ({
      page,
    }) => {
      await page.goto(
        `/qa/sprints/2/${type === '셀' ? 'checklist/1' : 'design-review'}?qaMock=verdict-${outcome}`,
      );
      const target = type === '셀' ? checklistRow(page) : designRow(page);
      // Dialog intentionally hides the background from the accessibility tree;
      // inspect its existing status indicator through the DOM while saving.
      const previous = page.locator(
        `section[aria-label="ACC-01 로그인"] tr[aria-label="${type === '셀' ? '로그인 버튼 동작' : 'WEB 주요 버튼 배치'}"] button[aria-label="Web Pass — 변경"]`,
      );
      await previous.click();
      await page.getByRole('menuitemcheckbox', { name: 'Fail', exact: true }).click();
      await expect(previous).toHaveAttribute('aria-busy', 'false');
      await page
        .getByRole('dialog', { name: 'Fail 사유', exact: true })
        .getByRole('button', { name: 'Fail로 변경', exact: true })
        .click();
      await expect(previous).toHaveAttribute('aria-busy', 'true');
      await expect(
        previous.getByRole('img', { name: 'Pass', exact: true, includeHidden: true }),
      ).toBeVisible();
      await expect(previous.locator('.opacity-40')).toHaveCount(1);
      await expect(previous.locator('.animate-spin')).toHaveCount(0);
      if (outcome === 'delay')
        await expect(
          target.getByRole('button', { name: 'Web Fail — 변경', exact: true }),
        ).toHaveAttribute('aria-busy', 'false');
      else {
        await expect(
          page.getByRole('dialog', { name: 'Fail 사유', exact: true }).getByRole('alert'),
        ).toHaveText('판정을 저장하지 못했습니다. 다시 시도해 주세요.');
        await expect(previous).toHaveAttribute('aria-busy', 'false');
      }
    });
  }
}

for (const url of ['/qa/sprints', '/staging/labels/2026-04-25-update']) {
  test(`공용 모달은 등장 중에도 중앙에 있고 Escape로 닫힌다: ${url}`, async ({ page }) => {
    await page.goto(url);
    await page
      .getByRole('button', { name: url === '/qa/sprints' ? '스프린트 등록' : '반영 완료 처리' })
      .first()
      .click();
    await expect(page.getByRole('dialog')).toBeVisible();
    const offsets = await page.getByRole('dialog').evaluate(async (dialog) => {
      const offsets: number[] = [];
      for (let i = 0; i < 14; i++) {
        const rect = dialog.getBoundingClientRect();
        offsets.push(
          Math.abs(rect.x + rect.width / 2 - innerWidth / 2),
          Math.abs(rect.y + rect.height / 2 - innerHeight / 2),
        );
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      }
      return offsets;
    });
    expect(Math.max(...offsets)).toBeLessThan(2);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });
}

test('reduced motion에서는 진행도가 즉시 최종값이며 모달 애니메이션을 생략한다', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/qa/sprints/2/checklist/1');
  await expect(page.getByRole('meter')).toHaveCount(4);
  const sprint = await api(page, '/sprints/2');
  for (const [index, name] of ['Design', 'Web', 'APP', 'Server'].entries()) {
    const progress = sprint.data.progress[index];
    const percent = Math.round((progress.checked / progress.total) * 100);
    await expect(page.getByRole('meter', { name: `${name} 완료율`, exact: true })).toHaveText(
      `${percent}%`,
    );
  }
  await checklistRow(page).getByRole('button', { name: '수정', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCSS('animation-name', 'none');
});
