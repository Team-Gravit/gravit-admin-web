import type { ReactNode } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

/**
 * QA_SPEC F-4 안내 한 줄. tone=warning 은 경고(C절 경고 = warning 톤).
 * text-caption 은 cn(twMerge) 안에서 색 클래스와 같은 그룹으로 취급돼 지워지므로 cn 밖에 붙인다.
 */
export function QaNotice({
  children,
  tone = 'info',
  className,
}: {
  children: ReactNode;
  tone?: 'info' | 'warning';
  className?: string;
}) {
  const Icon = tone === 'warning' ? AlertTriangle : Info;
  return (
    <p
      className={`text-caption ${cn(
        'flex items-start gap-1.5',
        tone === 'warning' ? 'text-warning-text' : 'text-fg-secondary',
        className,
      )}`}
    >
      <Icon className="mt-0.5 size-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
