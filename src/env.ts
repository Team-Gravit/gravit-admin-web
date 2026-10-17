import { z } from 'zod';

/**
 * 타입 안전 환경 변수 래퍼 (04 §5-3).
 * 코드에서는 import.meta.env 직접 접근 금지 — 항상 `import { env } from '@/env'` 사용.
 * 누락/형식 오류 시 앱 시작 시점에 명확한 에러로 실패한다.
 */
const envSchema = z.object({
  VITE_API_HOST: z.string().url(),
  VITE_OAUTH_DEST: z.string().min(1),
  // Ravvit(챗봇) API base (D8-4). 프록시 경로(`/ravvit-api`) 또는 절대 URL 둘 다 허용하므로 .url() 아님.
  VITE_RAVVIT_API_BASE: z.string().min(1),
  // QA(gravit-qa) API base (D9-2). 필수 아님 — 기존 개발자의 .env 가 이 변수 때문에 깨지지 않게 기본값을 둔다.
  VITE_QA_API_BASE: z.string().min(1).default('/qa-api'),
  VITE_USE_MOCK: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('환경 변수 검증 실패:', parsed.error.flatten().fieldErrors);
  throw new Error('환경 변수가 올바르지 않습니다. .env 파일을 확인해주세요.');
}

export const env = parsed.data;
