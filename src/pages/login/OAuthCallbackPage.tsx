import { useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { ROUTES } from '@/shared/constants/routes';
import { useOAuthCallback } from '@/features/auth/hooks';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <p className="text-body text-fg-muted">로그인 처리 중…</p>;
}
