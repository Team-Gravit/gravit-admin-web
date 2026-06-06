import { useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { ROUTES } from '@/shared/constants/routes';
import { useOAuthCallback } from '@/features/auth/hooks';

/**
 * OAuth 콜백 (BACKEND_ADMIN_API_SPEC §8, 라이브 web 미러: /login/oauth2/code/:provider).
 * provider 가 ?code= 로 복귀 → authCode 를 백엔드에 교환 → 토큰+role 처리(role 게이트).
 * StrictMode 이중 호출 방지(ref), code 없으면 실패로 복귀.
 */
export function OAuthCallbackPage() {
  const { provider } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const callback = useOAuthCallback();
  const started = useRef(false);
  const code = params.get('code');

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (provider && code) {
      callback.mutate({ provider, code });
    } else {
      navigate(`${ROUTES.LOGIN}?error=failed`, { replace: true });
    }
    // 마운트 1회만 실행 (콜백 멱등 보장).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <p className="text-body text-fg-muted">로그인 처리 중…</p>;
}
