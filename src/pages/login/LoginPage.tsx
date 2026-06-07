import { useSearchParams } from 'react-router';
import gravitLogo from '@/features/auth/assets/gravit-logo.svg';
import loginIllustration from '@/features/auth/assets/login-illustration.png';
import { OAuthButtons } from '@/features/auth/components/OAuthButtons';
import { useStartOAuth } from '@/features/auth/hooks';
import type { ProviderId } from '@/features/auth/types';

/**
 * 로그인 실패 메시지 (DS-02 §1-4, BACKEND_ADMIN_API_SPEC §8).
 * 콜백이 role 차단/실패 시 `?error=` 로 복귀 → 카드 하단에 표시.
 */
const ERROR_MESSAGES: Record<string, string> = {
  forbidden: '백오피스 접근 권한이 없습니다.',
  failed: '로그인에 실패했습니다. 다시 시도해주세요.',
};

/**
 * LOGIN (Figma node 8788:1984, decisions D5). 2-패널 카드:
 *  - 좌: 일러스트(LOGIN 전용 에셋)
 *  - 우: Gravit 로고 + "Admin Page" / "백오피스 로그인" / 설명 / OAuth 3버튼 / (실패 시) 에러
 * 데스크탑 단일폭(반응형 없음). 흐름: 버튼 → login-url 리다이렉트 → provider → 콜백(/login/oauth2/code/:provider).
 */
export function LoginPage() {
  const startOAuth = useStartOAuth();
  const [params] = useSearchParams();
  const errorKey = params.get('error');
  // 콜백 복귀(?error=) 메시지 우선, 없으면 버튼 클릭(login-url) 실패 시 인라인 메시지.
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

        <div className="flex flex-col gap-2">
          <OAuthButtons onLogin={handleLogin} disabled={startOAuth.isPending} />
          {/* 실패 메시지 자리 고정: 메시지 유무와 무관하게 높이 예약 → 표시 시 레이아웃 시프트 방지. */}
          <p className="min-h-5 text-caption text-destructive">{errorMessage}</p>
        </div>
      </div>
    </div>
  );
}
