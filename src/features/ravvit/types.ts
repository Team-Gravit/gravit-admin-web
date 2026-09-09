import type { ChatHistory, ChatUsage } from '@/features/ravvit/schemas';

export type { ChatHistory, ChatUsage };

/**
 * 화면 전체를 막는 서비스 상태 (RAVVIT_SPEC §A-4).
 * `ok` 외에는 장애 배너 + 입력·칩 비활성.
 */
export type ServiceStatus =
  | 'checking'
  | 'ok'
  | 'unreachable' // GET /health 실패 — 챗봇 서버 무응답
  | 'forbidden' // 403 — ADMIN 아님. 재시도해도 결과가 같아 [다시 확인] 없음
  | 'auth-unavailable'; // 503 — 인증 서버 장애

export type BotStatus = 'pending' | 'done' | 'error' | 'aborted';

export interface UserMessage {
  role: 'user';
  id: string;
  content: string;
}

export interface BotMessage {
  role: 'assistant';
  id: string;
  status: BotStatus;
  toolLogs: string[];
  answer: string | null;
  usage: ChatUsage | null;
  /** SSE error 의 message 원문. 얻지 못한 실패는 null → 화면이 기본 문구를 쓴다. */
  errorMessage: string | null;
}

export type ChatMessage = UserMessage | BotMessage;
