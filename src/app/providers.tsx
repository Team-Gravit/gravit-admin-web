import type { ReactNode } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { Toaster } from '@/shared/components/ui/sonner';
import { showErrorToast } from '@/shared/api/errorHandler';

/**
 * 앱 전역 프로바이더 (04 §6-6, §11-2).
 * - QueryClient: window focus refetch 비활성, retry 1, staleTime 30s.
 * - 글로벌 onError → showErrorToast (401 은 client.ts 인터셉터가 처리하므로 토스트 생략).
 * - mutation.meta.skipGlobalErrorToast=true 면 토스트 생략(호출측이 인라인 등으로 직접 표시).
 * - Toaster(sonner): 우상단, 3초 dismiss.
 * (OAuth 는 auth-code 리다이렉트 흐름 — provider SDK 프로바이더 불필요. BACKEND_ADMIN_API_SPEC §8.)
 */
function handleGlobalError(error: unknown): void {
  if (isAxiosError(error) && error.response?.status === 401) return;
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
