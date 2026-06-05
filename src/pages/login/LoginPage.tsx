import { AxiosError } from 'axios';
import { useLogin } from '@/features/auth/hooks';
import { OAuthButtons } from '@/features/auth/components/OAuthButtons';
import type { ProviderId } from '@/features/auth/types';
import type { ErrorResponse } from '@/shared/api/types';

/**
 * 로그인 실패 메시지 (DS-02 §1-4, 03 §3-1).
 * 백엔드 message 우선(에러 envelope), 없으면 명세 기본 문구.
 */
function loginErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const message = (error.response?.data as Partial<ErrorResponse> | undefined)?.message;
    if (typeof message === 'string' && message.length > 0) return message;
  }
  return '백오피스 접근 권한이 없습니다.';
}

/**
 * LOGIN (DS-02 §1, 01 §4-1). 400px 카드: 로고 + h2 + OAuth 3버튼 + (실패 시) 카드 하단 에러.
 * 401(idToken 실패/role=USER, 03 §3-1) → mutation.error → 카드 하단 표시(토스트 아님).
 */
export function LoginPage() {
  const login = useLogin();

  const handleLogin = (providerId: ProviderId, idToken: string) => {
    login.mutate({ providerId, idToken });
  };

  return (
    <div className="w-full max-w-login-card rounded-lg border border-border bg-surface p-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-h3 font-semibold text-foreground">Gravit Admin</span>
          <h2 className="text-h2 text-foreground">백오피스 로그인</h2>
        </div>

        <OAuthButtons onLogin={handleLogin} disabled={login.isPending} />

        {login.isError && (
          <p className="text-center text-caption text-destructive">
            {loginErrorMessage(login.error)}
          </p>
        )}
      </div>
    </div>
  );
}
