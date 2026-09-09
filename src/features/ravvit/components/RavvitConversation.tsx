import { useEffect, useRef, useState, type UIEvent } from 'react';
import { ArrowDown, RotateCcw } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { ConfirmModal } from '@/shared/components/modals/ConfirmModal';
import { cn } from '@/shared/lib/cn';
import { useRavvitStore } from '@/features/ravvit/store';
import { BotMessageItem } from '@/features/ravvit/components/BotMessageItem';
import { ChatComposer } from '@/features/ravvit/components/ChatComposer';
import { EmptyPrompt } from '@/features/ravvit/components/EmptyPrompt';
import { ServiceBanner } from '@/features/ravvit/components/ServiceBanner';
import { UserMessageItem } from '@/features/ravvit/components/UserMessageItem';

/** 최하단 판정 여유(px). 스크롤 위치가 소수점으로 어긋나도 "맨 아래"로 보기 위한 값. */
const BOTTOM_THRESHOLD = 24;

/**
 * Ravvit 대화 화면 (RAVVIT_SPEC §B-1).
 * 뷰포트를 채우고 **메시지 영역만** 스크롤한다. 입력창은 항상 하단 고정.
 * 대화 상태는 스토어 소유 — 이 컴포넌트가 언마운트돼도 진행 중 응답이 끊기지 않는다.
 */
export function RavvitConversation({ nickname }: { nickname: string | null }) {
  const messages = useRavvitStore((s) => s.messages);
  const service = useRavvitStore((s) => s.service);
  const isStreaming = useRavvitStore((s) => s.isStreaming);
  const draft = useRavvitStore((s) => s.draft);
  const greetingSeed = useRavvitStore((s) => s.greetingSeed);
  const { setDraft, checkService, send, retry, abort, reset } = useRavvitStore.getState();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [focusTick, setFocusTick] = useState(0);
  const [stickToBottom, setStickToBottom] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 진입 시 1회 (§A-4). 실패는 배너의 [다시 확인] 으로 수동 재호출한다.
  useEffect(() => {
    void checkService();
  }, [checkService]);

  useEffect(() => {
    if (!stickToBottom) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, stickToBottom]);

  // 사용자가 위로 올리면 자동 고정을 해제한다 — 이전 답변을 읽는 중 끌려 내려가지 않도록.
  const handleScroll = (event: UIEvent<HTMLDivElement>): void => {
    const el = event.currentTarget;
    setStickToBottom(el.scrollHeight - el.scrollTop - el.clientHeight < BOTTOM_THRESHOLD);
  };

  const blocked = service !== 'ok';
  const isEmpty = messages.length === 0;

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col">
      <div className="flex justify-end pb-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="대화 초기화"
          disabled={isEmpty || isStreaming}
          onClick={() => setConfirmOpen(true)}
          className="text-fg-secondary"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <ServiceBanner status={service} onRecheck={() => void checkService()} />

      <div className="relative flex min-h-0 flex-1 flex-col">
        <div ref={scrollRef} onScroll={handleScroll} className="min-h-0 flex-1 overflow-y-auto">
          {isEmpty ? (
            <EmptyPrompt
              nickname={nickname}
              seed={greetingSeed}
              disabled={blocked}
              onPick={(question) => {
                setDraft(question);
                setFocusTick((tick) => tick + 1);
              }}
            />
          ) : (
            <div className="pb-2">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  // 턴과 턴 사이(봇 → 다음 유저)를 한 턴 안(유저 → 봇)보다 넓게 둔다 (§B-2)
                  className={cn(index > 0 && (message.role === 'user' ? 'mt-8' : 'mt-3'))}
                >
                  {message.role === 'user' ? (
                    <UserMessageItem content={message.content} />
                  ) : (
                    <BotMessageItem message={message} onRetry={() => void retry()} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {!stickToBottom && !isEmpty && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStickToBottom(true)}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 border-border bg-surface text-fg-secondary"
          >
            <ArrowDown className="h-4 w-4" />
            맨 아래로
          </Button>
        )}
      </div>

      <ChatComposer
        value={draft}
        blocked={blocked}
        streaming={isStreaming}
        focusTick={focusTick}
        onChange={setDraft}
        onSubmit={() => void send(draft)}
        onAbort={abort}
      />

      <ConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="대화를 초기화하시겠습니까?"
        description="현재 대화 내용이 모두 삭제됩니다."
        confirmLabel="초기화"
        onConfirm={() => {
          setConfirmOpen(false);
          reset();
        }}
      />
    </div>
  );
}
