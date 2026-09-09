import { useEffect } from 'react';
import { Copy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { MarkdownViewer } from '@/shared/components/markdown/MarkdownViewer';
import { ToolLogBlock } from '@/features/ravvit/components/ToolLogBlock';
import { useProgressiveReveal } from '@/features/ravvit/hooks';
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

  // 점진 렌더 중인지 (decisions D8-8)
  const typing = status === 'done' && !revealed;
  const { shown, done } = useProgressiveReveal(answer ?? '', typing, onReveal);

  useEffect(() => {
    if (typing && done) onRevealed();
  }, [typing, done, onRevealed]);

  const handleCopy = (): void => {
    if (answer === null) return;
    // 렌더된 결과가 아니라 answer 마크다운 원문을 복사한다 (§A-3)
    navigator.clipboard.writeText(answer).then(
      () => toast.success('복사되었습니다.'),
      () => toast.error('복사하지 못했습니다.'),
    );
  };

  return (
    <div>
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
        <div key={id}>
          <MarkdownViewer
            content={revealed ? answer : shown}
            variant="chat"
            // 새로 붙는 마지막 블록에만 페이드가 걸린다(globals.css)
            className={typing ? 'ravvit-stream' : undefined}
          />

          {/* 타이핑이 끝난 뒤에 노출한다 — 흐르는 중에 버튼이 아래로 밀려다니지 않도록 */}
          {(revealed || done) && (
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
          )}
        </div>
      )}

      {status === 'error' && (
        <div className="rounded-lg border border-border bg-danger-bg p-3 text-body text-danger-text">
          <p className="whitespace-pre-wrap">{errorMessage ?? DEFAULT_ERROR_MESSAGE}</p>
          <Button variant="ghost" size="sm" className="mt-2" onClick={onRegenerate}>
            다시 시도
          </Button>
        </div>
      )}

      {status === 'aborted' && <p className="text-body text-muted-foreground">응답을 중단했습니다.</p>}
    </div>
  );
}
