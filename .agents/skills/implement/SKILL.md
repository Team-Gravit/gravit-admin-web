---
name: implement
description: 사용자가 승인한 docs/plans/PLAN-*.md 계획서대로 코드와 명세를 바꾼다. 계획과 다른 점은 Deviation Log 에 남기고 npm run check 통과로 끝낸다. 승인된 계획서가 없으면 쓰지 않고 write-plan 부터 한다.
---

# implement — 승인된 계획서대로 구현

## 시작 조건

- 계획서 `상태` 가 `승인 (YYYY-MM-DD)` 여야 합니다. 초안이거나 계획서가 없으면 멈추고 `write-plan` 으로 돌아갑니다.
- 계획서 "읽은 문서"의 문서를 다시 읽습니다(세션이 바뀌었으면 기억에 의존하지 않습니다).
- 계획서 "확인할 화면"이 있으면 **코드를 고치기 전에** `verify-ui` 의 "전 캡처"를 먼저 찍습니다.

## 절차

1. **순서대로 구현** — 스키마(`schemas.ts`, Zod) → API(`api.ts`) → 훅(쿼리 키 팩토리·mutation·invalidation) → 컴포넌트 → 페이지 → 라우트. 응답은 모두 Zod 로 파싱하고, 타입은 `z.infer` 로 얻습니다.
2. **명세 갱신** — 계획서 "고칠 명세"의 파일을 같은 작업 안에서 고칩니다. 새 결정은 `docs/conventions/decisions.md` 맨 아래에 다음 D 번호로 추가합니다(날짜·근거 포함).
3. **목 갱신** — API 가 바뀌면 `src/mocks/` 핸들러를 계약과 같게 고칩니다(테스트 작성은 `write-test`).
4. **계획과 다를 때**
   - 사소한 차이(파일 이름, 공용 컴포넌트 재사용, 같은 효과의 다른 구현) → 계획서 `Deviation Log` 에 날짜·계획·실제·이유를 적고 계속합니다.
   - 계획 오류·미결정(명세에 없는 필드가 필요, 동작 규칙이 모순, 범위가 커짐) → **멈추고 질문합니다(🙋🏻).** 추측해 채우지 않습니다.
   - 백엔드가 계약과 다르게 응답 → 프론트를 맞추지 말고 `AGENTS.md` 8장대로 기록합니다.
5. **확인** — `npm run check` 를 실행해 통과시킵니다. 실패하면 고치고 다시 실행합니다. 같은 실패가 3번 반복되면 멈추고 원인과 시도한 내용을 보고합니다.
6. **기록** — 계획서 `상태` 를 `구현 완료` 로, "검증 결과"의 `npm run check` 칸에 결과를 적습니다. 다음 단계는 `write-test` 입니다.

## 지킬 것

- `AGENTS.md` 3장 불변 제약. 특히 token-lint(raw hex·arbitrary 값), `features` 간 import, `@/` 절대경로.
- 계획서에 없는 리팩터링·정리·의존성 추가를 하지 않습니다. 필요하면 Deviation Log 가 아니라 질문으로 올립니다.
- 공용 UI 는 `src/shared/components/ui`(shadcn/ui)를 먼저 씁니다. 새 컴포넌트가 필요하면 `shadcn` 스킬을 참고합니다.
- React 패턴은 `vercel-react-best-practices` 를 참고하되 SPA 에 해당 없는 규칙은 뺍니다(`AGENTS.md` 5장).

## 완료

`verification-before-completion` 을 따릅니다. 이번 메시지에서 실행한 `npm run check` 의 출력(오류 0)을 근거로 붙여 보고합니다.
