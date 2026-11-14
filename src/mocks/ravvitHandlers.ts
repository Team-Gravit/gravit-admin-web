import { http, HttpResponse } from 'msw';
import { z } from 'zod';
import { env } from '@/env';
import { chatHistorySchema } from '@/features/ravvit/schemas';

const base = env.VITE_RAVVIT_API_BASE.replace(/\/$/, '');
const endpoint = base.startsWith('http') ? base : `*${base}`;
const requestSchema = z.object({ question: z.string(), history: chatHistorySchema });

/** 검증 전용 불투명 서버 값. 제품 코드는 내용을 읽거나 표시하지 않아요. */
const opaqueHistory = ['OPAQUE_MOCK_CONTEXT', { nested: ['원문_CODE', 1, null] }];

export const RAVVIT_MOCK_ANSWER = [
  '## 목 답변',
  '요청한 문서의 확인 결과예요.',
  '| 항목 | 값 |\n| --- | --- |\n| 원문_CODE | 12,345 |',
  '```ts\nconst raw = "원문_CODE";\n```',
  '[확인 문서](https://example.com/mock)',
  '마지막 문장: ANSWER_COMPLETE',
].join('\n\n');

const event = (name: string, payload: unknown) =>
  new TextEncoder().encode(`event: ${name}\ndata: ${JSON.stringify(payload)}\n\n`);

export const ravvitHandlers = [
  http.get(`${endpoint}/health`, () =>
    HttpResponse.json({ status: 'ok', model: 'mock-model', tools: ['mock-tool'], auth: 'mock-auth' }),
  ),
  http.post(`${endpoint}/chat`, async ({ request }) => {
    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) return HttpResponse.json({ message: '목 요청 형식 오류' }, { status: 400 });
    const { question } = parsed.data;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(event('tool_log', { message: 'search_mock({"query":"원문_CODE"})' }));
        if (question === '[목] 대기') return;
        const finish = () => {
          if (question === '[목] 오류') {
            controller.enqueue(event('error', { message: 'RAW_ERROR_CODE: 원문 오류예요.' }));
          } else {
            const answer = question.includes('긴 답변')
              ? `${RAVVIT_MOCK_ANSWER}\n\n${Array.from({ length: 45 }, (_, index) => `문단 ${index + 1}: 스크롤 확인을 위한 목 문서 원문이에요. 내용을 읽는 동안 자동으로 이동하지 않아요.`).join('\n\n')}\n\nLONG_ANSWER_COMPLETE`
              : RAVVIT_MOCK_ANSWER;
            controller.enqueue(event('answer', {
              answer,
              history: opaqueHistory,
              usage: { inputTokens: 10, outputTokens: 20, cacheReadInputTokens: 0 },
            }));
          }
          controller.close();
        };
        if (question.startsWith('[목] 느린')) timer = setTimeout(finish, 1500);
        else finish();
      },
      cancel() {
        if (timer !== undefined) clearTimeout(timer);
      },
    });
    return new HttpResponse(body, { headers: { 'Content-Type': 'text/event-stream' } });
  }),
];
