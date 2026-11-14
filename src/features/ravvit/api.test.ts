import { afterEach, describe, expect, it, vi } from 'vitest';
import { sendChat } from '@/features/ravvit/api';
import { reissueAccessToken } from '@/shared/api/client';

vi.mock('@/shared/api/client', () => ({ reissueAccessToken: vi.fn() }));
vi.mock('@/shared/api/tokenManager', () => ({ tokenManager: { getAccessToken: () => 'test-token' } }));

const callbacks = () => ({ onToolLog: vi.fn(), onAnswer: vi.fn(), onError: vi.fn() });
const signal = () => new AbortController().signal;
function sse(raw: string) {
  const bytes = new TextEncoder().encode(raw);
  return new Response(new ReadableStream<Uint8Array>({
    start(controller) {
      // 이벤트와 UTF-8 문자 경계를 가로질러도 원문을 복원해야 해요.
      for (let index = 0; index < bytes.length; index += 7) controller.enqueue(bytes.slice(index, index + 7));
      controller.close();
    },
  }), { headers: { 'Content-Type': 'text/event-stream' } });
}
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.mocked(reissueAccessToken).mockReset(); });

describe('Ravvit SSE 계약', () => {
  it('분할된 도구/완성 답변과 불투명 history·usage를 Zod로 파싱해요', async () => {
    const history = ['OPAQUE', { 원문: [1, null] }];
    const usage = { inputTokens: 1, outputTokens: 2, cacheReadInputTokens: 0 };
    const fetch = vi.fn().mockResolvedValue(sse(`event: tool_log\ndata: ${JSON.stringify({ message: '원문_CODE' })}\n\nevent: answer\ndata: ${JSON.stringify({ answer: '**완성 원문**', history, usage })}\n\n`));
    vi.stubGlobal('fetch', fetch);
    const handlers = callbacks(); await sendChat('질문 원문', history, handlers, signal());
    expect(handlers.onToolLog).toHaveBeenCalledWith('원문_CODE');
    expect(handlers.onAnswer).toHaveBeenCalledExactlyOnceWith('**완성 원문**', history, usage);
    expect(handlers.onError).not.toHaveBeenCalled();
    const init: RequestInit = fetch.mock.calls[0]?.[1];
    expect(init.headers).toEqual({ 'Content-Type': 'application/json', Authorization: 'Bearer test-token' });
    expect(JSON.parse(String(init.body))).toEqual({ question: '질문 원문', history });
  });
  it('401은 공유 재발급 후 같은 질문/history를 한 번 재전송해요', async () => {
    vi.mocked(reissueAccessToken).mockResolvedValue('renewed-test-token');
    const fetch = vi.fn().mockResolvedValueOnce(new Response(null, { status: 401 })).mockResolvedValueOnce(sse('event: error\ndata: {"message":"RAW_ERROR_CODE"}\n\n'));
    vi.stubGlobal('fetch', fetch); const handlers = callbacks();
    await sendChat('질문', ['OPAQUE'], handlers, signal());
    expect(reissueAccessToken).toHaveBeenCalledTimes(1); expect(fetch).toHaveBeenCalledTimes(2);
    const first: RequestInit = fetch.mock.calls[0]?.[1]; const second: RequestInit = fetch.mock.calls[1]?.[1];
    expect(first.body).toBe(second.body);
    expect(second.headers).toEqual({ 'Content-Type': 'application/json', Authorization: 'Bearer renewed-test-token' });
    expect(handlers.onError).toHaveBeenCalledWith('RAW_ERROR_CODE');
  });
  for (const status of [403, 503]) {
    it(`${status}는 재발급 없이 상태를 전달해요`, async () => {
      const fetch = vi.fn().mockResolvedValue(new Response(null, { status })); vi.stubGlobal('fetch', fetch);
      await expect(sendChat('질문', [], callbacks(), signal())).rejects.toMatchObject({ status });
      expect(fetch).toHaveBeenCalledTimes(1); expect(reissueAccessToken).not.toHaveBeenCalled();
    });
  }
  it('잘못된 answer 이벤트는 표시 콜백에 넘기지 않아요', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(sse('event: answer\ndata: {"answer":123,"history":[]}\n\n')));
    const handlers = callbacks(); await expect(sendChat('질문', [], handlers, signal())).rejects.toThrow();
    expect(handlers.onAnswer).not.toHaveBeenCalled();
  });
});
