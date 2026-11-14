# PLAN-20261114-style-ravvit: T1 단계5F — Ravvit H3

| 항목 | 내용 |
|---|---|
| 상태 | 커밋됨 (2026-11-14) — 사용자 커밋·푸시 승인 |
| 목적 | 완성 SSE 답변 즉시 표시·실제 대기만 표시(P9·M1·M5) |
| 범위 밖 | fetch/SSE파서·history/usage/auth·store 동작·라우트·스크롤 추종 조건·public props 의미·새 의존성·git 실행 |

## 1. 읽은 문서

AGENTS·NEXT_SESSION_PROMPT/STAGE5·00_INDEX·decisions D8/D10/D15·antipatterns·api-contract·architecture·testing·ui-conventions·good-patterns·DS-01명명/DS-03·DS-STYLE-01/02·RAVVIT_SPEC §A/§B(D8·D15가 충돌 부분 대체)·ravvit api/schemas/store/types/hooks/모든 컴포넌트·RavvitPage·기존 MainLayout 조건·mocks handlers/browser·test setup·tokenManager/shared reissue. 승인 H3/기존 before를 입력으로 사용하며 Figma/새 디자인 제안 없음.

## 2. 바뀌는 화면

| 경로 | 변경 | 보존 |
|---|---|---|
| /ravvit | 완성 Markdown 즉시·실제 pending 정적 안내·고정 문구 해요체·추천 칩 즉시 hover | 무제목/768읽기폭·하단입력/상단 새 채팅·원문·도구로그·SSE/대화상태/스크롤 조건 |

## 3. 코드 변경 (계약→목→표시)

| 파일·단위 | 변경 |
|---|---|
| api.ts/schemas.ts/store 로직 | 변경0. store 기본 FE 오류 문자열만 해요체 |
| src/mocks/ravvitHandlers.ts + handlers.ts | D8 GET health/POST chat MSW 핸들러. 요청 question/string·history/unknown[]를 Zod로 검사. health값은 가짜·UI미노출, tool_log→완성 answer 또는error SSE. 검증용 불투명 서버 history를 answer에 제공하고 클라이언트의 그대로 회신을 확인. 목 질문 fixture로 pending/오류/긴답변 지원, 실서버0 |
| BotMessageItem.tsx | useTypewriter 소비 제거·완성 answer 직접 Markdown. 기존 onReveal을 완성 표시 후 1회 호출하고 onRevealed로 표시 완료 기록. isLast/streaming/복사원문/재생성 의미 유지 |
| hooks.ts | 유일 소비자 확인 후 내부 useTypewriter 파일 삭제. public API 아님 |
| types.ts·Conversation 주석 | revealed=표시완료, 타이핑 주석 정리. 필드/콜백/scroll threshold24·조건 변경0 |
| BotMessageItem pending | 점3개 반복 제거·정적 '답변을 만들고 있어요…'. 실제 대기만 표시·reduced 동일 |
| EmptyPrompt/ToolLogBlock/ChatComposer | 추천 칩 transition 제거·로그 숫자 tabular·placeholder 말줄임. 원문 추천질문/로그/Enter·IME·초점·textarea 잠금/높이 로직 보존 |
| ServiceBanner·Conversation·store 기본문구 | 고정 FE 안내만 해요체·다시 시도하기/새 채팅 시작하기. 서버 error.message는 원문 |
| BotMessageItem.test.tsx·style-ravvit.spec.ts | 즉시 전체본문/액션·표시콜백·원문복사/오류·SSE/history·메뉴복귀·중단/재생성·스크롤 회귀 |

기존 tailwind typing-dot 정의는 호환 이름으로 남기고 소비만0으로 해요. 새 timer/RAF·노출상태를 만들지 않아요.

## 4. API 계약 영향

제품 계약 변경0. D8의 `/health` 공개 응답·`/chat` POST+Bearer·이벤트3종과 history 불투명/usage 파싱을 그대로 검증해요. 실제 인증/reissue는 shared 절차, 401 1회·403종착·503비로그아웃을 API 단위 목으로 확인해요. 사내 문서/비밀/실서비스 요청0.

## 5. 상태 4종

| 상태 | 표현·동작 |
|---|---|
| 빈 | 기존 안내1/고정추천3·클릭은 초안/초점만, 자동전송0 |
| 대기 | 정적 pending·로그는 원문 누적/펼침, 입력잠금·중단버튼·라우트 이동 후에도 요청 유지 |
| 오류 | 서버 message 원문·fallback만 해요체, 기존 retry/history. health/403/503배너 구분/잠금 그대로 |
| 정상 | answer 한 이벤트 전체 Markdown 즉시·로그접힘·하단 복사/마지막재생성·링크새탭·불투명history회신 |

## 6. 문구

| 현재 → 변경 | 근거 |
|---|---|
| 답변을 생성하고 있습니다+점3개 → 답변을 만들고 있어요… | W1·M5 |
| 복사되었습니다./복사하지 못했습니다. → 복사했어요./복사하지 못했어요. 다시 시도해 주세요. | W1·W6 |
| 응답을 받지 못했습니다. 잠시 후 다시 시도해 주세요. → 응답을 받지 못했어요. 잠시 후 다시 시도해 주세요. | W1 |
| 응답을 중단했습니다. → 응답을 중단했어요. | W1 |
| 다시 시도 → 다시 시도하기 | W7 |
| 새 채팅을 시작하시겠습니까?/현재 대화 내용이 모두 삭제됩니다./새 채팅(확인) → 새 채팅을 시작할까요?/현재 대화 내용이 모두 삭제돼요./새 채팅 시작하기 | W1·W7 |
| Ravvit 서버/인증 서버에 연결할 수 없습니다. → …연결할 수 없어요. (후속 안내 유지) | W1 |
| Ravvit 사용 권한이 없습니다. → Ravvit 사용 권한이 없어요. (관리자 문의 유지) | W1 |
| 무엇이든 물어보세요. → 무엇이든 물어보세요… | W2 |

서버 Markdown·error.message·tool_log·추천 질문·제공된 닉네임 원문/코드/usage/history는 수정/번역하지 않아요(W11).

## 7. 고칠 명세

DS-STYLE-02에 H3 즉시/대기·REPORT/STAGE5·모션목록·감사 대응·이 계획에 실제 증거. D8 역사/루트 로컬 RAVVIT_SPEC는 수정/스테이징0.

## 8. 테스트 계획

| 종류 | 확인 |
|---|---|
| 단위 red→green | 첫 렌더 전체 Markdown/마지막문장+액션, 재렌더 콜백1회·revealed 재진입·pending/error원문·원문복사·API SSE분할청크/Zod·401/403/503 |
| 목 e2e | 추천입력/Enter·답변/도구/복사·history그대로/재생성 이전스냅샷·다른메뉴복귀/대기중이탈·중단/다시시도·스크롤위고정해제/맨아래·리로드초기화 |
| 전체 | check:full·Vitest·목e2e, 실제 backend 쓰기 없음 |

## 9. 확인할 화면 (verify-ui)

| 경로·목 조건 | 볼 것 | 전 → 후 |
|---|---|---|
| /ravvit 기본 | 무제목/셸·안내·추천·입력 | before기존 + baseline-extra/ravvit → after/ravvit |
| 목 정상/긴답변 | 완성Markdown/복사·마지막재생성/도구접힘/컬럼·표/코드 overflow | 목 추가 후 표시 코드 전 보충 → 후 캡처 |
| 목 pending/error/health오류 | 정적 대기/로그·인라인오류/배너·잠금/중단 | 같은 목 전후 |
| 새 채팅 확인/스크롤/reduced | 원래 흐름·고정조건/맨아래·즉시 | 같은 목 전후 |

1280/1440×900·긴답변full·reduced. 최신 web-design-guidelines·review-animations 점검. 원문 합성 fixture는 검증 전용이며 실제 사용자 정보 없음. 브라우저/고포트 서버 종료.

## 10. 결정 필요

없어요. 승인 H3로 문자 타이핑만 걷고 callback은 표시 완료/스크롤 알림 의미로 유지해요. 새로운 경계/의존성/props 의미 변경이 생기면 변경 전 질문해요.

## Deviation Log

| 날짜 | 계획 | 실제·이유 |
|---|---|---|
|2026-11-14|계획 먼저|연속 진행 승인으로 코드 전 작성|

## 검증 결과

| 명령·점검 | 결과 |
|---|---|
|check:full·test·test:e2e|구현 후 실제 결과|
|verify-ui/웹/모션/위치|구현 후 증거|

## 자기 점검

- [x] 명세 밖 API/필드/쿼리 없음·불투명 history 경계
- [x]4상태/전후/테스트·목 계획 있음
- [x]public props/권한·라우트·스크롤 조건 불변

### 실제 검증·verify-ui

| 점검 | 결과·처리 |
|---|---|
| check:full | exit0·타입/ESLint0오류/기존4경고·token/build. 기존 Browserslist/큰chunk 경고 |
| Vitest |22파일78개 통과·실패0·exit0. 표시 red3실패1통과→4통과, API5개 포함. API 첫5실패는 Node 전역localStorage 테스트 의존, 변경하지 않는 tokenManager 경계를 mock하여 API 자체 검증 |
| 전체 목e2e |133개 통과·실패0·exit0. 신규7개로 추천/원문복사·SSE/history·메뉴복귀/진행중이탈·중단·오류재시도/403/503·스크롤 추종/새채팅/리로드 검증 |
| 초기 신규e2e |6통과1실패. 키보드 전송 직후 공용 버튼 opacity80ms까지 실행0으로 기대한 테스트 수정: expect.poll로 일회성 피드백 종료 후 실제 대기 중 반복animation0 확인. 제품 모션 수정0 |
| 캡처 |baseline-extra/ravvit18PNG→after/ravvit18+contact1, 두 폭·8상태/긴full. 답변/오류/pending/모달/배너 직접 확인 |
| 위치 |16행 셸/768읽기폭·하단입력 rect 동일·overflow0. 타이핑/점반복 제거·보통/reduced 정적 대기0. 새 fixture의 table을 유효Markdown으로 묶어 후 캡처만 보충했으며 본문 내부 높이는 레이아웃 불변 판단에 쓰지 않음 |
| 최신 웹 |2026-11-14 GitHub command.md 수신. 액션 접근 이름·새탭/안전rel·원문·본문넘침 확인. ChatComposer 입력명/ToolLogBlock focus/aria-expanded는 기존 별도 접근성 과제 |
| review-animations |Approve. useTypewriter/interval24ms/1600ms 제거·완성전체 즉시·표시완료 콜백1회·pending정적. 기존 scroll조건24px/고정 해제·재개 보존. 새 timer/RAF 제품0 |
| 보존 |api.ts/schemas.ts·store 로직·auth/history/usage/중단·재생성·스크롤 조건 변경0. mock만 새 계약 fixture. store는 fallback 문자열만 변경 |

증거: [manifest](../experiments/style/after/ravvit/manifest.json)·[위치](../experiments/style/after/ravvit/layout-comparison.json)·[명령](../experiments/style/after/ravvit/verification/commands.json).
