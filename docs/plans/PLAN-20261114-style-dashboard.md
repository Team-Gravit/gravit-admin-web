# PLAN-20261114-style-dashboard: T1 단계5D — 대시보드

| 항목 | 내용 |
|---|---|
| 상태 | 커밋됨 (2026-11-14) — 사용자 커밋·푸시 승인 |
| 요청 | 기존 카드/DAU·MAU 데이터와 위치를 유지하고 읽기 위계·부분 집계 대비·즉시 차트를 적용 |
| 범위 밖 | API/집계/기간/증감 계산/권한/라우트/props 의미·차트 합치기/새 기능·새 의존성·커밋/푸시/머지 |

## 1. 목적

세 요약과 DAU/MAU 두 차트를 같은 자리에서 즉시 읽게 해요(P3·P9·V9·M6). 비조작 증감 수치는 중립으로, 부분 MAU는 승인된 N400과 설명으로 구분해요(V2·V8·V10). 기존 값/범위/tooltip·서버 집계를 보존해요(P5). 새 Figma 없이 승인된 DS/기존 before를 사용해요.

## 2. 읽은 문서

| 문서 | 절 | 제약 |
|---|---|---|
| AGENTS·NEXT_SESSION_PROMPT·STAGE5 | 현재·D 지도 | 실험/dirty 보존·계획 먼저·대시보드 고유 범위 |
| 00_INDEX·decisions·antipatterns | D7·D15 | 별도 DAU/MAU·부분 집계·파라미터 생략·시각만 대체 |
| ui-conventions·DS-01·DS-02·DS-03 | 토큰/명명·화면2·4상태/표시 | 셸/요약3개 위치·기존 행동/상호작용 |
| DS-STYLE-01/02 | 색·부분 N400·수치·모션 | 데이터 중립·본문/차트 즉시·기존 의미 이름 |
| 01·03·04·good-patterns | §6-1·§4-1·상태/오류·쿼리 | summary/권한·요청/캐시/집계 보존 |
| architecture·testing | 전체 | @/·기존 구성·단위/목e2e |
| dashboard 소스·page·mocks·설치 Recharts 타입/Chart | schema/api/query·3카드 | response/기간/순서·props·값 불변. 설치 Tooltip/Area/Bar의 isAnimationActive 사용 |
| shadcn chart docs·verify-ui·web-design-guidelines·review-animations | 공식 예제/절차 | 기존 Chart 재사용·네트워크 최신 지침·모션/두 폭/증거 |

## 3. 바뀌는 화면·라우트

| 라우트 | 화면 | 변경 |
|---|---|---|
| / | 대시보드 | 제목/요약3/차트2 순서·폭 유지. 반복 소개 삭제+min-h-16·숫자 tabular·비조작 증감 중립·차트/hover 즉시·부분 MAU 대비 |

## 4. 코드 변경 (스키마 → API → 훅 → 컴포넌트 → 페이지 → 라우트 순)

| 파일 | 단위 | 변경 |
|---|---|---|
| dashboard schemas/api/queries·router·mocks | 계약 | 변경0 |
| StatCard.tsx | 요약 | 숫자 tabular·정적 hover·키보드 focus ring. 기존 Link/props/값/아이콘/경로 그대로 |
| DauChartCard.tsx | DAU | Area·Tooltip isAnimationActive=false. 기존 sign/증감·원문/포맷 유지, 숫자는 중립 tabular |
| MauChartCard.tsx | MAU | Bar·Tooltip 즉시. 부분 bar는 N400/불투명, 완료 bar N600. inProgress/이전달 참고값/기간/tooltip 그대로 |
| globals.css | 의미 alias | --chart-mau-partial: var(--fg-disabled) 추가. 승인된 N400 재사용, 기존 이름/값 의미와 팔레트 불변 |
| DashboardPage.tsx | 고유 표시 | 소개 삭제/min-height·실제 summary 대기 때만 같은160px의 흰 카드/정적 막대. 정상 요약 위치/링크/집계 유지 |
| StatCard.test.tsx·style-dashboard.spec.ts | 검증 | 값/이동·요청/3카드/2차트·부분 신호·정상/reduced 즉시·4상태 |

## 5. API 계약 영향 (`docs/spec/03_gravit_admin_api_spec.md`, D7)

없음 — summary·daily·monthly의 GET/파라미터 생략·배열/집계/날짜/증감·inProgress는 그대로예요. 비어 있는 구간 보간/추가 비교 없음. 부분 막대 색 alias는 이미 승인된 N400을 역할 이름으로 연결하는 구현 선택이며 새 색이나 기존 public props 의미 변경은 없어요.

## 6. 상태 4종

| 상태 | 조건 | 화면 동작 |
|---|---|---|
| 로딩 | 기존 summary/daily/monthly isLoading | 같은 영역의 정적 skeleton. summary160px는 page와 같은색이 되지 않도록 흰면+내부막대 |
| 빈 | 기존 chart points=[] | 같은 EmptyState·해요체 안내, 요약/다른 차트 유지 |
| 오류 | 기존 각 query 실패 | 같은 ErrorState/각 retry·다른 카드 독립 상태 유지 |
| 정상 | 기존 points/summary | 기존 값/카드3·차트2·부분 MAU/툴팁·숫자 즉시, reduced도 동일 |

## 7. 문구

| 위치 | 현재 → 변경 | 근거 |
|---|---|---|
| 소개 | 운영 현황을 한눈에 확인합니다. → 삭제, 기존 header 높이 유지 | W5·P5 |
| 빈 차트 | 아직 집계된 데이터가 없습니다. → 아직 집계된 데이터가 없어요. | W1 |
| 부분 MAU | 마지막 막대는 이번 달 진행 중 집계로, 지난 달과 직접 비교할 수 없습니다. → 마지막 막대는 이번 달 집계 중이에요. 지난달과 직접 비교할 수 없어요. | W1·W6·원래 뜻 유지 |

PENDING·DAU·MAU 등 운영 원문/이름과 숫자/날짜는 바꾸지 않아요(W11).

## 8. 고칠 명세

| 파일 | 절 | 변경 |
|---|---|---|
| DS-STYLE-01 | 이름 이관/부분 집계 | 승인 N400의 chart-mau-partial alias·흰면 비텍스트 대비 |
| DS-STYLE-02·REPORT·STAGE5 | 단계5D | 요약/부분/모션·검증/잔여 |
| 이 계획 | 차이/검증 | 실제 증거/결과 |

## 9. 테스트 계획

| 종류 | 파일 | 확인 |
|---|---|---|
| 단위 | StatCard.test.tsx | 전달 원문/수치 포맷/Link 목적지·클릭 의미 유지 |
| e2e | style-dashboard.spec.ts |3 GET·파라미터 생략·summary값/링크·별도 차트2/부분 신호·보통/reduced 즉시 graphic·tooltip |
| 목 | handlers.ts 재사용 | 변경0, chart GET만 브라우저에서 hold/points=[]/오류로4상태 재현 |
| UI/모션 | verify-ui·최신web·review-animations | 2폭·4상태·hover/부분색·레이아웃·reduced·animation0·대비 |

## 10. 확인할 화면 (verify-ui)

| 경로 | 목 데이터 조건 | 볼 것 | 전 캡처 | 후 캡처 |
|---|---|---|---|---|
| / | 기존 정상/tooltip | 요약3·차트2/수치·기간·부분 막대·영역/위치 | before/dashboard-normal·after/shared/base 대응 보존 | after/dashboard/정상·tooltip·full |
| / | daily/monthly GET 지연·빈·오류 | 각 차트 독립4상태·재시도·다른 카드 유지 | source 전 baseline-extra/dashboard 보충 | after/dashboard/4상태 |
| / | summary GET 지연 | 흰면의 보이는 정적 placeholder·높이160 유지 | source 전 보충 | after/dashboard/summary-loading |
| / | reduced-motion:reduce | 정상과 같은 즉시 데이터·차트/hover 이동 연출0 | 기존 정상 기준 | after/dashboard/reduced |

1280/1440×900·full/hover 보충. 셸/heading/요약/차트 순서·x/폭·y/overflow 측정. 고포트 localhost·명명 브라우저·완료 후 종료해요.

## 11. 결정 필요

없음 — H1·D7의 데이터/기능을 유지하며 승인된 시각/모션을 구현해요. 새 경계/props/의존성이 필요하면 변경 전에 질문해요.

## Deviation Log

| 날짜 | 계획 | 실제 | 이유 |
|---|---|---|---|
| 2026-11-14 | 계획 먼저 | 연속 진행 승인으로 코드 전 기록 | 승인된 H1 범위 |

## 검증 결과

| 명령·점검 | 결과 |
|---|---|
| npm run check | 구현 후 |
| npm run test | 구현 후 |
| npm run test:e2e | 구현 후 |
| npm run check:full | 구현 후 |
| verify-ui 점검표 | 구현 후 |

## 자기 점검

- [x] 명세 밖 endpoint/필드/쿼리 없음
- [x]4상태 동작 있음
- [x] 고정 문구/운영 원문 경계 유지
- [x] feature 직접 import 추가 없음
- [x] 단위/e2e·목 재사용/상태 계획 있음
- [x] 경로/목 조건/전후 목록 있음

### 실제 검증·verify-ui

| 점검 | 결과·처리 |
|---|---|
| check:full | exit0·타입/ESLint0오류(기존4경고)·token/build. 기존 Browserslist/큰chunk 경고 유지 |
| Vitest |19파일67개 통과·실패0·exit0. 첫 신규2실패는 테스트에 Router 누락, MemoryRouter 보충 후 전체 재실행 |
| 전체 목e2e |123개 통과·실패0·exit0(58.7s). 신규3개: 3GET/query생략·2차트/부분121/tooltip/링크·빈 상태·reduced |
| 전후 |baseline-extra/dashboard14PNG → after/dashboard14PNG+contact1. manifest/layout-comparison12행, 직접 contact 확인 |
| 위치 |12/12 셸 동일·제목 순서 동일·overflow0. h1 y0, 차트 h2 +2px(소개 삭제 후 header64px). 요약/차트 순서/폭 보존 |
| 모션 review-animations |Approve: Area/Bar/Tooltip isAnimationActive=false, 카드transition 제거. 보통/reduced main 실행 animation0·정적 skeleton. 사용 빈도에 맞는 즉시 읽기(M6) |
| 최신 웹 가이드 |https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md (2026-11-14). StatCard focus ring·Link/숫자 tabular·독립4상태 확인. 별도 skip-link/차트 대체표 기능은 기존 별도 범위 |
| 공식 Chart |https://ui.shadcn.com/docs/components/radix/chart 확인. 현재 설치 Recharts2 타입 사용·v3 업그레이드0 |
| 부분 대비 |N400 #7C8999/white 3.56:1(의미 신호3이상), N600 완료값/neutral delta·본문≥4.5. 실제 fill RGB124/137/153·불투명, complete89/102/119 |
| 보존 |schema/API/query/mock/router/집계·기간·props 의미 변경0 |

증거: [manifest](../experiments/style/after/dashboard/manifest.json), [위치](../experiments/style/after/dashboard/layout-comparison.json), [명령](../experiments/style/after/dashboard/verification/commands.json). 전/후 각 상태 파일은 manifest에 있어요.
