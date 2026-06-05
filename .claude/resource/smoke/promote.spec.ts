// Playwright 스모크 템플릿 — QA(Step 7)에서 실제 셀렉터로 채운다. 최고위험 흐름 전용(결정 ①).
import { expect, test } from '@playwright/test';

test.describe('promote (최고위험 흐름)', () => {
  test.fixme('TODO: 빌드된 앱 셀렉터로 구현', async ({ page }) => {
    // promote: 명세 시나리오는 spec/04 §11-8 참조
    await page.goto('/');
    expect(true).toBe(true);
  });
});
