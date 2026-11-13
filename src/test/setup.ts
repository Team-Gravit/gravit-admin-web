// Vitest 공통 setup (vite.config.ts test.setupFiles). jest-dom 매처와 jsdom 에 없는 브라우저 API 보강.
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// globals 를 끈 상태라 Testing Library 자동 cleanup 이 등록되지 않는다 — 직접 등록한다.
afterEach(() => cleanup());

// Radix(Popper·DropdownMenu·Tooltip)가 쓰지만 jsdom 에 없는 API. 테스트 환경에서만 최소 구현으로 채운다.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub;

const elementProto = Element.prototype as Element & {
  hasPointerCapture?: (pointerId: number) => boolean;
  releasePointerCapture?: (pointerId: number) => void;
  scrollIntoView?: () => void;
};
elementProto.hasPointerCapture ??= () => false;
elementProto.releasePointerCapture ??= () => {};
elementProto.scrollIntoView ??= () => {};
