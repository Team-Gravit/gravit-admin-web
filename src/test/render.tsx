import type { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { TooltipProvider } from '@/shared/components/ui/tooltip';

/**
 * 컴포넌트 테스트용 render. 테스트마다 새 QueryClient(재시도 없음)와 TooltipProvider 로 감싼다.
 * 네트워크가 필요한 테스트는 msw/node 의 setupServer 로 src/mocks 핸들러를 재사용한다.
 */
export function renderWithProviders(ui: ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <TooltipProvider>{children}</TooltipProvider>
    </QueryClientProvider>
  );
  return { client, ...render(ui, { wrapper }) };
}
