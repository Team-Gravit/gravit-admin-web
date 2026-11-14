# PLAN-20261114-style-operations: T1 단계5A — 일반 운영9화면

| 항목 | 내용 |
|---|---|
| 상태 | 커밋됨 (2026-11-14) — 사용자 커밋·푸시 승인 |
| 요청 | QA 샘플을 기준으로 단계5 계획부터 이어가며 기존 미커밋 결과를 모두 보존해요. 승인된 방향 안의 표시·문구 잔여만 이관해요 |
| 범위 밖 | 다른 화면 묶음·API/응답/필터/라우트/권한/상태 전이·public props 의미·입력 접근 이름 등 별도 동작 과제·새 의존성·커밋/푸시/머지 |

## 1. 목적

공용 토큰이 전파된 공지3·유저2·신고2·문의2화면의 고유 강조·문구를 마무리해요. 데이터/고정핀은 중립, 실제 상태만 작은 의미 색, 주요 행동은 결과가 보이는 이름으로 정리해요(P4·P8·V2·V3·V4·W7). 기존 제목→필터→표/카드 순서와 영역 위치를 보존해요(P5).

새 Figma 인테이크는 하지 않아요. 이미 승인된 DS-STYLE-01/02·QA 샘플·기존 before가 입력이며, 승인된 방향을 재제안하지 말라는 현재 지시를 따라요. 단계5 전체 순서는 [진행표](../experiments/style/STAGE5.md)에 기록해요. 구체 변경은 이 계획의 범위에 한정해요.

## 2. 읽은 문서

| 문서 | 절 | 제약 |
|---|---|---|
| AGENTS.md·NEXT_SESSION_PROMPT.md | 전체 | 미커밋 결과 보존·실험 브랜치·화면 묶음별 계획·계약/골격 유지 |
| 00_INDEX.md·decisions.md | 우선순위·D3/D4/D5/D15 | T1 시각만 대체, 자기 계정 정책/원문/상태 불변 |
| antipatterns.md·architecture.md | 전체 | 새 의존성0·@/·feature 직접 import 금지 |
| ui-conventions.md·DS-STYLE-01/02 | 전체 | 승인 토큰·14/22·control8/card12/overlay16·중립 데이터·작은 상태·즉시 본문 |
| DS-01_design_system.md·DS-02_screens.md | 명명·§3~9 | 기존 필드/열/카드/모달 variant·치수 유지 |
| DS-03_interactions.md | §1~5·6 | 확인·닫기·필터·이탈·저장·보고 후 분기·3초 토스트 유지 |
| 01_gravit_admin_wireframe_spec.md | §5·§6-2~4 | 목록/폼·공지 상태 전이·유저 확인·신고 처리 분기 |
| 04_gravit_admin_frontend_spec.md | §9-3~9·§10-3/4/7/8 | 검증/토스트/상태·역할 변경·보고 후 경로·행 내부 버튼 |
| api-contract.md·03_gravit_admin_api_spec.md | 계약 경계·유저/신고/공지 | API 코드는 건드리지 않음. 폼 schema는 고정 문구만 이관, 제약 값/transform 유지 |
| good-patterns.md·testing.md | 전체 | RHF·이탈·오류 우선순위·대상 옆 Vitest·MSW e2e |
| REPORT.md·기존 shared/sample 계획 | 현재 머리말·§11~12 | 이미 적용된 공용 UI/샘플 재작업 없음·기존 접근성 과제 분리 |
| style-designer·implement·write-test·verify-ui·verification-before-completion | 전체 | P/W/V/M 근거·전후 증거·명령 결과 후 완료 주장 |
| shadcn·vercel-react-best-practices·agent-browser | 관련 지침·core | 기존 Radix UI 사용, 새 registry/컴포넌트 도입 없음·SPA 규칙만 적용·명명 세션 |
| 운영4도메인 소스·router·mocks·role-change/shared-ui e2e | schemas/api/queries/mutations·페이지/폼/모달·기존 목 | 현재 callback/요청 payload/캐시/조건은 그대로, 운영 원문을 바꾸지 않음 |

문의는 기존 schema/api/목의 필드·동작을 보존하는 표시 이관만 해요. 신규 계약을 추정하거나 기존 문서의 공통 pagination/날짜 예제로 맞추지 않아요.

## 3. 바뀌는 화면·라우트

| 라우트 | 화면 | 변경·원칙 |
|---|---|---|
| /notices | 공지 목록 | 고정핀 중립·중복 소개 삭제·해요체 빈 안내. header min-h-16으로 기존 표 위치 보존(V2·W1·W5·P5) |
| /notices/new | 공지 작성 | 명확한 게시/임시저장/목록 이름·해요체 토스트·같은 폼/검증(W1·W7) |
| /notices/1 | 공지 상세/편집 | 고정핀 중립·날짜 숫자·해요체 삭제 확인/토스트·구체 행동(W1·W7·V2·V9) |
| /users | 유저 목록 | 중복 소개 삭제·빈 안내·기존 검색/즉시 필터 유지(W1·W5·P5) |
| /users/1001 | 유저 상세 | 날짜/레벨 수치 정렬·역할/상태 확인 이름·주의 의미 보존(V9·W1·W7·V8) |
| /reports | 신고 목록 | 소개 삭제·빈 안내·기존 미해결 기본값/문제 링크 유지(W1·W5·P5) |
| /reports/1024 | 신고 상세 | 인용문 장식선 약화·날짜·해요체 처리 확인/토스트(W1·V1·V9) |
| /inquiries | 문의 목록 | 소개 삭제·빈 안내·기존 PENDING 기본값(W1·W5·P5) |
| /inquiries/5001·5002 | 문의 상세/답변 | 인용문 장식선 약화·날짜·답변 등록/수정/삭제 이름·해요체 안내(W1·W7·W8·V1·V9) |

## 4. 코드 변경 (스키마 → API → 훅 → 컴포넌트 → 페이지 → 라우트 순)

| 파일 | 단위 | 변경 |
|---|---|---|
| src/features/notices/schemas.ts·inquiries/schemas.ts | 폼 검증 | 에러 문구만 §7대로 변경. min/max/trim/enum/응답 schema는 그대로 |
| 각 도메인 api.ts·queries.ts·mutations.ts·router | 계약/상태 | 변경 없음. 기존 요청/캐시/권한/경로 보존 |
| src/features/users/components/UserStatusChangeModal.tsx | 도메인 확인 | 동일 분기·variant·raw enum/who·콜백·pending. 문구/확인 버튼만 명확하게 |
| src/features/notices/components/NoticeEditForm.tsx | 편집 | 해요체 토스트·명확한 저장/편집 취소. 상태 전이/RHF/Markdown/이탈 가드 보존 |
| src/features/inquiries/components/InquiryAnswerSection.tsx | 답변 | 고정 문구·날짜 tabular·버튼만. dirty/busy/reset/등록·수정·삭제/가드/입력 접근 이름 불변 |
| src/pages/{notices,users,reports,inquiries}/*.tsx | 9화면 | §3·7. 이미 맞는 공용 카드/배지/상태는 재구현하지 않음 |
| src/features/users/components/UserStatusChangeModal.test.tsx | 새 단위 | 분기별 raw 데이터·동작별 이름·닫기/확인·pending 계약 |
| src/features/notices/schemas.test.ts·inquiries/schemas.test.ts | 새 단위 | 제한/trim/빈 값 검증과 안내 유지 |
| tests/e2e/style-operations.spec.ts·role-change.spec.ts | 흐름 회귀 | 공지 payload/미저장·유저 확인·신고 분기·문의 답변 payload·4상태. 기존 역할 문구 기대 갱신 |
| src/mocks/handlers.ts | 기존 목 | 변경 없음. 필요한 상태는 브라우저 전용 기존 GET 지연/기존 schema의 응답 치환, MSW 요청만 사용 |

## 5. API 계약 영향 (`docs/spec/03_gravit_admin_api_spec.md`)

없음 — 신규 endpoint/field/query/응답 없음. UI literal·schema의 message만 바꾸며 response parse·min/max/trim·상태 전이·목 원문을 보존해요. 기존 API에서 드러나는 불일치를 스타일에 맞춰 고치지 않아요.

## 6. 상태 4종

| 상태 | 조건 | 화면 동작 |
|---|---|---|
| 로딩 | 기존 목록/상세 isLoading 또는 mutation pending | 같은 데이터 영역 정적 LoadingSkeleton. 기존 disabled/busy만 적용 |
| 빈 상태 | 목록 contents=[] 또는 필터0건 | 도메인별 해요체 안내. 필터/페이지 계산 그대로. 상세 없음은 기존 오류 분기 |
| 오류 | 기존 query 실패 | 같은 ErrorState·재시도·메시지 우선순위. 실패 저장은 원문/현재 위치 보존 |
| 정상 | 기존 MSW 9화면 | 동일 열·필드·원문·수치·코드·권한·선택/확인/이탈/저장/삭제 흐름 |

새 loading indicator/animation을 넣지 않아요. 이번 묶음 모션 변경0이며 공용 모션을 그대로 재사용해요(M1·M6).

## 7. 문구

| 위치 | 지금 → 변경 | 근거 |
|---|---|---|
| 목록 소개4개 | 공지를 등록하고 관리합니다. / 유저의 상태와 권한을 관리합니다. / 유저가 제출한 문제 신고를 처리합니다. / 유저가 제출한 문의에 답변합니다. → 삭제(기존 header 위치 min-h-16 유지) | W5·P10·P5 |
| 목록 빈 안내 | {공지/유저/신고/문의}가 없습니다. → {…}가 없어요. / 조건에 맞는 {…}가 없습니다. → 조건에 맞는 {…}가 없어요. | W1 |
| 공지 폼 schema | 제목/요약/본문은 필수 항목입니다. → 제목/요약/본문을 입력해 주세요. / {N}자 이내로 입력해주세요. → {N}자 이내로 입력해 주세요. | W1·W6·기존 제한 유지 |
| 문의 schema·placeholder | 답변 내용을 입력해주세요. / 입력하세요. → 답변 내용을 입력해 주세요. | W1·같은 min/trim |
| 공지 성공/검증 | 공지가 게시되었습니다. → 공지를 게시했어요. / 임시 저장되었습니다. → 임시 저장했어요. / 저장되었습니다. → 공지를 저장했어요. / 공지가 삭제되었습니다. → 공지를 삭제했어요. / 필수 항목을 확인해주세요. → 필수 항목을 확인해 주세요. | W1·W2 |
| 공지 작성 행동 | 취소 → 목록으로 / 임시저장 → 임시 저장하기 / 게시 → 공지 게시하기 | W7·실제 동작 유지 |
| 공지 편집 행동 | 취소 → 편집 취소 / 저장 → 공지 저장하기 | W7·편집 취소 의미 유지 |
| 공지 삭제 | 공지를 삭제하시겠습니까? → 공지를 삭제할까요? / "{title}" 공지를 삭제합니다. 삭제된 공지는 목록에서 사라집니다. → "{title}" 공지를 삭제해요. 삭제한 공지는 목록에서 사라져요. / 삭제(확인) → 공지 삭제하기 | W1·W4·W7·원문 유지 |
| 유저 상태 확인 | 유저 상태를 변경하시겠습니까? → 유저 상태를 바꿀까요? / {who}을(를) {STATE} 상태로 변경합니다. → {who}을(를) {STATE} 상태로 바꿔요. / 확인 → 상태 변경하기 | W1·W7·raw enum 유지 |
| 유저 삭제 확인 | 유저를 삭제 처리하시겠습니까? → 유저를 삭제 처리할까요? / …DELETED 상태로 변경합니다. 이 작업은 되돌리기 어렵습니다. → …DELETED 상태로 바꿔요. 이 작업은 되돌리기 어려워요. / 삭제 → 삭제 처리하기 | W1·W4·W7·주의 의미 유지 |
| 유저 권한 부여 | 관리자 권한을 부여하시겠습니까? → 관리자 권한을 부여할까요? / {who}에게 관리자 권한을 부여합니다. 백오피스 접근 등 모든 운영 권한이 부여됩니다. → {who}에게 관리자 권한을 부여해요. 백오피스 접근 등 모든 운영 권한을 사용할 수 있어요. / 부여 → 권한 부여하기 | W1·W2·W7 |
| 유저 권한 회수 | 관리자 권한을 회수하시겠습니까? → 관리자 권한을 회수할까요? / {who}의 관리자 권한을 회수합니다. → {who}의 관리자 권한을 회수해요. / 확인 → 권한 회수하기 | W1·W7 |
| 유저 성공 | 변경되었습니다. → 변경했어요. | W1·W2 |
| 신고 확인 | 처리하시겠습니까? → 신고 처리 상태를 바꿀까요? / {해결됨/미해결} 상태로 변경합니다. → {…} 상태로 바꿔요. / 확인 → 처리 상태 변경하기 / 신고가 처리되었습니다. → 신고 처리 상태를 바꿨어요. | W1·W7 |
| 문의 답변 | 답변이 {등록/수정/삭제}되었습니다. → 답변을 {등록/수정/삭제}했어요. / 등록·수정·삭제 버튼 → 답변 등록하기·답변 수정하기·답변 삭제하기 | W1·W2·W7 |
| 문의 삭제 확인 | 답변을 삭제하시겠습니까? → 답변을 삭제할까요? / 답변을 삭제하면 문의 상태가 '대기'로 돌아갑니다. → 답변을 삭제하면 문의 상태가 '대기'로 돌아가요. / 확인 삭제 → 답변 삭제하기 | W1·W7 |
| 문의 이탈 | 저장하지 않은 답변이 있습니다. 페이지를 나가시겠습니까? → 저장하지 않은 답변이 있어요. 페이지를 나갈까요? | W1·W4·같은 가드 |

UI 밖 원문(공지/신고/문의/답변·서버 메시지·이름/닉네임/handle/ID·enum/한글 분류 라벨)은 보존해요(W11). 폼 취소는 모달 닫기와 구분하고 콜백은 바꾸지 않아요(W8·P5).

## 8. 고칠 명세

| 파일 | 절 | 변경 |
|---|---|---|
| DS-STYLE-02_components.md | 운영 화면 잔여 규칙 추가 | 중립 고정핀·인용문·날짜/레벨·도메인 확인 문구 원칙 |
| REPORT.md·STAGE5.md | 단계5A | 감사 대응·문구/4상태·증거·진행/남은 작업 |
| 이 계획 | 검증·Deviation Log | 명령/통과 수·전후·실제 차이 기록 |

기존 DS-00~03은 삭제/일괄 정리하지 않아요. D15의 승인 범위 안이므로 새 기능 결정은 없어요.

## 9. 테스트 계획

| 종류 | 파일 | 확인 |
|---|---|---|
| 단위 Vitest | UserStatusChangeModal.test.tsx | 5가지 분기에서 위험/일반 행동의 접근 이름과 who/enum·확인·닫기·pending 보존 |
| 단위 Vitest | notices/schemas.test.ts·inquiries/schemas.test.ts | 공지 최대 길이 정상/초과·빈 필수·문의 공백 trim/거부·기존 입력 정규화 유지 |
| e2e | style-operations.spec.ts·role-change.spec.ts | 실제 MSW 공지 POST/PATCH payload·raw Markdown·실패/이탈·유저 확인 창 닫기·신고 처리 분기·문의 POST/PUT/DELETE와 dirty·입력 유지 |
| 목 핸들러 | handlers.ts 재사용 | 신규 제품 목 없음. 필요한 오류/빈/지연은 UI 검증 브라우저 또는 테스트에서 기존 GET만 같은 schema로 치환 |
| 전체 | npm run check·test·test:e2e·check:full | 바뀐 표시·문구 기대값을 갱신하고 기능 회귀 확인. schema/props 조건 검사 |
| UI | verify-ui·web-design-guidelines | 9화면×2폭·변형·4상태·긴 본문·원칙별 점검·가로 넘침/셸/영역 실측. 모션 변경0이므로 새 모션 심사 없음 |

## 10. 확인할 화면 (verify-ui)

전체 기존 before를 재캡처하지 않아요. 아래 전 캡처는 이미 존재하며 원본 bytes를 보존해요. 공용 적용 직후와 비교할 때 after/shared/base도 함께 사용해요. 새 변형만 코드 수정 전에 보충해요. 결과는 after/operations/에 남겨요.

| 경로 | 목 데이터 조건 | 볼 것 | 전 캡처 | 후 캡처 |
|---|---|---|---|---|
| /notices·/notices/new·/notices/1 | 기존 MSW·같은 원문 | 3화면·작성/미리보기·pin/날짜·행동·표/폼 위치 | before/{notices,notice-new,notice-detail}-normal-{폭}.png·after/shared/base/동일 | after/operations/동일 |
| /users·/users/1001 | 기존 MSW·권한 확인창만(실제 쓰기 없음) | 검색/역할/상태·raw who/enum·위험 액션·닫기 | before/{users,user-detail}-normal 및 baseline-extra/user-confirm·after/shared/base | after/operations/동일·user-confirm |
| /reports·/reports/1024 | 기존 미해결/같은 본문 | 정보→내용→상태·문제 링크·처리 확인 | before/{reports,report-detail}-normal·after/shared/base | after/operations/동일·report-confirm |
| /inquiries·/inquiries/5001·5002 | 기존 미답변/답변/탈퇴 사용자 | 기존 원문·dirty·답변 행동·인용문/날짜·삭제 창 | before/{inquiries,inquiry-detail}-normal·after/shared/base·새 변형은 baseline-extra/operations | after/operations/동일·inquiry-answered/delete |
| 목록4종 | 기존 GET 브라우저 전용 지연·빈 schema·기존 오류 응답 | 실제 데이터 영역의 로딩/빈/오류/재시도 | baseline-extra/operations에 source 수정 전 보충 | after/operations/{도메인}-{loading,empty,error}-{폭}.png |
| /notices/1·/inquiries/5001 | 기존 목·저장/답변은 자동화 MSW 안에서만 | 긴 원문 full·미저장/실패·값 보존 | before/기존full·새 변형만 보충 | after/operations/full·상태 |

폭은1280/1440×900. Sidebar240/Header56/max1200/padding32/24, h1과 주요 영역 순서·x/폭·y를 측정해요. header 소개 삭제의 위치 차이는 최소 높이64px로 제한해요. 가로 넘침0을 확인해요. 같은 이름 세션·localhost 고포트 strictPort, 종료 시 브라우저/서버 종료해요.

## 11. 결정 필요

없음 — H1/사람 확인2 및 연속 진행 범위 안이에요. 새 토큰·경계·동작·의존성·props 의미가 필요하면 변경 전에 질문해요. 커밋과 푸시는 commit-push의 정확한 대상/메시지를 별도로 보여주고 확인받아요.

## Deviation Log

| 날짜 | 계획 | 실제 | 이유 |
|---|---|---|---|
| 2026-11-14 | 단계별 계획 승인 | 사람 확인2 승인 뒤 “이어서 고고!”에 따라 이 계획을 코드 전 기록하고 진행 | 승인 방향을 다시 묻지 말라는 현재 T1 지시와 연속 진행. 새 범위/동작 결정은 없음 |

## 검증 결과

| 명령·점검 | 결과 |
|---|---|
| npm run check | exit0 — 타입·ESLint0오류/기존4경고·token-lint. 최종 check:full에서도 확인 |
| npm run test | exit0 —15파일54개 통과·실패0. 새14개, 변경 전11실패/3통과 |
| npm run test:e2e | exit0 —110개 통과·실패0(기존101+운영9). 첫105통과/5실패 후 신규 전환 대기 보완·source 고정 재실행 |
| npm run check:full | exit0 — 타입·ESLint·token-lint·빌드. 기존 Browserslist/chunk 경고 유지 |
| verify-ui 점검표 | [REPORT §13](../experiments/style/REPORT.md)·[59PNG manifest](../experiments/style/after/operations/manifest.json)·[실측18행](../experiments/style/after/operations/layout-comparison.json)·[명령 원문](../experiments/style/after/operations/verification/) |

## 자기 점검

- [x] 명세에 없는 엔드포인트·필드·쿼리 없음
- [x] 상태4종 각각 화면 동작이 적혀 있음
- [x] 문구가 기존 소유 위치와 T1 체계에 맞음
- [x] features 간 직접 import 없이 구현 가능
- [x] 테스트 계획에 단위·e2e와 목 재사용/재현 범위가 있음
- [x] 확인할 화면 목록·목 조건·전후 캡처가 있음

## 실제 검증·차이 기록

| 항목 | 결과·처리 |
|---|---|
| 전 캡처 | 기존 before/공용 중간 결과 보존, 구현 전 로딩/빈/오류24장+답변/삭제/신고 창6장 보충 |
| 상태 재현 | agent-browser network route는 MSW 응답에 적용되지 않아 timed out1회. doctor8pass/0fail 확인 후 브라우저 XHR GET만 지연/기존 빈 schema/네트워크 오류로 재현. 제품 목·API 변경 없음 |
| 신규 e2e | 신고 row 클릭 직후 이전 목록의 combobox2개를 잡던 대기 누락 수정. URL/제목을 기다린 뒤 동일 동작 검사 |
| 첫 전체 회귀 |105통과/5실패. QA4건은 메뉴 detached·준비 추적 타이밍 실패. 검사 중 src 테스트 수정으로 Vite page reload가 있었음. QA 제품/테스트를 수정하지 않고 소스 고정 재실행110통과. HMR 영향은 추정이며 별도 기능 수정 없음 |
| 단위 타입 | Testing Library ByRoleOptions에 없는 exact 옵션3곳 제거. Playwright exact와 혼동한 테스트 코드만 수정 |
| 레이아웃 |9화면×2폭18행 셸 x/폭 같음·h1/h3 순서 같음·heading y변화0·가로 넘침0·본문 실행 animation0. 목록 표 y만 header 최소 높이에 따라+2px |
| reduced | 실제 선호true·Dialog scale1·완료 상태, [캡처](../experiments/style/after/operations/reduced-user-confirm-1440.png). 공용 모션 변경 없음 |
| 직접 시각 확인 | 정상9·4상태12·변형6 contact sheet와1280 문의/권한 창 원본 확인. 잘림·색 역할·버튼 위치 점검 |
| 제외·보존 | 초기316파일 원본을 tar로 보관하고 세션 시작SHA-256과316/316 일치 검증. 원본PNG231장 모두 그대로 |
| token-lint 단위 | node --test scripts/checks/token-lint.test.mjs —4통과·실패0·exit0 |
| 정리 | 이름 있는 agent-browser 종료·고포트 dev 서버 SIGINT 종료. 실서버 쓰기 없음 |

최종 단계6 문구 보정: UserStatusChangeModal의 조사 템플릿2곳을 `{who} 계정 상태를 바꿔요: {value}.`로 바꿔요(W1·W6). 원문/enum/확인·잠금은 같고 최종 계획/회귀를 참조해요.
