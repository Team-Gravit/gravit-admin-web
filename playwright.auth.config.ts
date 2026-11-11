import { defineConfig, devices } from '@playwright/test';

/** 외부 API를 대체하고 실제 브라우저의 쿠키 전송과 OAuth 콜백을 검증한다. */
export default defineConfig({
  testDir: './tests/auth',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5174',
    serviceWorkers: 'block',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev -- --port 5174 --strictPort',
    url: 'http://localhost:5174/login',
    reuseExistingServer: false,
    env: {
      VITE_USE_MOCK: 'false',
      // 다른 origin으로 호출해 withCredentials 누락도 검출한다.
      VITE_API_HOST: 'http://localhost:5175',
      VITE_OAUTH_DEST: 'local',
      VITE_RAVVIT_API_BASE: '/ravvit-api',
    },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
