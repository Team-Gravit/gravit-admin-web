import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { Toaster } from '@/shared/components/ui/sonner';
import { showErrorToast } from '@/shared/api/errorHandler';
import { QaApiError } from '@/shared/api/qaClient';

function handleGlobalError(error: unknown): void {
  if (isAxiosError(error) && error.response?.status === 401) return;
  // QA: 재발급 실패 → 강제 로그아웃이 이미 안내했다. 재발급 후에도 401 이면 로그아웃 없이 오류로 알린다(D9-3).
  if (error instanceof QaApiError && error.sessionEnded) return;
  showErrorToast(error);
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleGlobalError }),
  mutationCache: new MutationCache({
    onError: (error, _vars, _ctx, mutation) => {
      if (mutation.meta?.skipGlobalErrorToast) return;
      handleGlobalError(error);
    },
  }),
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
    </QueryClientProvider>
  );
}
