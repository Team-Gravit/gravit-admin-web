import { useEffect, useRef } from 'react';
import { Copy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { MarkdownViewer } from '@/shared/components/markdown/MarkdownViewer';
import { ToolLogBlock } from '@/features/ravvit/components/ToolLogBlock';
import { DEFAULT_ERROR_MESSAGE } from '@/features/ravvit/store';
import type { BotMessage } from '@/features/ravvit/types';

/**
 * 봇 답변 (RAVVIT_SPEC §A-2·§B-2).
 * 컬럼 전체 폭 좌측 정렬, **배경·보더 없음** — 마크다운 내부 블록(코드·표)의 자체 배경과 충돌하기 때문.
 * 복사·다시 생성은 **답변 하단 액션 행**에 둔다(본문 위에 겹치지 않게 — 사용자 결정 2026-09-09).
 */
interface BotMessageItemProps {
  message: BotMessage;
  /** 마지막 메시지만 재생성할 수 있다 — 중간 턴을 되돌리면 이후 대화 맥락이 어긋난다. */
  isLast: boolean;
  streaming: boolean;
  onRegenerate: () => void;
  onReveal: () => void;
  onRevealed: () => void;
}

export function BotMessageItem({
  message,
  isLast,
  streaming,
  onRegenerate,
  onReveal,
  onRevealed,
}: BotMessageItemProps) {
  const { id, status, toolLogs, answer, errorMessage, revealed } = message;

  const notifiedId = useRef<string | null>(null);
  useEffect(() => {
    if (status === 'done' && !revealed && notifiedId.current !== id) {
      notifiedId.current = id;
      onReveal();
      onRevealed();
    }
  }, [id, status, revealed, onReveal, onRevealed]);

  const handleCopy = (): void => {
    if (answer === null) return;
    // 렌더된 결과가 아니라 answer 마크다운 원문을 복사한다 (§A-3)
    navigator.clipboard.writeText(answer).then(
      () => toast.success('복사했어요.'),
      () => toast.error('복사하지 못했어요. 다시 시도해 주세요.'),
    );
  };

  return (
    <div>
      <ToolLogBlock logs={toolLogs} pending={status === 'pending'} />

      {status === 'pending' && (
        <div className="flex items-center gap-2 text-body text-muted-foreground">
          답변을 만들고 있어요…
        </div>
      )}

      {status === 'done' && answer !== null && (
        <div key={id}>
          <MarkdownViewer content={answer} variant="chat" />

          <div className="mt-2 flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="복사"
              title="복사"
              onClick={handleCopy}
              className="h-8 w-8 text-muted-foreground"
            >
              <Copy className="h-4 w-4" />
            </Button>
            {isLast && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="다시 생성"
                title="다시 생성"
                disabled={streaming}
                onClick={onRegenerate}
                className="h-8 w-8 text-muted-foreground"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="rounded-lg border border-border bg-danger-bg p-3 text-body text-danger-text">
          <p className="whitespace-pre-wrap">{errorMessage ?? DEFAULT_ERROR_MESSAGE}</p>
          <Button variant="ghost" size="sm" className="mt-2" onClick={onRegenerate}>
            다시 시도하기
          </Button>
        </div>
      )}

      {status === 'aborted' && <p className="text-body text-muted-foreground">응답을 중단했어요.</p>}
    </div>
  );
}
