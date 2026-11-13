---
name: write-test
description: 구현이 끝난 계획서의 테스트 계획대로 Vitest 단위 테스트, Playwright + MSW e2e(tests/e2e), 목 핸들러(src/mocks)를 쓰거나 고친다. npm run test 와 npm run test:e2e 통과로 끝낸다.
---

# write-test — 단위·e2e 테스트

규칙 문서: `docs/conventions/testing.md` (위치·이름·도구). 먼저 읽습니다.

## 절차

1. **테스트 계획 확인** — 계획서 "테스트 계획" 표의 행마다 테스트를 만듭니다. 구현 중 Deviation Log 로 바뀐 동작도 반영합니다.
2. **단위 테스트(Vitest)** — 대상 파일 옆에 `*.test.ts(x)` 를 둡니다.
   - Zod 스키마: 정상 표본 1개 + 거부해야 하는 경계값(누락·`null`·범위·`refine`).
   - 순수 함수·매퍼: 입력별 기대값 표(`it.each`).
   - 컴포넌트: `src/test/render.tsx` 의 `renderWithProviders` 와 `@testing-library/user-event`. 역할·이름(`getByRole`)으로 찾고 구현 세부(클래스명)는 검사하지 않습니다.
   - 네트워크가 필요하면 `msw/node` 의 `setupServer` 로 `src/mocks` 핸들러를 재사용합니다.
3. **e2e(Playwright + MSW)** — `tests/e2e/*.spec.ts`. 설정이 `VITE_USE_MOCK=true` 로 dev 서버를 띄웁니다. 로그인 상태는 `localStorage.setItem('gravit_admin_session', 'true')` 를 `addInitScript` 로 넣는 기존 패턴을 따릅니다.
4. **목 핸들러** — API 를 바꿨으면 `src/mocks/handlers.ts`·`qaHandlers.ts` 등이 새 계약과 같은 모양·오류를 내도록 고칩니다. 목에만 있는 필드를 만들지 않습니다.
5. **회귀 테스트는 레드-그린 확인** — 버그 수정이면 고치기 전 코드(또는 수정을 잠시 되돌린 상태)에서 테스트가 실패하는 것을 보고, 원래대로 돌린 뒤 통과를 확인합니다.
6. **실행** — `npm run test` → `npm run test:e2e`. 실패하면 원인이 테스트인지 코드인지 가려 고칩니다. 코드가 계획과 다르게 동작해야 통과한다면 멈추고 질문합니다.
7. **기록** — 계획서 "검증 결과"에 통과 수를 적고 `상태` 를 `테스트 완료` 로 바꿉니다. 화면이 바뀌었으면 `verify-ui` 로 넘어갑니다.

## 완료

`verification-before-completion` 을 따릅니다. 이번 메시지에서 실행한 두 명령의 통과 수와 실패 0 을 근거로 보고합니다.
