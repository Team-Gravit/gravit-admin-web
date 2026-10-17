import { NavLink } from 'react-router';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { formatDate } from '@/shared/lib/formatDate';
import { Button } from '@/shared/components/ui/button';
import { StageStepper } from '@/features/qa/components/StageStepper';
import { NextActionBanner } from '@/features/qa/components/NextActionBanner';
import { SPRINT_SCREENS } from '@/features/qa/screens';
import type { NextActionCode } from '@/features/qa/copy';
import type { Sprint } from '@/features/qa/schemas';

interface SprintHeaderProps {
  sprint: Sprint;
  canAct: (code: NextActionCode) => boolean;
  onAction: (code: NextActionCode) => void;
  actionPending?: boolean;
}

/** Notion 페이지 ID 에서 하이픈을 뺀 공개 URL (QA_SPEC B-1). */
function notionUrl(notionPageId: string): string {
  return `https://www.notion.so/${notionPageId.replace(/-/g, '')}`;
}

/**
 * 스프린트 공통 상단 (QA_SPEC B-1) — 준비·분류 검토·체크리스트 3화면이 공유한다.
 * 스프린트 정보 · 단계 표시 · 지금 할 일 배너(1개) · 하위 화면 링크(탭 컴포넌트 없음, D9-1).
 */
export function SprintHeader({ sprint, canAct, onAction, actionPending }: SprintHeaderProps) {
  const hasPeriod = sprint.periodStart !== null || sprint.periodEnd !== null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <h1 className="text-h1 text-foreground">{sprint.sprintKey}</h1>
          {hasPeriod && (
            <span className="text-body text-fg-muted">
              {formatDate(sprint.periodStart)} ~ {formatDate(sprint.periodEnd)}
            </span>
          )}
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href={notionUrl(sprint.notionPageId)} target="_blank" rel="noopener noreferrer">
            Notion에서 보기
            <ExternalLink />
          </a>
        </Button>
      </div>

      <StageStepper guide={sprint.guide} />

      <NextActionBanner
        guide={sprint.guide}
        canAct={canAct}
        onAction={onAction}
        pending={actionPending}
      />

      <nav aria-label="하위 화면" className="flex gap-6 border-b border-border">
        {SPRINT_SCREENS.map((screen) => (
          <NavLink
            key={screen.key}
            to={screen.to(sprint.id)}
            // text-body 는 cn(twMerge) 안에서 색 클래스와 충돌해 지워지므로 cn 밖에 붙인다.
            className={({ isActive }) =>
              `text-body ${cn(
                '-mb-px border-b-2 px-1 pb-2.5 transition-colors',
                isActive
                  ? 'border-primary font-medium text-primary'
                  : 'border-transparent text-fg-secondary hover:text-foreground',
              )}`
            }
          >
            {screen.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
