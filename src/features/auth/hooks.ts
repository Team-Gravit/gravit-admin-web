import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ROUTES } from '@/shared/constants/routes';
import { tokenManager } from '@/shared/api/tokenManager';
import { authApi } from '@/features/auth/api';
import { useAuthStore } from '@/features/auth/store';
import type { LoginRequest } from '@/features/auth/types';

/**
 * 로그인 (04 §7-1). 성공 → 토큰 저장 후 대시보드 이동.
 * 401(idToken 실패/role=USER)은 LOGIN 페이지가 mutation.error 로 카드 하단에 표시
 * (authApiClient 는 인터셉터 미경유, 글로벌 onError 는 401 토스트 생략).
 */
export function useLogin() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (body: LoginRequest) => authApi.login(body),
    onSuccess: (tokens) => {
      tokenManager.setTokens(tokens.accessToken, tokens.refreshToken);
      navigate(ROUTES.DASHBOARD, { replace: true });
    },
  });
}

/**
 * 로그아웃 (04 §7-4). 서버 무효화(best-effort) → 로컬 정리 → 캐시 비움 → /login.
 */
export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const reset = useAuthStore((s) => s.reset);

  return useCallback(async () => {
    const refreshToken = tokenManager.getRefreshToken();
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // best-effort: 서버 실패해도 로컬 로그아웃은 진행
      }
    }
    tokenManager.clear();
    reset();
    queryClient.clear();
    navigate(ROUTES.LOGIN, { replace: true });
  }, [navigate, queryClient, reset]);
}

/**
 * 현재 운영자 (04 §7-2). GET /admin/me 미구현(D4) → store 의 admin(현재 null) 반환.
 */
export function useCurrentAdmin() {
  return useAuthStore((s) => s.admin);
}
