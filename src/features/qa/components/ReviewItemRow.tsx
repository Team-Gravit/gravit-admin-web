import { useState } from 'react';
import { Check, ChevronDown, ChevronRight, Loader2, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { StatusBadge } from '@/shared/components/status-badge/StatusBadge';
import { PartChips } from '@/features/qa/components/PartChips';
import { QaChip } from '@/features/qa/components/QaChip';
import { NOTICE_COPY } from '@/features/qa/copy';
import {
  CLASSIFICATION_BADGE_VARIANT,
  CLASSIFICATION_LABELS,
  CRITERIA_LABELS,
  ORIGIN_LABELS,
  REVIEW_STATE_BADGE_VARIANT,
  REVIEW_STATE_LABELS,
  personaLabel,
} from '@/features/qa/labels';
import type { ChecklistItem } from '@/features/qa/schemas';

interface ReviewItemRowProps {
  item: ChecklistItem;
  /** REVIEW 상태에서만 true — 아니면 읽기 전용(B-3) */
  editable: boolean;
  /** 그룹 안에서 요청이 진행 중 — 동작 버튼을 막는다(이전 version 으로 다시 보내 409 가 나지 않게) */
  busy: boolean;
  /** 이 항목의 요청이 진행 중 */
  spinning?: boolean;
  onReview: (state: 'CONFIRMED' | 'REJECTED') => void;
  onEdit: () => void;
}

/**
 * 분류 검토 항목 행 (QA_SPEC B-3).
 * 확정 ↔ 거절 전환만 있다 — API 의 reviewState 가 CONFIRMED·REJECTED 만 받으므로 [확정 취소]는 없다.
 */
export function ReviewItemRow({
  item,
  editable,
  busy,
  spinning = false,
  onReview,
  onEdit,
}: ReviewItemRowProps) {
  const [expectedOpen, setExpectedOpen] = useState(false);
  const [criteriaOpen, setCriteriaOpen] = useState(false);

  return (
    <li className="flex gap-4 px-6 py-4">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge variant={REVIEW_STATE_BADGE_VARIANT[item.reviewState]}>
            {REVIEW_STATE_LABELS[item.reviewState]}
          </StatusBadge>
          <span className="text-body font-medium text-foreground">{item.title}</span>
        </div>

        <button
          type="button"
          onClick={() => setExpectedOpen((v) => !v)}
          aria-expanded={expectedOpen}
          className={`text-left text-body text-fg-secondary hover:text-foreground ${expectedOpen ? 'whitespace-pre-wrap' : 'line-clamp-2'}`}
        >
          {item.expected}
        </button>

        <div className="flex flex-wrap items-center gap-2 text-caption text-fg-muted">
          <PartChips parts={item.parts} />
          <StatusBadge variant={CLASSIFICATION_BADGE_VARIANT[item.classification]}>
            {CLASSIFICATION_LABELS[item.classification]}
          </StatusBadge>
          {item.classification === 'MANUAL' && item.automationGap && (
            <StatusBadge variant="accent">자동화 후보</StatusBadge>
          )}
          {item.personaKey && <QaChip>{personaLabel(item.personaKey)}</QaChip>}
          <span>{ORIGIN_LABELS[item.origin]}</span>
          <button
            type="button"
            onClick={() => setCriteriaOpen((v) => !v)}
            aria-expanded={criteriaOpen}
            className="inline-flex items-center gap-0.5 text-fg-secondary hover:text-foreground"
          >
            {criteriaOpen ? (
              <ChevronDown className="size-3.5" />
            ) : (
              <ChevronRight className="size-3.5" />
            )}
            판정 근거
          </button>
        </div>

        {criteriaOpen &&
          (item.criteria === null ? (
            <p className="text-caption text-fg-muted">{NOTICE_COPY.NO_CRITERIA}</p>
          ) : (
            <ul className="flex flex-col gap-1.5 rounded-md bg-page px-3 py-2.5">
              {CRITERIA_LABELS.map(({ key, label }) => {
                const c = item.criteria?.[key];
                if (!c) return null;
                return (
                  <li key={key} className="flex items-start gap-2 text-caption">
                    {c.met ? (
                      <Check
                        className="mt-0.5 size-3.5 shrink-0 text-success-text"
                        aria-label="충족"
                      />
                    ) : (
                      <X
                        className="mt-0.5 size-3.5 shrink-0 text-danger-text"
                        aria-label="미충족"
                      />
                    )}
                    <span className="w-28 shrink-0 text-foreground">{label}</span>
                    <span className="text-fg-secondary">{c.reason}</span>
                  </li>
                );
              })}
            </ul>
          ))}
      </div>

      {editable && (
        <div className="flex shrink-0 items-start gap-1.5">
          {spinning && (
            <Loader2 className="mt-2 size-4 animate-spin text-fg-muted" aria-label="처리 중" />
          )}
          {item.reviewState !== 'CONFIRMED' && (
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => onReview('CONFIRMED')}
            >
              확정
            </Button>
          )}
          {item.reviewState !== 'REJECTED' && (
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => onReview('REJECTED')}
            >
              거절
            </Button>
          )}
          <Button size="sm" variant="ghost" disabled={busy} onClick={onEdit}>
            수정
          </Button>
        </div>
      )}
    </li>
  );
}
