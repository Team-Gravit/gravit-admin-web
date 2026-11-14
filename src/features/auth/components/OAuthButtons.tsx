import { Button } from '@/shared/components/ui/button';
import type { ProviderId } from '@/features/auth/types';

interface Provider {
  id: ProviderId;
  label: string;
}

const PROVIDERS: Provider[] = [
  { id: 'GOOGLE', label: 'Google로 시작하기' },
  { id: 'KAKAO', label: '카카오로 시작하기' },
  { id: 'NAVER', label: '네이버로 시작하기' },
];

interface OAuthButtonsProps {
  onLogin: (providerId: ProviderId) => void;
  disabled?: boolean;
}

export function OAuthButtons({ onLogin, disabled = false }: OAuthButtonsProps) {
  return (
    <div className="flex w-full flex-col gap-3">
      {PROVIDERS.map((provider) => (
        <Button
          key={provider.id}
          type="button"
          disabled={disabled}
          onClick={() => onLogin(provider.id)}
          variant="outline"
          className="h-14 w-full"
        >
          {provider.label}
        </Button>
      ))}
    </div>
  );
}
