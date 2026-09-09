import { useEffect, useLayoutEffect, useRef, type KeyboardEvent } from 'react';
import { Send, Square } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/cn';

/**
 * 입력 영역 (RAVVIT_SPEC §A-3·§B-4).
 * 자동 확장 멀티라인 · Enter 전송 / Shift+Enter 줄바꿈.
 * 응답 대기 중에는 전송 버튼이 중단 버튼으로 바뀐다(Primary 배경 아님 — 주 액션이 아니다).
 */
interface ChatComposerProps {
  value: string;
  /** 장애 배너 노출 등으로 입력 자체가 막힌 상태 */
  blocked: boolean;
  streaming: boolean;
  /** 값이 늘 때마다 입력창에 포커스한다(추천 질문 칩 클릭용) */
  focusTick: number;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onAbort: () => void;
}

export function ChatComposer({
  value,
  blocked,
  streaming,
  focusTick,
  onChange,
  onSubmit,
  onAbort,
}: ChatComposerProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const disabled = blocked || streaming;

  // 입력 길이에 맞춰 높이를 다시 계산한다(줄어드는 경우까지 처리하려면 auto 로 되돌린 뒤 측정)
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  useEffect(() => {
    if (focusTick > 0) ref.current?.focus();
  }, [focusTick]);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (event.key !== 'Enter' || event.shiftKey) return;
    // 한글 IME 조합 중의 Enter 는 글자 확정용이다 — 전송하면 입력이 잘린다
    if (event.nativeEvent.isComposing) return;
    event.preventDefault();
    onSubmit();
  };

  return (
    <div
      className={cn(
        // rounded-xl = 입력 박스 라운드. 조절하려면 이 클래스를 바꾼다(md → lg → xl → 2xl → full).
        'mt-4 flex items-end gap-2 rounded-xl border border-border p-1.5',
        disabled ? 'bg-hover' : 'bg-surface',
      )}
    >
      <textarea
        ref={ref}
        rows={1}
        value={value}
        disabled={disabled}
        placeholder="무엇이든 물어보세요."
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        className="max-h-40 flex-1 resize-none overflow-y-auto bg-transparent px-2 py-1.5 text-body text-foreground outline-none placeholder:text-fg-secondary disabled:text-fg-disabled disabled:placeholder:text-fg-disabled"
      />

      {streaming ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="응답 중단"
          onClick={onAbort}
          className="h-8 w-8 shrink-0 border-border text-fg-secondary"
        >
          <Square className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          type="button"
          size="icon"
          aria-label="전송"
          disabled={blocked || value.trim().length === 0}
          onClick={onSubmit}
          className="h-8 w-8 shrink-0 bg-primary hover:bg-primary-hover disabled:text-fg-disabled"
        >
          <Send className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
