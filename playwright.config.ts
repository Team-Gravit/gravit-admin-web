import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright e2e 설정 (tests/e2e).
 * MSW 는 `DEV && VITE_USE_MOCK` 일 때만 활성 → webServer.env 로 VITE_USE_MOCK=true 를 주입해 목 백엔드로 검증.
 * 실행: npm run test:e2e:install (최초 1회) → npm run test:e2e
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // e2e 는 MSW 목으로 검증 — 실서버 기본값을 덮어써 목 강제(Playwright 가 process.env 와 병합).
    env: { VITE_USE_MOCK: 'true' },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
