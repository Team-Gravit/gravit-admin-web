import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { MarkdownViewer } from '@/shared/components/markdown/MarkdownViewer';
import { formatNumber } from '@/shared/lib/formatNumber';
import { ToolLogBlock } from '@/features/ravvit/components/ToolLogBlock';
import { DEFAULT_ERROR_MESSAGE } from '@/features/ravvit/store';
import type { BotMessage } from '@/features/ravvit/types';

/**
 * 봇 답변 (RAVVIT_SPEC §A-2·§B-2).
 * 컬럼 전체 폭 좌측 정렬, **배경·보더 없음** — 마크다운 내부 블록(코드·표)의 자체 배경과 충돌하기 때문.
 */
interface BotMessageItemProps {
  message: BotMessage;
  onRetry: () => void;
}

export function BotMessageItem({ message, onRetry }: BotMessageItemProps) {
  const { status, toolLogs, answer, usage, errorMessage } = message;

  const handleCopy = (): void => {
    if (answer === null) return;
    // 렌더된 결과가 아니라 answer 마크다운 원문을 복사한다 (§A-3)
    navigator.clipboard.writeText(answer).then(
      () => toast.success('복사되었습니다.'),
      () => toast.error('복사하지 못했습니다.'),
    );
  };

  return (
    <div className="group">
      <ToolLogBlock logs={toolLogs} pending={status === 'pending'} />

      {status === 'pending' && (
        <div className="flex items-center gap-2 text-body text-muted-foreground">
          답변을 생성하고 있습니다
          <span className="flex items-center gap-1">
            <span className="h-1 w-1 animate-typing-dot-1 rounded-full bg-current" />
            <span className="h-1 w-1 animate-typing-dot-2 rounded-full bg-current" />
            <span className="h-1 w-1 animate-typing-dot-3 rounded-full bg-current" />
          </span>
        </div>
      )}

      {status === 'done' && answer !== null && (
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            aria-label="답변 복사"
            onClick={handleCopy}
            className="absolute right-0 top-0 text-fg-secondary opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Copy className="h-4 w-4" />
          </Button>

          <MarkdownViewer content={answer} variant="chat" />

          {usage && (
            <p className="mt-2 text-caption text-muted-foreground">
              입력 {formatNumber(usage.inputTokens)} · 출력 {formatNumber(usage.outputTokens)} · 캐시{' '}
              {formatNumber(usage.cacheReadInputTokens)}
            </p>
          )}
        </div>
      )}

      {status === 'error' && (
        <div className="rounded-lg border border-border bg-danger-bg p-3 text-body text-danger-text">
          <p className="whitespace-pre-wrap">{errorMessage ?? DEFAULT_ERROR_MESSAGE}</p>
          <Button variant="ghost" size="sm" className="mt-2" onClick={onRetry}>
            다시 시도
          </Button>
        </div>
      )}

      {status === 'aborted' && <p className="text-body text-muted-foreground">응답을 중단했습니다.</p>}
    </div>
  );
}
