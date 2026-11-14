import type { ServiceStatus } from '@/features/ravvit/types';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/cn';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * 화면 전체를 막는 장애 표시 (RAVVIT_SPEC §A-4).
 * 진입을 차단하지 않고 화면 안에서 사유를 확인할 수 있게 한다.
 * `forbidden` 은 재시도해도 결과가 같아 [다시 확인] 을 두지 않는다.
 */
const BANNERS: Record<
  Exclude<ServiceStatus, 'ok' | 'checking'>,
  { message: string; tone: 'warning' | 'danger'; recheckable: boolean }
> = {
  unreachable: {
    message: 'Ravvit 서버에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.',
    tone: 'warning',
    recheckable: true,
  },
  forbidden: {
    message: 'Ravvit 사용 권한이 없어요. 관리자에게 문의해 주세요.',
    tone: 'danger',
    recheckable: false,
  },
  'auth-unavailable': {
    message: '인증 서버에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.',
    tone: 'warning',
    recheckable: true,
  },
};

interface ServiceBannerProps {
  status: ServiceStatus;
  onRecheck: () => void;
}

export function ServiceBanner({ status, onRecheck }: ServiceBannerProps) {
  if (status === 'ok' || status === 'checking') return null;
  const { message, tone, recheckable } = BANNERS[status];

  return (
    <div
      className={cn(
        'mb-4 flex items-center gap-2 rounded-lg border border-border p-3 text-body',
        tone === 'danger' ? 'bg-danger-bg text-danger-text' : 'bg-warning-bg text-warning-text',
      )}
    >
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span className="flex-1">{message}</span>
      {recheckable && (
        <Button variant="ghost" size="sm" onClick={onRecheck}>
          <RefreshCw className="h-4 w-4" />
          다시 확인
        </Button>
      )}
    </div>
  );
}
