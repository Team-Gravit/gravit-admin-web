# 규칙 — 안티패턴 (하지 말 것)

> 발견 즉시 수정. 일부는 `npm run check`(타입·ESLint·token-lint)와 Codex 훅이 자동으로 잡는다. 근거는 [명세 인덱스](../spec/00_INDEX.md)·[architecture](architecture.md)·[api-contract](api-contract.md)·[ui-conventions](ui-conventions.md).

## 타입·계약
- ❌ `any` / 무검증 캐스팅 / 응답을 Zod 없이 그대로 사용.
- ❌ 명세에 없는 엔드포인트·필드·쿼리 파라미터 생성(환각).
- ❌ enum 값 임의 추가·변경. 상태전이 제약 무시.
- ❌ **주관식 정답을 `answers` 배열·다중 정답·"1요소 배열로 보존"으로 구현 / `content` 를 `List<String>` 등으로 분해 / 정답 추가·삭제 UI / GET↔PATCH 모델 불일치.** 주관식 정답은 **단일 객체 `{ answerId, content(콤마 String 1개), explanation }` 1개 고정**(prod·staging·GET·PATCH 전부 동일). → [decisions](decisions.md) D1·D2. (`03` 의 `answers` 배열 표기는 stale — D1 이 권위)

## 아키텍처
- ❌ `features/{a}` 가 `features/{b}` 직접 import. (→ shared 로 승격)
- ❌ 상대경로 import(`../../`). `@/` alias 만.
- ❌ 도입 금지 라이브러리: CSS-in-JS(emotion/styled), Formik, Redux Toolkit, SWR, moment/dayjs. (04 §4-2 — 각각 Tailwind/RHF/Zustand/TanStack/date-fns 로 통일)

## 시각
- ❌ raw hex·매직 px·arbitrary 값(`[12px]`). 토큰만.
- ❌ 반응형/모바일/태블릿/다크모드 코드.
- ❌ shadcn/ui 우회한 임의 컴포넌트(토큰 경유 확장만 허용).

## 흐름·안전
- ❌ 계획서 없이 `src/` 동작 변경, 또는 계획서 하나에 무관한 변경 여러 개. **계획서 1개 = 변경 1개.** (`write-plan`)
- ❌ 승인 전 계획서로 구현 시작. 계획과 다른 구현을 Deviation Log 없이 진행.
- ❌ `npm run check`·`npm run test`·`npm run test:e2e` 결과를 보지 않고 "완료·통과" 선언.
- ❌ 계획서 "고칠 명세"에 없는 명세 수정, 또는 기능은 바꾸고 명세는 그대로 두기.
- ❌ 비가역/외부 작업 직접 실행: 실제 promote, 배포/publish, 강제 푸시, `.env` 비밀값 입력. → **코드 구조만 만들고 사람에게 위임.** (`main` 푸시는 `commit-push` 로 사용자 확인 후에만)
- ❌ `git add -A`·`git add .` — git 밖에 둔 로컬 문서(`.env.development`, `QA_SPEC.md`, `RAVVIT_SPEC.md`, 핸드오프 문서)가 섞인다.
- ❌ 불명확한 명세를 추측으로 채우기. → 멈춰 질문(🙋🏻).
