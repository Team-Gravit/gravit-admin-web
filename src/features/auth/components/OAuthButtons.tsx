import { cn } from '@/shared/lib/cn';
import type { ProviderId } from '@/features/auth/types';
import googleIcon from '@/features/auth/assets/google.svg';
import kakaoIcon from '@/features/auth/assets/kakao.svg';
import naverIcon from '@/features/auth/assets/naver.svg';

/**
 * OAuth 버튼 3종 (Figma node 8788:7503 — LOGIN 전용 브랜드 스타일, decisions D5).
 * 브랜드 색은 brand-* 토큰(globals.css). 클릭 → onLogin(provider) → login-url 리다이렉트(auth-code 흐름).
 */
interface Provider {
  id: ProviderId;
  label: string;
  icon: string;
  className: string;
}

const PROVIDERS: Provider[] = [
  { id: 'GOOGLE', label: 'Google로 시작하기', icon: googleIcon, className: 'bg-brand-google text-brand-fg' },
  { id: 'KAKAO', label: '카카오로 시작하기', icon: kakaoIcon, className: 'bg-brand-kakao text-brand-fg' },
  { id: 'NAVER', label: '네이버로 시작하기', icon: naverIcon, className: 'bg-brand-naver text-brand-naver-fg' },
];

interface OAuthButtonsProps {
  onLogin: (providerId: ProviderId) => void;
  disabled?: boolean;
}

export function OAuthButtons({ onLogin, disabled = false }: OAuthButtonsProps) {
  return (
    <div className="flex w-full flex-col gap-3">
      {PROVIDERS.map((provider) => (
        <button
          key={provider.id}
          type="button"
          disabled={disabled}
          onClick={() => onLogin(provider.id)}
          className={cn(
            'relative flex h-14 w-full items-center justify-center rounded-xl text-lg font-medium transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
            provider.className,
          )}
        >
          <img src={provider.icon} alt="" className="absolute left-4 size-6" />
          {provider.label}
        </button>
      ))}
    </div>
  );
}
