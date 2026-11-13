/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: {
        // Ravvit(챗봇) 프록시 (decisions D8-4). 운영의 Vercel rewrite 와 같은 경로를 로컬에서 재현한다.
        // 동일 출처가 되어 CORS 가 사라지고, `VITE_RAVVIT_API_BASE=/ravvit-api` 하나로 로컬·운영이 통일된다.
        '/ravvit-api': {
          // 로컬에 챗봇을 띄운 경우 VITE_RAVVIT_ORIGIN=http://localhost:8000 으로 덮어쓴다
          target: env.VITE_RAVVIT_ORIGIN ?? 'https://gravit-chatbot-sepia.vercel.app',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ravvit-api/, '/api'),
        },
        // QA(gravit-qa) 프록시 (decisions D9-4). 운영의 Vercel rewrite 와 같은 경로를 로컬에서 재현한다.
        // 동일 출처가 되어 CORS 가 사라지고, `VITE_QA_API_BASE` 기본값 `/qa-api` 하나로 로컬·운영이 통일된다.
        '/qa-api': {
          // 로컬에 QA 서버를 띄운 경우 VITE_QA_ORIGIN=http://localhost:8080 으로 덮어쓴다
          target: env.VITE_QA_ORIGIN ?? 'https://grav-it-qa.inuappcenter.kr',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/qa-api/, '/api/v1'),
        },
      },
    },
    // Vitest 단위 테스트 (docs/conventions/testing.md). e2e(tests/e2e)·auth(tests/auth)는 Playwright 몫이라 제외한다.
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.{ts,tsx}'],
      setupFiles: ['./src/test/setup.ts'],
      // src/env.ts 가 import 시점에 검증하므로 테스트 전용 더미 값을 준다(비밀 값 아님, 네트워크 미사용).
      env: {
        VITE_API_HOST: 'http://localhost:5999',
        VITE_OAUTH_DEST: 'test',
        VITE_RAVVIT_API_BASE: '/ravvit-api',
        VITE_QA_API_BASE: '/qa-api',
        VITE_USE_MOCK: 'false',
      },
      restoreMocks: true,
    },
  };
});
