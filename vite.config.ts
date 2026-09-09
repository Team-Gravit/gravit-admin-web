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
      // Ravvit(챗봇) 프록시 (decisions D8-4). 운영의 Vercel rewrite 와 같은 경로를 로컬에서 재현한다.
      // 동일 출처가 되어 CORS 가 사라지고, `VITE_RAVVIT_API_BASE=/ravvit-api` 하나로 로컬·운영이 통일된다.
      proxy: {
        '/ravvit-api': {
          target: env.VITE_RAVVIT_ORIGIN ?? 'http://localhost:8000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ravvit-api/, '/api'),
        },
      },
    },
  };
});
