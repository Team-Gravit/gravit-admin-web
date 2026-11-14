import { expect, test, type Page, type Request } from '@playwright/test';

const APP_ORIGIN = 'http://localhost:5174';
const API_ORIGIN = 'http://localhost:5175';
const SESSION_KEY = 'gravit_admin_session';
const PENDING_STATE_KEY = 'gravit_admin_pending_oauth_state';
const LEGACY_TOKEN_KEY = 'gravit_admin_refresh_token';

interface BackendOptions {
  role?: 'ADMIN' | 'USER';
  reissueStatus?: number;
  meStatus?: number;
  expireDashboardToken?: boolean;
}

async function mockBackend(page: Page, options: BackendOptions = {}) {
  const requests: Request[] = [];
  await page.route(`${API_ORIGIN}/api/v1/**`, async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    requests.push(request);
    const headers = {
      'Access-Control-Allow-Origin': APP_ORIGIN,
      'Access-Control-Allow-Credentials': 'true',
    };
    const json = (body: unknown, status = 200, extraHeaders: Record<string, string> = {}) =>
      route.fulfill({ status, json: body, headers: { ...headers, ...extraHeaders } });

    if (path.startsWith('/api/v1/oauth/login-url/')) {
      const provider = path.split('/').at(-1);
      await json({
        loginUrl: `${APP_ORIGIN}/login/oauth2/code/${provider}?code=test-code&state=test-state`,
        state: 'test-state',
      });
    } else if (path.startsWith('/api/v1/oauth/')) {
      await json(
        { accessToken: 'test-access-token', isOnboarded: true, role: options.role ?? 'ADMIN' },
        200,
        {
          'Set-Cookie':
            'refreshToken=test-refresh-cookie; HttpOnly; Path=/api/v1/auth; SameSite=Lax',
        },
      );
    } else if (path === '/api/v1/auth/reissue') {
      const status = options.reissueStatus ?? 200;
      await json(
        status === 200 ? { accessToken: 'renewed-access-token' } : { message: '세션 만료' },
        status,
      );
    } else if (path === '/api/v1/auth/logout') {
      await route.fulfill({
        status: 204,
        headers: {
          ...headers,
          'Set-Cookie': 'refreshToken=; Max-Age=0; HttpOnly; Path=/api/v1/auth; SameSite=Lax',
        },
      });
    } else if (path === '/api/v1/admin/me') {
      await json(
        { adminId: 1, nickname: '테스트 관리자', email: 'admin@example.com', profileImgNumber: 1 },
        options.meStatus ?? 200,
      );
    } else if (
      options.expireDashboardToken &&
      (await request.headerValue('authorization')) === 'Bearer test-access-token'
    ) {
      await json({ message: '토큰 만료' }, 401);
    } else if (path === '/api/v1/admin/dashboard/summary') {
      await json({ totalUsers: 1, pendingLabelsCount: 0, unresolvedReportsCount: 0 });
    } else {
      await json({ points: [] });
    }
  });
  return requests;
}

function requestsAt(requests: Request[], path: string) {
  return requests.filter((request) => new URL(request.url()).pathname === `/api/v1${path}`);
}

async function seedPendingState(page: Page, pending: unknown) {
  await page.goto('/login');
  await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), {
    key: PENDING_STATE_KEY,
    value: pending,
  });
}

for (const [provider, label] of [
  ['google', 'Google로 시작하기'],
  ['kakao', '카카오로 시작하기'],
  ['naver', '네이버로 시작하기'],
]) {
  test(`${provider}: state와 코드를 한 번 교환하고 refreshToken 없이 로그인한다`, async ({
    page,
    context,
  }) => {
    const requests = await mockBackend(page);
    await page.goto('/login');
    await page.getByRole('button', { name: label }).click();
    await expect(page.getByRole('heading', { name: '대시보드', exact: true })).toBeVisible();

    const exchanges = requestsAt(requests, `/oauth/${provider}`);
    expect(exchanges).toHaveLength(1);
    expect(exchanges[0]?.postDataJSON()).toEqual({ code: 'test-code', state: 'test-state' });
    expect(new URL(exchanges[0]!.url()).searchParams.get('dest')).toBe('local');
    expect(await page.evaluate((key) => localStorage.getItem(key), SESSION_KEY)).toBe('true');
    expect(await page.evaluate((key) => localStorage.getItem(key), PENDING_STATE_KEY)).toBeNull();
    expect(await page.evaluate((key) => localStorage.getItem(key), LEGACY_TOKEN_KEY)).toBeNull();
    expect(await context.cookies(`${API_ORIGIN}/api/v1/auth/reissue`)).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'refreshToken', httpOnly: true })]),
    );
    expect(await page.evaluate(() => document.cookie)).not.toContain('refreshToken');

    await page.reload();
    await expect(page.getByRole('heading', { name: '대시보드', exact: true })).toBeVisible();
    const reissues = requestsAt(requests, '/auth/reissue');
    expect(reissues).toHaveLength(1);
    expect(reissues[0]?.postData()).toBeNull();
    expect(await reissues[0]?.headerValue('cookie')).toContain('refreshToken=test-refresh-cookie');
  });
}

for (const scenario of [
  { name: 'state 누락', query: 'code=test-code', pending: true },
  { name: 'state 불일치', query: 'code=test-code&state=other-state', pending: true },
  { name: '시작하지 않은 로그인', query: 'code=test-code&state=test-state', pending: false },
  { name: '코드 누락', query: 'state=test-state', pending: true },
  {
    name: '제공자 오류',
    query: 'code=test-code&state=test-state&error=access_denied',
    pending: true,
  },
  { name: '만료된 state', query: 'code=test-code&state=test-state', pending: true, age: 600_001 },
  {
    name: '다른 제공자',
    query: 'code=test-code&state=test-state',
    pending: true,
    provider: 'GOOGLE',
  },
  {
    name: '잘못된 제공자',
    query: 'code=test-code&state=test-state',
    pending: true,
    path: 'unknown',
  },
]) {
  test(`${scenario.name}: 토큰 교환 없이 실패 화면으로 돌아간다`, async ({ page }) => {
    const requests = await mockBackend(page);
    await seedPendingState(
      page,
      scenario.pending
        ? {
            provider: scenario.provider ?? 'KAKAO',
            state: 'test-state',
            createdAt: Date.now() - (scenario.age ?? 0),
          }
        : null,
    );
    await page.goto(`/login/oauth2/code/${scenario.path ?? 'kakao'}?${scenario.query}`);
    await expect(page).toHaveURL(`${APP_ORIGIN}/login?error=failed`);
    expect(requests.filter((request) => request.method() === 'POST')).toHaveLength(0);
    expect(await page.evaluate((key) => localStorage.getItem(key), PENDING_STATE_KEY)).toBeNull();
  });
}

test('일반 계정은 로그인 응답을 받아도 관리자 페이지에 진입하지 못한다', async ({ page }) => {
  await mockBackend(page, { role: 'USER' });
  await page.goto('/login');
  await page.getByRole('button', { name: '카카오로 시작하기' }).click();
  await expect(page).toHaveURL(`${APP_ORIGIN}/login?error=forbidden`);
  await expect(page.getByText('백오피스 접근 권한이 없어요.')).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), SESSION_KEY)).toBeNull();
});

test('만료된 쿠키로 세션 복원에 실패하면 세션 힌트를 지우고 로그인으로 이동한다', async ({
  page,
}) => {
  const requests = await mockBackend(page, { reissueStatus: 401 });
  await page.goto('/login');
  await page.evaluate((key) => localStorage.setItem(key, 'true'), SESSION_KEY);
  await page.goto('/');
  await expect(page).toHaveURL(`${APP_ORIGIN}/login`);
  expect(requestsAt(requests, '/auth/reissue')).toHaveLength(1);
  expect(await page.evaluate((key) => localStorage.getItem(key), SESSION_KEY)).toBeNull();
});

test('세션 복원 후 관리자 권한이 없으면 접근을 차단한다', async ({ page }) => {
  await mockBackend(page, { meStatus: 403 });
  await page.goto('/login');
  await page.evaluate((key) => localStorage.setItem(key, 'true'), SESSION_KEY);
  await page.goto('/');
  await expect(page).toHaveURL(`${APP_ORIGIN}/login?error=forbidden`);
  expect(await page.evaluate((key) => localStorage.getItem(key), SESSION_KEY)).toBeNull();
});

test('기존 localStorage refreshToken으로 로그인하지 않고 이전 토큰을 지운다', async ({ page }) => {
  const requests = await mockBackend(page);
  await page.goto('/login');
  await page.evaluate((key) => localStorage.setItem(key, 'legacy-token'), LEGACY_TOKEN_KEY);
  await page.goto('/');
  await expect(page).toHaveURL(`${APP_ORIGIN}/login`);
  expect(requestsAt(requests, '/auth/reissue')).toHaveLength(0);
  expect(await page.evaluate((key) => localStorage.getItem(key), LEGACY_TOKEN_KEY)).toBeNull();
});

test('로그아웃은 쿠키를 서버에서 만료시키고 새로고침 후에도 세션을 복원하지 않는다', async ({
  page,
  context,
}) => {
  const requests = await mockBackend(page);
  await page.goto('/login');
  await page.getByRole('button', { name: '카카오로 시작하기' }).click();
  await page.getByRole('button', { name: '로그아웃', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: '로그아웃', exact: true }).click();
  await expect(page).toHaveURL(`${APP_ORIGIN}/login`);
  await expect.poll(() => requestsAt(requests, '/auth/logout').length).toBe(1);
  const logout = requestsAt(requests, '/auth/logout')[0]!;
  expect(logout.postData()).toBeNull();
  expect(await logout.headerValue('cookie')).toContain('refreshToken=test-refresh-cookie');
  await expect.poll(() => context.cookies(`${API_ORIGIN}/api/v1/auth/reissue`)).toEqual([]);
  await page.goto('/');
  await expect(page).toHaveURL(`${APP_ORIGIN}/login`);
  expect(requestsAt(requests, '/auth/reissue')).toHaveLength(0);
});

test('여러 API의 401은 하나의 쿠키 재발급을 공유한다', async ({ page }) => {
  const requests = await mockBackend(page, { expireDashboardToken: true });
  await page.goto('/login');
  await page.getByRole('button', { name: '카카오로 시작하기' }).click();
  await expect(page.getByText('총 유저 수', { exact: true })).toBeVisible();
  await expect
    .poll(() => requestsAt(requests, '/admin/dashboard/active-users/monthly').length)
    .toBe(2);
  expect(requestsAt(requests, '/auth/reissue')).toHaveLength(1);
  expect(requestsAt(requests, '/auth/reissue')[0]?.postData()).toBeNull();
});
