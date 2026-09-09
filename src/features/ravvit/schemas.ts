import { z } from 'zod';

/**
 * Ravvit(챗봇) 응답 스키마 (decisions D8-2).
 * 이 서비스는 백오피스 API(03)와 별개라 표준 envelope `{code,message}` 를 쓰지 않는다.
 * 단 "모든 응답은 Zod 로 파싱" 규칙은 동일하게 적용된다 — SSE 이벤트 3종 전부 여기서 파싱한다.
 */

export const healthResponseSchema = z.object({
  status: z.string(),
  model: z.string(),
  tools: z.array(z.string()),
  auth: z.string(),
});

/**
 * history 는 서버가 해석하는 **불투명(opaque) 값**이다 (D8-2).
 * 내용을 읽거나 가공하지 않고 그대로 되돌려보내기만 하므로 요소 타입을 규정하지 않는다.
 * (`any` 금지 규칙에 따라 `unknown` — 캐스팅으로 우회하지 않는다.)
 */
export const chatHistorySchema = z.array(z.unknown());

export const chatUsageSchema = z.object({
  inputTokens: z.number(),
  outputTokens: z.number(),
  cacheReadInputTokens: z.number(),
});

// SSE 이벤트 3종 — tool_log 0회 이상 → answer 또는 error 1회로 종료
export const toolLogEventSchema = z.object({ message: z.string() });

export const answerEventSchema = z.object({
  answer: z.string(),
  history: chatHistorySchema,
  usage: chatUsageSchema.optional(),
});

export const errorEventSchema = z.object({ message: z.string() });

export type ChatHistory = z.infer<typeof chatHistorySchema>;
export type ChatUsage = z.infer<typeof chatUsageSchema>;
