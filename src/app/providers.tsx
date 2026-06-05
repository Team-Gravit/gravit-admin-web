import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from '@/shared/components/ui/sonner';
import { env } from '@/env';

/**
 * 앱 전역 프로바이더 (04 §6-6, §11-2).
 * - QueryClient: 백오피스 특성상 window focus refetch 비활성, retry 1, staleTime 30s.
 *   (QueryCache/MutationCache 글로벌 onError → showErrorToast 연결은 Step 2 에서 추가)
 * - Toaster(sonner): 우상단, 3초 dismiss.
 * - GoogleOAuthProvider: Google OAuth.
 */
const queryClient = new QueryClient({
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
    <GoogleOAuthProvider clientId={env.VITE_GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster />
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}
