import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { blockerCopy, nextActionCopy, type NextActionCode } from '@/features/qa/copy';
import type { SprintGuide } from '@/features/qa/schemas';

interface NextActionBannerProps {
  guide: SprintGuide;
  /** 이 동작을 지금 화면이 처리할 수 없거나 이미 그 화면이면 false — 버튼을 숨긴다. */
  canAct: (code: NextActionCode) => boolean;
  onAction: (code: NextActionCode) => void;
  pending?: boolean;
}

/**
 * 지금 할 일 배너 — 화면에 하나만 둔다 (QA_SPEC B-1, F-1·F-2).
 * 모르는 nextAction 이면 배너 전체를 숨긴다. 막힌 이유는 아는 코드만 한 줄씩.
 */
export function NextActionBanner({ guide, canAct, onAction, pending }: NextActionBannerProps) {
  const copy = nextActionCopy(guide);
  if (!copy) return null;

  const blockers = guide.blockers
    .map((b) => blockerCopy(b))
    .filter((text): text is string => text !== null);
  const showButton = copy.button !== null && canAct(copy.code);

  return (
    <section
      aria-label="지금 할 일"
      className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-caption font-medium text-fg-muted">지금 할 일</span>
          <p className="text-body text-foreground">{copy.banner}</p>
        </div>
        {showButton && (
          <Button size="sm" disabled={pending} onClick={() => onAction(copy.code)}>
            {pending && <Loader2 className="animate-spin" />}
            {copy.button}
          </Button>
        )}
      </div>
      {blockers.length > 0 && (
        <ul className="flex flex-col gap-1">
          {blockers.map((text, i) => (
            <li
              key={`${i}-${text}`}
              className="flex items-center gap-1.5 text-caption text-warning-text"
            >
              <AlertTriangle className="size-3.5 shrink-0" />
              {text}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
