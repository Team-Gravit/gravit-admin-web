# 규칙 — 테스트

> 도구: Vitest 3.2 + Testing Library + jsdom(단위), Playwright + MSW(e2e). 절차는 `write-test` 스킬, 화면 캡처는 `verify-ui` 스킬.

## 종류와 위치

| 종류 | 위치 | 실행 | 대상 |
|---|---|---|---|
| 단위·컴포넌트 | **테스트 대상 파일 옆** `*.test.ts` / `*.test.tsx` | `npm run test` (`test:watch`) | Zod 스키마, 순수 함수·매퍼, 상태가 있는 컴포넌트 |
| 테스트 공용 | `src/test/` (`setup.ts`, `render.tsx`) | — | jest-dom 매처, jsdom 보강, `renderWithProviders` |
| e2e | `tests/e2e/*.spec.ts` | `npm run test:e2e` | 라우팅·여러 화면에 걸친 흐름, 목 API 와의 계약 |
| OAuth·쿠키 | `tests/auth/*.spec.ts` | `npm run test:auth` | 실제 브라우저 쿠키 전송·OAuth 콜백 |

- **위치 규칙: 단위 테스트는 대상 옆에 둔다**(`tests/unit/` 을 쓰지 않는다). 기능 폴더(`features/{domain}`)와 함께 옮겨지고, `tsconfig` 의 `src` 범위에 들어가 `npm run check` 의 타입 검사를 받는다.
- import 는 제품 코드와 같이 `@/` 절대경로만 쓴다. `src/test/` 는 테스트에서만 import 한다(제품 코드에서 import 금지).
- Vitest 는 `src/**/*.test.{ts,tsx}` 만 모은다(`vite.config.ts` `test.include`). `tests/` 는 Playwright 전용이다.

## 단위 테스트 작성

- `describe`·`it`·`expect` 를 `vitest` 에서 직접 import 한다(globals 끔).
- 테스트 이름은 한국어로, "조건이면 결과" 형태로 쓴다.
- 컴포넌트는 `renderWithProviders`(새 QueryClient·TooltipProvider) + `userEvent.setup()`. 요소는 역할·접근 이름(`getByRole('button', { name })`)으로 찾고 클래스명·DOM 구조는 검사하지 않는다.
- `src/env.ts` 가 import 시점에 환경 변수를 검증하므로 Vitest 는 `test.env` 의 더미 값을 쓴다. 실제 `.env*` 값에 의존하지 않는다.
- 네트워크가 필요하면 `msw/node` 의 `setupServer` 로 `src/mocks` 핸들러를 재사용한다. 실서버로 요청을 보내지 않는다.
- 회귀 테스트는 레드-그린을 확인한다(고치기 전에 실패하는 것을 본다).

## e2e 작성

- `playwright.config.ts` 가 `VITE_USE_MOCK=true` 로 dev 서버를 띄운다(MSW). 목 핸들러는 계약(`docs/spec/03`·해당 D 항목)과 같은 모양을 유지한다.
- 로그인 상태: `page.addInitScript(() => localStorage.setItem('gravit_admin_session', 'true'))`.
- 실서버 변경 요청(공유 dev 서버 쓰기)은 e2e 에서 하지 않는다.

관련: [good-patterns](good-patterns.md) · [api-contract](api-contract.md)
