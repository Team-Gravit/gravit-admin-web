import { z } from 'zod';

/**
 * 타입 안전 환경 변수 래퍼 (04 §5-3).
 * 코드에서는 import.meta.env 직접 접근 금지 — 항상 `import { env } from '@/env'` 사용.
 * 누락/형식 오류 시 앱 시작 시점에 명확한 에러로 실패한다.
 */
const envSchema = z.object({
  VITE_API_HOST: z.string().url(),
  VITE_GOOGLE_CLIENT_ID: z.string().min(1),
  VITE_KAKAO_JAVASCRIPT_KEY: z.string().min(1),
  VITE_NAVER_CLIENT_ID: z.string().min(1),
  VITE_NAVER_CALLBACK_URL: z.string().url(),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('환경 변수 검증 실패:', parsed.error.flatten().fieldErrors);
  throw new Error('환경 변수가 올바르지 않습니다. .env 파일을 확인해주세요.');
}

export const env = parsed.data;
