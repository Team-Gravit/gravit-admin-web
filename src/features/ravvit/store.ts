import { create } from 'zustand';
import { RavvitHttpError, checkHealth, sendChat } from '@/features/ravvit/api';
import type { BotMessage, ChatHistory, ChatMessage, ServiceStatus } from '@/features/ravvit/types';

/**
 * Ravvit 대화 상태 (RAVVIT_SPEC §A-5, decisions D8-5).
 * **라우트 컴포넌트 밖의 전역 스토어**여야 한다 — 메뉴를 옮겼다 돌아와도 대화가 유지되고,
 * 응답 대기 중 언마운트로 SSE 가 끊기지 않아야 하기 때문이다.
 * 브라우저 저장소는 쓰지 않는다(새로고침 = 초기화). 사내 문서 내용을 localStorage 에 남기지 않는다.
 */

/** SSE error 의 message 를 얻지 못한 실패에 쓰는 기본 문구 (§A-2 Error). */
export const DEFAULT_ERROR_MESSAGE = '응답을 받지 못했습니다. 잠시 후 다시 시도해 주세요.';

let seq = 0;
const nextId = (): string => `m${(seq += 1)}`;

/** 진행 중 SSE 취소 핸들. 리렌더·직렬화 대상이 아니라 스토어 상태로 두지 않는다. */
let controller: AbortController | null = null;

function patchBot(
  messages: ChatMessage[],
  id: string,
  patch: (bot: BotMessage) => BotMessage,
): ChatMessage[] {
  return messages.map((m) => (m.role === 'assistant' && m.id === id ? patch(m) : m));
}

interface RavvitState {
  messages: ChatMessage[];
  /** 서버가 준 불투명 값. 읽거나 가공하지 않고 다음 요청에 그대로 회신만 한다 (D8-2). */
  history: ChatHistory;
  service: ServiceStatus;
  isStreaming: boolean;
  lastQuestion: string | null;
  /** Empty 안내 문구 추출용 시드. 문구 후보는 닉네임 유무에 따라 달라져 화면이 조합한다. */
  greetingSeed: number;
  draft: string;

  setDraft: (value: string) => void;
  checkService: () => Promise<void>;
  send: (question: string) => Promise<void>;
  retry: () => Promise<void>;
  abort: () => void;
  reset: () => void;
}

export const useRavvitStore = create<RavvitState>((set, get) => {
  /** 봇 메시지 1개를 추가하고 스트림을 끝까지 소비한다. 유저 메시지는 호출부가 책임진다. */
  async function runTurn(question: string): Promise<void> {
    const botId = nextId();
    // 실패한 시도는 history 를 갱신하지 않으므로, 재시도해도 대화 맥락이 어긋나지 않는다 (§A-2).
    const historyAtSend = get().history;

    set((s) => ({
      messages: [
        ...s.messages,
        {
          role: 'assistant',
          id: botId,
          status: 'pending',
          toolLogs: [],
          answer: null,
          usage: null,
          errorMessage: null,
        },
      ],
      isStreaming: true,
      lastQuestion: question,
    }));

    controller = new AbortController();
    const { signal } = controller;

    try {
      await sendChat(
        question,
        historyAtSend,
        {
          onToolLog: (message) =>
            set((s) => ({
              messages: patchBot(s.messages, botId, (b) => ({
                ...b,
                toolLogs: [...b.toolLogs, message],
              })),
            })),
          onAnswer: (answer, history, usage) =>
            set((s) => ({
              history,
              messages: patchBot(s.messages, botId, (b) => ({
                ...b,
                status: 'done',
                answer,
                usage,
              })),
            })),
          onError: (message) =>
            set((s) => ({
              messages: patchBot(s.messages, botId, (b) => ({
                ...b,
                status: 'error',
                errorMessage: message,
              })),
            })),
        },
        signal,
      );
    } catch (error) {
      if (signal.aborted) {
        // 중단: 누적된 도구 로그는 남기고 접는다. 답변은 표시하지 않는다 (§A-3).
        set((s) => ({
          messages: patchBot(s.messages, botId, (b) => ({ ...b, status: 'aborted' })),
        }));
      } else if (error instanceof RavvitHttpError && error.status === 403) {
        set({ service: 'forbidden' });
      } else if (error instanceof RavvitHttpError && error.status === 503) {
        set({ service: 'auth-unavailable' });
      }
    } finally {
      controller = null;
      // 종료 이벤트 없이 스트림이 끊긴 경우까지 여기서 확정한다(대기 상태로 남기지 않는다).
      set((s) => ({
        isStreaming: false,
        messages: patchBot(s.messages, botId, (b) =>
          b.status === 'pending' ? { ...b, status: 'error' } : b,
        ),
      }));
    }
  }

  return {
    messages: [],
    history: [],
    service: 'checking',
    isStreaming: false,
    lastQuestion: null,
    greetingSeed: Math.floor(Math.random() * 1000),
    draft: '',

    setDraft: (draft) => set({ draft }),

    checkService: async () => {
      set({ service: 'checking' });
      try {
        await checkHealth();
        set({ service: 'ok' });
      } catch {
        set({ service: 'unreachable' });
      }
    },

    send: async (question) => {
      const trimmed = question.trim();
      if (!trimmed || get().isStreaming || get().service !== 'ok') return;
      set((s) => ({
        messages: [...s.messages, { role: 'user', id: nextId(), content: trimmed }],
        draft: '',
      }));
      await runTurn(trimmed);
    },

    // 직전 질문을 같은 history 로 재전송. 실패한 봇 메시지만 걷어내고 유저 메시지는 남긴다.
    retry: async () => {
      const { lastQuestion, isStreaming, messages } = get();
      if (!lastQuestion || isStreaming) return;
      const last = messages[messages.length - 1];
      const pruned =
        last && last.role === 'assistant' && last.status !== 'done' ? messages.slice(0, -1) : messages;
      set({ messages: pruned });
      await runTurn(lastQuestion);
    },

    abort: () => controller?.abort(),

    reset: () => {
      controller?.abort();
      set({
        messages: [],
        history: [],
        lastQuestion: null,
        draft: '',
        greetingSeed: Math.floor(Math.random() * 1000),
      });
    },
  };
});
