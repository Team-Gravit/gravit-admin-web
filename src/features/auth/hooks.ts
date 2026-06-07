import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ROUTES } from '@/shared/constants/routes';
import { tokenManager } from '@/shared/api/tokenManager';
import { authApi } from '@/features/auth/api';
import { useAuthStore } from '@/features/auth/store';
import type { ProviderId } from '@/features/auth/types';

/**
 * OAuth 시작 (BACKEND_ADMIN_API_SPEC §8, 라이브 web 미러).
 * 버튼 클릭 → login-url 획득 → provider 로그인 페이지로 리다이렉트.
 */
export function useStartOAuth() {
  return useMutation({
    mutationFn: (provider: ProviderId) => authApi.getLoginUrl(provider),
    // 실패는 우상단 토스트 대신 로그인 카드 하단 인라인 메시지로 표시(LoginPage).
    meta: { skipGlobalErrorToast: true },
    onSuccess: (loginUrl) => {
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
    mutationFn: ({ provider, code }: { provider: string; code: string }) =>
      authApi.oauthLogin(provider, code),
    onSuccess: (res) => {
      if (res.role !== 'ADMIN') {
        tokenManager.clear();
        navigate(`${ROUTES.LOGIN}?error=forbidden`, { replace: true });
        return;
      }
      tokenManager.setTokens(res.accessToken, res.refreshToken);
      navigate(ROUTES.DASHBOARD, { replace: true });
    },
    onError: () => {
      navigate(`${ROUTES.LOGIN}?error=failed`, { replace: true });
    },
  });
}

/**
 * 로그아웃 (BACKEND_ADMIN_API_SPEC §8). 서버 엔드포인트 없음 → 로컬 정리 → 캐시 비움 → /login.
 */
export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const reset = useAuthStore((s) => s.reset);

  return useCallback(() => {
    tokenManager.clear();
    reset();
    queryClient.clear();
    navigate(ROUTES.LOGIN, { replace: true });
  }, [navigate, queryClient, reset]);
}

/**
 * 현재 운영자 (04 §7-2). store 의 admin 반환(부트스트랩에서 GET /admin/me 로 채움, BACKEND_ADMIN_API_SPEC §4-0).
 */
export function useCurrentAdmin() {
  return useAuthStore((s) => s.admin);
}
