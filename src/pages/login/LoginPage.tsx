import { useSearchParams } from 'react-router';
import gravitLogo from '@/features/auth/assets/gravit-logo.svg';
import loginIllustration from '@/features/auth/assets/login-illustration.png';
import { OAuthButtons } from '@/features/auth/components/OAuthButtons';
import { useStartOAuth } from '@/features/auth/hooks';
import type { ProviderId } from '@/features/auth/types';

const ERROR_MESSAGES: Record<string, string> = {
  forbidden: '백오피스 접근 권한이 없습니다.',
  failed: '로그인에 실패했습니다. 다시 시도해주세요.',
};

export function LoginPage() {
  const startOAuth = useStartOAuth();
  const [params] = useSearchParams();
  const errorKey = params.get('error');
  const errorMessage = errorKey
    ? (ERROR_MESSAGES[errorKey] ?? ERROR_MESSAGES.failed)
    : startOAuth.isError
      ? '로그인에 실패하였습니다.'
      : null;

  const handleLogin = (providerId: ProviderId) => {
    startOAuth.mutate(providerId);
  };

  return (
    <div className="flex w-full max-w-5xl overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
      <div className="w-1/2 shrink-0">
        <img src={loginIllustration} alt="" className="h-full w-full object-cover" />
      </div>

      <div className="flex w-1/2 flex-col justify-center gap-16 px-12 py-16">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <img src={gravitLogo} alt="Gravit" className="h-6 w-24" />
            <span className="text-h1 font-medium text-fg-secondary">Admin Page</span>
          </div>
          <h2 className="text-display text-foreground">백오피스 로그인</h2>
          <p className="text-h2 font-medium text-muted-foreground">내부 운영자 전용 관리 시스템</p>
        </div>

        <div className="flex flex-col gap-2">
          <OAuthButtons onLogin={handleLogin} disabled={startOAuth.isPending} />
          <p className="min-h-5 text-caption text-destructive">{errorMessage}</p>
        </div>
      </div>
    </div>
  );
}
