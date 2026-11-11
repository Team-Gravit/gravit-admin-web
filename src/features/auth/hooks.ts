import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ROUTES } from '@/shared/constants/routes';
import { tokenManager } from '@/shared/api/tokenManager';
import { authApi } from '@/features/auth/api';
import { useAuthStore } from '@/features/auth/store';
import { savePendingOAuthState } from '@/features/auth/oauthState';
import type { ProviderId } from '@/features/auth/types';

export function useStartOAuth() {
  return useMutation({
    mutationFn: (provider: ProviderId) => authApi.getLoginUrl(provider),
    meta: { skipGlobalErrorToast: true },
    onSuccess: ({ loginUrl, state }, provider) => {
      savePendingOAuthState(provider, state);
      window.location.href = loginUrl;
    },
  });
}

/**
 * OAuth 콜백 처리. authCode → 토큰 + role.
 * role 게이트: ADMIN 만 토큰 저장 후 진입, 그 외(USER)는 토큰 폐기 + 권한없음으로 복귀.
 * (보안은 매 요청 /admin/** 403 이 보장 — 여기 차단은 UX.)
 */
export function useOAuthCallback() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: ({
      provider,
      code,
      state,
    }: {
      provider: ProviderId;
      code: string;
      state: string;
    }) => authApi.oauthLogin(provider, code, state),
    retry: false,
    meta: { skipGlobalErrorToast: true },
    onSuccess: (res) => {
      if (res.role !== 'ADMIN') {
        tokenManager.clear();
        navigate(`${ROUTES.LOGIN}?error=forbidden`, { replace: true });
        return;
      }
      tokenManager.setAccessToken(res.accessToken);
      navigate(ROUTES.DASHBOARD, { replace: true });
    },
    onError: () => {
      navigate(`${ROUTES.LOGIN}?error=failed`, { replace: true });
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const reset = useAuthStore((s) => s.reset);

  return useCallback(() => {
    tokenManager.clear();
    reset();
    queryClient.clear();
    navigate(ROUTES.LOGIN, { replace: true });
    // 힌트를 먼저 지워 요청이 실패해도 새로고침으로 세션이 복원되지 않게 한다.
    void authApi.logout().catch((error: unknown) => {
      console.warn('서버 로그아웃 요청에 실패했습니다.', error);
    });
  }, [navigate, queryClient, reset]);
}

export function useCurrentAdmin() {
  return useAuthStore((s) => s.admin);
}
