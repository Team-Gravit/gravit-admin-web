import { setupWorker } from 'msw/browser';
import { handlers } from '@/mocks/handlers';

/** dev 전용 브라우저 목 워커. main.tsx 에서 import.meta.env.DEV 일 때만 start. */
export const worker = setupWorker(...handlers);
