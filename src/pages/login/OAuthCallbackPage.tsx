import { useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { ROUTES } from '@/shared/constants/routes';
import { useOAuthCallback } from '@/features/auth/hooks';
import { consumePendingOAuthState } from '@/features/auth/oauthState';
import { providerIdSchema } from '@/features/auth/schemas';

export function OAuthCallbackPage() {
  const { provider } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { mutate } = useOAuthCallback();
  const started = useRef(false);
  const code = params.get('code');
  const state = params.get('state');
  const error = params.get('error');

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const parsedProvider = providerIdSchema.safeParse(provider?.toUpperCase());
    const validState = consumePendingOAuthState(
      parsedProvider.success ? parsedProvider.data : undefined,
      state,
    );
    if (!error && parsedProvider.success && code && state && validState) {
      mutate({ provider: parsedProvider.data, code, state });
    } else {
      navigate(`${ROUTES.LOGIN}?error=failed`, { replace: true });
    }
  }, [provider, code, state, error, mutate, navigate]);

  return <p className="text-body text-fg-muted">로그인 처리 중…</p>;
}
