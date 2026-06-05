import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { acquireOAuthIdToken, OAuthNotWiredError } from '@/features/auth/oauth';
import type { ProviderId } from '@/features/auth/types';

/**
 * OAuth 버튼 3종 (DS-02 §1, 04 §7-1). Outline 버튼, 12px(gap-3) 간격.
 * 각 버튼: provider SDK 로 idToken 취득(경계 acquireOAuthIdToken) → onLogin 호출.
 * ⚠️ provider 브랜드 로고는 lucide 미제공(DS-01 §7 lucide-only) → 텍스트 라벨만, 로고 에셋은 보완항목.
 */
const PROVIDERS: Array<{ id: ProviderId; label: string }> = [
  { id: 'GOOGLE', label: 'Google로 로그인' },
  { id: 'KAKAO', label: '카카오로 로그인' },
  { id: 'NAVER', label: '네이버로 로그인' },
];

interface OAuthButtonsProps {
  onLogin: (providerId: ProviderId, idToken: string) => void;
  disabled?: boolean;
}

export function OAuthButtons({ onLogin, disabled = false }: OAuthButtonsProps) {
  const handleClick = async (provider: ProviderId) => {
    try {
      const idToken = await acquireOAuthIdToken(provider);
      onLogin(provider, idToken);
    } catch (error) {
      if (error instanceof OAuthNotWiredError) {
        // 미배선 경계: 키/콘솔/CDN(사람 위임) + 백엔드 연동 후 활성화.
        toast.info('OAuth 연동은 통합 단계에서 활성화됩니다.');
        return;
      }
      toast.error('로그인을 시작할 수 없습니다.');
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {PROVIDERS.map((provider) => (
        <Button
          key={provider.id}
          variant="outline"
          className="w-full"
          disabled={disabled}
          onClick={() => handleClick(provider.id)}
        >
          {provider.label}
        </Button>
      ))}
    </div>
  );
}
