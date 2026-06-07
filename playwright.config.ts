import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright 스모크 설정 (Step 7 QA, 최고위험 3흐름).
 * MSW 는 `DEV && VITE_USE_MOCK` 일 때만 활성 → webServer.env 로 VITE_USE_MOCK=true 를 주입해 목 백엔드로 검증.
 * 실행: npm i -D @playwright/test && npx playwright install chromium && npx playwright test
 *  (또는 bash .claude/hooks/checks/gate-runner.sh --with-smoke)
 */
export default defineConfig({
  testDir: '.claude/resource/smoke',
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
    // 스모크는 MSW 목으로 검증 — 실서버 기본값을 덮어써 목 강제(Playwright 가 process.env 와 병합).
    env: { VITE_USE_MOCK: 'true' },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
