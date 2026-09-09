import { useCallback, useEffect, useRef, useState, type UIEvent } from 'react';
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

/** 읽기 컬럼 폭. 스크롤 컨테이너는 이보다 넓어 **스크롤바가 본문을 침범하지 않는다**. */
const COLUMN = 'mx-auto w-full max-w-3xl';

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
  const { setDraft, checkService, send, regenerate, abort, reset, markRevealed } =
    useRavvitStore.getState();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [focusTick, setFocusTick] = useState(0);
  const [stickToBottom, setStickToBottom] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  // 타이핑 연출은 매 프레임 호출되므로 최신 stick 값을 ref 로 읽는다(콜백 재생성 회피)
  const stickRef = useRef(true);

  useEffect(() => {
    stickRef.current = stickToBottom;
  }, [stickToBottom]);

  // 진입 시 1회 (§A-4). 실패는 배너의 [다시 확인] 으로 수동 재호출한다.
  useEffect(() => {
    void checkService();
  }, [checkService]);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    if (stickToBottom) scrollToBottom();
  }, [messages, stickToBottom, scrollToBottom]);

  /** 답변이 타이핑되며 길어질 때도 하단을 따라간다(메시지 배열은 그대로라 위 effect 가 안 돈다). */
  const handleReveal = useCallback(() => {
    if (stickRef.current) scrollToBottom();
  }, [scrollToBottom]);

  // 사용자가 위로 올리면 자동 고정을 해제한다 — 이전 답변을 읽는 중 끌려 내려가지 않도록.
  const handleScroll = (event: UIEvent<HTMLDivElement>): void => {
    const el = event.currentTarget;
    setStickToBottom(el.scrollHeight - el.scrollTop - el.clientHeight < BOTTOM_THRESHOLD);
  };

  const blocked = service !== 'ok';
  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-full w-full flex-col">
      {/* 상단 액션 줄 — 컨텐츠 폭 전체 기준 우측 정렬이라 Header 의 로그아웃 버튼과 세로로 맞는다 */}
      <div className="mb-2 flex h-9 items-center justify-end">
        <Button
          variant="ghost"
          size="sm"
          disabled={isEmpty || isStreaming}
          onClick={() => setConfirmOpen(true)}
          className="text-fg-secondary"
        >
          <RotateCcw className="h-4 w-4" />
          새 채팅
        </Button>
      </div>

      <div className={COLUMN}>
        <ServiceBanner status={service} onRecheck={() => void checkService()} />
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col">
        {/* 스크롤은 컨텐츠 폭 전체에서 일어나고, 본문은 그 안에서 max-w-3xl 로 중앙 정렬된다 */}
        <div ref={scrollRef} onScroll={handleScroll} className="min-h-0 flex-1 overflow-y-auto">
          <div className={cn(COLUMN, 'flex min-h-full flex-col pb-4')}>
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
              messages.map((message, index) => (
                <div
                  key={message.id}
                  // 턴과 턴 사이(봇 → 다음 유저)를 한 턴 안(유저 → 봇)보다 넓게 둔다 (§B-2)
                  className={cn(index > 0 && (message.role === 'user' ? 'mt-8' : 'mt-3'))}
                >
                  {message.role === 'user' ? (
                    <UserMessageItem content={message.content} />
                  ) : (
                    <BotMessageItem
                      message={message}
                      isLast={index === messages.length - 1}
                      streaming={isStreaming}
                      onRegenerate={() => void regenerate()}
                      onReveal={handleReveal}
                      onRevealed={() => markRevealed(message.id)}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {!stickToBottom && !isEmpty && (
          <Button
            variant="outline"
            size="icon"
            aria-label="맨 아래로"
            title="맨 아래로"
            onClick={() => {
              setStickToBottom(true);
              scrollToBottom();
            }}
            className="absolute bottom-2 left-1/2 h-9 w-9 -translate-x-1/2 rounded-full border-border bg-surface text-fg-secondary shadow-md hover:bg-hover"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className={COLUMN}>
        <ChatComposer
          value={draft}
          blocked={blocked}
          streaming={isStreaming}
          focusTick={focusTick}
          onChange={setDraft}
          onSubmit={() => void send(draft)}
          onAbort={abort}
        />
      </div>

      <ConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="새 채팅을 시작하시겠습니까?"
        description="현재 대화 내용이 모두 삭제됩니다."
        confirmLabel="새 채팅"
        onConfirm={() => {
          setConfirmOpen(false);
          reset();
        }}
      />
    </div>
  );
}
