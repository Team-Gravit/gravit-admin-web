import { AlertTriangle, Info, Loader2, type LucideIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { blockerCopy, nextActionCopy, type NextActionCode } from '@/features/qa/copy';
import type { SprintGuide } from '@/features/qa/schemas';

/**
 * 막힌 이유 톤 (QA_SPEC C절): 조치가 필요한 경고 = warning, 진행 중 = primary 아이콘, 남은 일(미검수·검토 전) = neutral.
 * Primary 는 본문 텍스트에 쓰지 않고 아이콘에만 둔다(DS-01 1-1).
 */
function blockerTone(code: string): { icon: LucideIcon; iconClass: string; textClass: string } {
  if (code === 'RELEASE_BRANCH_MISSING') {
    return { icon: AlertTriangle, iconClass: 'text-warning-text', textClass: 'text-warning-text' };
  }
  if (code.endsWith('_IN_PROGRESS')) {
    return {
      icon: Loader2,
      iconClass: 'animate-spin text-primary',
      textClass: 'text-fg-secondary',
    };
  }
  return { icon: Info, iconClass: 'text-fg-muted', textClass: 'text-fg-secondary' };
}

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

  const blockers = guide.blockers.flatMap((b) => {
    const text = blockerCopy(b);
    return text === null ? [] : [{ code: b.code, text }];
  });
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
          {blockers.map(({ code, text }, i) => {
            const tone = blockerTone(code);
            const Icon = tone.icon;
            return (
              <li
                key={`${i}-${code}`}
                className={`flex items-center gap-1.5 text-caption ${tone.textClass}`}
              >
                <Icon className={`size-3.5 shrink-0 ${tone.iconClass}`} />
                {text}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
