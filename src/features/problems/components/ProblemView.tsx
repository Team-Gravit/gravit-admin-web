import { Check } from 'lucide-react';
import type { ProblemDetail } from '@/features/problems/schemas';

/** 객관식 보기 번호 글리프(①~④). 4개 고정(03 §7-12). */
const OPTION_MARKERS = ['①', '②', '③', '④'];

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-6">
      <span className="w-16 shrink-0 text-body text-fg-muted">{label}</span>
      <span className="whitespace-pre-wrap text-body text-foreground">{value || '-'}</span>
    </div>
  );
}

/**
 * 문제 상세 표시 모드 (DS-02 §14-1/§14-3, 01 §6-5-5).
 * 객관식: 문제 카드 + 보기(4개, 정답 ✓ + 해설). 주관식(D1): 문제 카드 + 정답(콤마 단일 + 해설, N개 표기 없음).
 */
export function ProblemView({ problem }: { problem: ProblemDetail }) {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6">
        <h3 className="text-h3 text-foreground">문제</h3>
        <InfoRow label="지시문" value={problem.instruction} />
        <InfoRow label="본문" value={problem.content} />
      </section>

      {problem.problemType === 'OBJECTIVE' ? (
        <section className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6">
          <h3 className="text-h3 text-foreground">보기 (4개 고정)</h3>
          <ul className="flex flex-col gap-4">
            {problem.options.map((option, index) => (
              <li key={option.optionId} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-body text-foreground">
                    {OPTION_MARKERS[index]} {option.content}
                  </span>
                  {option.isAnswer && (
                    <span className="inline-flex items-center gap-1 text-caption font-medium text-success-text">
                      <Check className="size-4" />
                      정답
                    </span>
                  )}
                </div>
                {option.explanation && (
                  <p className="pl-6 text-caption text-fg-secondary">해설: {option.explanation}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6">
          {/* D1: 주관식 정답 = 단일 객체, content 콤마 구분 단일 텍스트. (N개) 표기 없음. */}
          <h3 className="text-h3 text-foreground">정답</h3>
          <div className="flex flex-col gap-1">
            <p className="whitespace-pre-wrap text-body text-foreground">
              {problem.answer.content || '-'}
            </p>
            {problem.answer.explanation && (
              <p className="text-caption text-fg-secondary">해설: {problem.answer.explanation}</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
