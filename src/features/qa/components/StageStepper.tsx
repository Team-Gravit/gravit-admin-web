import { Fragment } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { STAGE_LABELS } from '@/features/qa/labels';
import { sprintStageSchema, type SprintGuide } from '@/features/qa/schemas';

/**
 * 단계 표시 (QA_SPEC B-1). stageCount 개 원 — stageIndex 이전은 완료 톤, 현재는 primary, 이후는 기본.
 */
export function StageStepper({ guide }: { guide: SprintGuide }) {
  const stages = sprintStageSchema.options.slice(0, guide.stageCount);

  return (
    <ol className="flex items-center gap-2" aria-label="진행 단계">
      {stages.map((stage, i) => {
        const index = i + 1;
        const done = index < guide.stageIndex;
        const current = index === guide.stageIndex;
        return (
          <Fragment key={stage}>
            {i > 0 && (
              <li
                aria-hidden
                className={cn('h-px w-8', done || current ? 'bg-primary' : 'bg-border')}
              />
            )}
            <li className="flex items-center gap-2" aria-current={current ? 'step' : undefined}>
              {/* text-caption·text-body 는 cn(twMerge) 안에서 색 클래스와 충돌해 지워지므로 cn 밖에 붙인다. */}
              <span
                className={`text-caption ${cn(
                  'flex size-6 items-center justify-center rounded-full font-medium',
                  done && 'bg-success-bg text-success-text',
                  current && 'bg-primary text-primary-foreground',
                  !done && !current && 'bg-hover text-fg-muted',
                )}`}
              >
                {done ? <Check className="size-3.5" /> : index}
              </span>
              <span
                className={`text-body ${cn(
                  'whitespace-nowrap',
                  current && 'font-medium text-foreground',
                  done && 'text-fg-secondary',
                  !done && !current && 'text-fg-muted',
                )}`}
              >
                {STAGE_LABELS[stage]}
              </span>
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}
