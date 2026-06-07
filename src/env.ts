import { z } from 'zod';

/**
 * 타입 안전 환경 변수 래퍼 (04 §5-3).
 * 코드에서는 import.meta.env 직접 접근 금지 — 항상 `import { env } from '@/env'` 사용.
 * 누락/형식 오류 시 앱 시작 시점에 명확한 에러로 실패한다.
 */
const envSchema = z.object({
  VITE_API_HOST: z.string().url(),
  /**
   * OAuth dest 값(BACKEND_ADMIN_API_SPEC §8). 백엔드가 이 값으로 admin 도메인 redirect_uri 를 매핑.
   * provider 콘솔의 admin 콜백 등록 + 백엔드 dest 매핑은 인프라 담당.
   */
  VITE_OAUTH_DEST: z.string().min(1),
  /**
   * 목(MSW) 활성 여부. 미설정/'false' → **실서버 연동(기본)**. 'true' → MSW 목 백엔드.
   * 수동 `npm run dev` 는 기본 실서버. Playwright 스모크만 webServer.env 로 'true' 를 주입해 목 유지.
   */
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
