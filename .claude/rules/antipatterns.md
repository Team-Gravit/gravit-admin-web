# 규칙 — 안티패턴 (하지 말 것)

> 발견 즉시 수정. 다수는 게이트/훅이 자동 차단한다. 근거는 [[source-of-truth]]·[[architecture]]·[[api-contract]]·[[ui-conventions]].

## 타입·계약
- ❌ `any` / 무검증 캐스팅 / 응답을 Zod 없이 그대로 사용.
- ❌ 명세에 없는 엔드포인트·필드·쿼리 파라미터 생성(환각).
- ❌ enum 값 임의 추가·변경. 상태전이 제약 무시.
- ❌ **주관식 정답을 `answers` 배열·다중 정답·"1요소 배열로 보존"으로 구현 / `content` 를 `List<String>` 등으로 분해 / 정답 추가·삭제 UI / GET↔PATCH 모델 불일치.** 주관식 정답은 **단일 객체 `{ answerId, content(콤마 String 1개), explanation }` 1개 고정**(prod·staging·GET·PATCH 전부 동일). → [[decisions]] D1·D2. (`03` 의 `answers` 배열 표기는 stale — D1 이 권위)

## 아키텍처
- ❌ `features/{a}` 가 `features/{b}` 직접 import. (→ shared 로 승격)
- ❌ 상대경로 import(`../../`). `@/` alias 만.
- ❌ 도입 금지 라이브러리: CSS-in-JS(emotion/styled), Formik, Redux Toolkit, SWR, moment/dayjs. (04 §4-2 — 각각 Tailwind/RHF/Zustand/TanStack/date-fns 로 통일)

## 시각
- ❌ raw hex·매직 px·arbitrary 값(`[12px]`). 토큰만.
- ❌ 반응형/모바일/태블릿/다크모드 코드.
- ❌ shadcn/ui 우회한 임의 컴포넌트(토큰 경유 확장만 허용).

## 흐름·안전
- ❌ 여러 화면/항목 동시 구현. **한 번에 하나**(체크리스트 1항목).
- ❌ 게이트 red 상태로 "완료" 선언. (Stop 훅이 차단 → [[hooks]])
- ❌ `IN_PROGRESS` 2개 이상.
- ❌ `.claude/spec/` 수정. (PreToolUse 훅 차단)
- ❌ 비가역/외부 작업 직접 실행: 실제 promote, 배포/publish, `git push`, `.env` 비밀값 입력. → **코드 구조만 만들고 사람에게 위임.**
- ❌ 불명확한 명세를 추측으로 채우기. → 멈춰 질문(🙋🏻).
