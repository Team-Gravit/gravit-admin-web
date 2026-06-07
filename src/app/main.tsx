import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { AppProviders } from '@/app/providers';
import { router } from '@/app/router';
import { env } from '@/env';
import '@/shared/styles/globals.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('루트 엘리먼트(#root)를 찾을 수 없습니다.');
}

/**
 * MSW 목 활성화 — `DEV && VITE_USE_MOCK` 일 때만. 기본(VITE_USE_MOCK 미설정)은 **실서버 연동**.
 * 프로덕션 번들 제외(동적 import + DEV 가드). 목으로 띄우려면 `VITE_USE_MOCK=true npm run dev`.
 */
async function enableMocking(): Promise<void> {
  if (!import.meta.env.DEV || !env.VITE_USE_MOCK) return;
  const { worker } = await import('@/mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}

void enableMocking().then(() => {
  createRoot(rootElement).render(
    <StrictMode>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </StrictMode>,
  );
});
