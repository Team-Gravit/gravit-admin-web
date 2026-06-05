import gravitLogo from '@/features/auth/assets/gravit-logo.svg';
import loginIllustration from '@/features/auth/assets/login-illustration.png';
import { OAuthButtons } from '@/features/auth/components/OAuthButtons';
import { useLogin } from '@/features/auth/hooks';
import type { ProviderId } from '@/features/auth/types';
import type { ErrorResponse } from '@/shared/api/types';
import { AxiosError } from 'axios';

/**
 * 로그인 실패 메시지 (DS-02 §1-4, 03 §3-1). 백엔드 message 우선, 없으면 명세 기본 문구.
 */
function loginErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const message = (error.response?.data as Partial<ErrorResponse> | undefined)?.message;
    if (typeof message === 'string' && message.length > 0) return message;
  }
  return '백오피스 접근 권한이 없습니다.';
}

/**
 * LOGIN (Figma node 8788:1984, decisions D5). 2-패널 카드:
 *  - 좌: 일러스트(LOGIN 전용 에셋)
 *  - 우: Gravit 로고 + "Admin Page" / "백오피스 로그인" / 설명 / OAuth 3버튼 / (실패 시) 에러
 * 데스크탑 단일폭(반응형 없음). 401 → mutation.error → 카드 하단 표시(토스트 아님).
 */
export function LoginPage() {
  const login = useLogin();

  const handleLogin = (providerId: ProviderId, idToken: string) => {
    login.mutate({ providerId, idToken });
  };

  return (
    <div className="flex w-full max-w-5xl overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
      {/* 좌: 일러스트 (Figma 8788:7437 — LOGIN 전용 에셋) */}
      <div className="w-1/2 shrink-0">
        <img src={loginIllustration} alt="" className="h-full w-full object-cover" />
      </div>

      {/* 우: 로그인 패널 */}
      <div className="flex w-1/2 flex-col justify-center gap-16 px-12 py-16">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <img src={gravitLogo} alt="Gravit" className="h-6 w-24" />
            <span className="text-h1 font-medium text-fg-secondary">Admin Page</span>
          </div>
          <h2 className="text-display text-foreground">백오피스 로그인</h2>
          <p className="text-h2 font-medium text-muted-foreground">내부 운영자 전용 관리 시스템</p>
        </div>

        <OAuthButtons onLogin={handleLogin} disabled={login.isPending} />

        {login.isError && (
          <p className="text-caption text-destructive">{loginErrorMessage(login.error)}</p>
        )}
      </div>
    </div>
  );
}
