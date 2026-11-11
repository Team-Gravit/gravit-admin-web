import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { AppProviders } from '@/app/providers';
import { env } from '@/env';
import '@/shared/styles/globals.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('루트 엘리먼트(#root)를 찾을 수 없습니다.');
}

async function enableMocking(): Promise<void> {
  if (!import.meta.env.DEV || !env.VITE_USE_MOCK) return;
  const { worker } = await import('@/mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}

void enableMocking().then(async () => {
  // createBrowserRouter의 초기 loader 요청도 MSW 시작 이후에 실행한다.
  const { router } = await import('@/app/router');
  createRoot(rootElement).render(
    <StrictMode>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </StrictMode>,
  );
});
