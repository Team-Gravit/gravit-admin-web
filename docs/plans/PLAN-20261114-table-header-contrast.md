# PLAN-20261114-table-header-contrast: 테이블 머리글 식별성 보정

| 항목 | 내용 |
|---|---|
| 상태 | 커밋됨 (2026-11-15) — 사용자 커밋·푸시·main 반영 승인 |
| 요청 | 2026-11-14: 속성 이름이 있는 최상단 행이 페이지 배경과 같아 표의 시작으로 인지하기 어려워요. 의도 확인 및 보정 |
| 범위 | 관리자 공용 Table/DataTable의 머리글 배경·아래 경계·글자 위계 통일 |
| 범위 밖 | 열/행/필터/정렬/페이지네이션·클릭/판정/접근성 동작·API·문구·마크다운 문서 표 |

## 1. 목적

표의 시작과 속성 이름을 페이지 바탕·데이터 행에서 즉시 구분해요(V1·V4). T1의 중립 기조와 기존 표 배치를 유지하고 머리글만 더 명확하게 보여줘요(P5). 기존 토큰에서 파생한 전용 면을 추가하며 행동색은 사용하지 않아요(V2).

현재 구현의 원인은 확인됐어요. DS-STYLE-01 §2-1은 neutral-50을 페이지와 표 머리에 함께 쓰도록 기록했고, DataTable은 `bg-hover`를 사용해요. `--hover`와 `--page`가 모두 같은 값이며 외곽 `--border`도 같아요. 직접 Table을 쓰는 풀이 현황·QA 표는 TableHeader 배경이 투명해요. 평평한 중립 표현은 의도한 선택이지만, 표 머리의 식별성이 약해진 결과를 보완해요.

디자인 입력은 이미 승인된 T1 DS·현재 main의 실제 코드/최종 화면이에요. 같은 화면의 국소 보정이므로 새 Figma 인테이크 없이 진행해요. [색·경계 미리보기](assets/20261114-table-header-contrast/preview.html)는 제품을 고치지 않은 정적 견본이에요.

## 2. 읽은 문서

| 문서 | 절 | 이 계획에 주는 제약 |
|---|---|---|
| AGENTS.md·write-plan·템플릿 | 작업 흐름/시각/문서 지도 | 계획 승인 전 제품 코드 수정0·토큰 경유·기존 파일 보존 |
| docs/spec/00_INDEX.md | 관할/충돌 | 사용자 main 머지 승인 후 실제 main의 T1 UI가 기준. 옛 실험 전용 표현은 이력으로 해석 |
| docs/conventions/decisions.md | D13 K-16·D14·D15 | 기존 머리글 강조 근거·T1 토큰·계약/props/셸 보존 |
| docs/conventions/antipatterns.md | 시각/구조/흐름 | raw 값은 토큰 정의만·임의 클래스/새 의존성/승인 전 구현 금지 |
| ui-conventions.md·architecture.md·testing.md | 명명·공용 컴포넌트·검증 | 새 역할은 명명 표에 연결·shared 의존 방향 유지·MSW 회귀 |
| DS-01_design_system.md | §5-3·명명 | 헤더/행·기존 치수/열/상호작용 유지 |
| DS-02_screens.md | 목록3/6/8/10·챕터11·유닛12/레슨13 | 머리글만 보정하고 필터/데이터/카드 위치 유지 |
| DS-03_interactions.md | 상태/기존 상호작용 | Empty/Loading/Error·확인/판정/초점 조건 유지 |
| DS-STYLE-01/02 | 색2·글자3·공용 표 | 기존 중립 원색5개 보존·파생 면/텍스트 쌍 승인·본문14/22/헤더48·행52 유지 |
| Table·DataTable·ChapterStatsWidget·QA 두 Panel | 실제 표 렌더 | 머리글 중복 override 제거·통계/QA에 공용 규칙 전파 |
| MarkdownViewer·tailwind typography·Ravvit 목 | 문서 표 경계 | 원문 문서 표는 별도 렌더 체계여서 이 변경에 섞지 않음 |
| DataTable.test·shared-ui/style-ravvit e2e·현재 최종 users PNG | 회귀/시각 | 상태/행 클릭/판정 유지·페이지와 헤더가 이어지는 현상 확인 |

## 3. 바뀌는 화면·라우트

| 라우트 | 화면 | 변경 |
|---|---|---|
| /notices·/users·/reports·/inquiries·/chapters·/staging/labels·/qa/sprints | 목록7개 | 속성 머리글 전용 면·아래 구분선·진한600 글자 |
| /chapters/:id·/units/:id·/lessons/:id | 하위 목록·풀이 현황 | 같은 머리글 규칙, 통계 숫자/진행 막대 그대로 |
| /qa/sprints/:id/design-review·/checklist/1·/checklist/2 | QA3개 | 같은 공용 머리글. 고정 열/판정/행 관리/그룹 접기 유지 |

공용 규칙으로13개 라우트에 전파해요. 페이지별 새 테이블이나 새 헤더 슬롯은 만들지 않아요.

## 4. 코드 변경 (스키마 → API → 훅 → 컴포넌트 → 페이지 → 라우트 순)

| 파일 | 단위 | 변경 내용 |
|---|---|---|
| schemas/API/queries/hooks/pages/router/mocks | 계약·상태 | 변경 없음 |
| src/shared/styles/globals.css | 색 토큰 | `--table-header` 역할 추가. 기존 neutral-600 20%+white 80% 합성, 반올림 #DEE0E4 / HSL220 10% 88.235294%. 기존 원색/hover/page/border 값 불변 |
| tailwind.config.ts | 의미 클래스 | `bg-table-header`를 새 역할 토큰에 연결. typography/다른 색/모션 변경0 |
| src/shared/components/ui/table.tsx | TableHeader·TableHead | 전용 불투명 머리 면·기존1px 아래선에 input 경계색·글자 foreground/600. 기존48 높이·좌우16·정렬·props 그대로 |
| src/shared/components/data-table/DataTable.tsx | 공용 DataTable | local bg-hover·글자색 override를 제거해 공용 규칙 적용. column.headerClassName 전달/너비 유지. 기존 카드12에서 면이 튀어나오지 않도록 overflow-hidden, 내부 Table의 overflow-auto 유지 |
| src/features/chapters/components/ChapterStatsWidget.tsx | 통계 카드 면 | 기존 카드에 overflow-hidden만 더해 위 모서리12 안에서 새 머리 면을 자름. 데이터/막대/레이아웃 변경0 |

명명 토큰과 값은 승인 후 정식 코드에만 넣어요. 문서의 HEX는 계산/검토용이며 제품 컴포넌트에 직접 쓰지 않아요.

머리글 글자는 foreground가 필수예요. 새 면에서 foreground 대비는 **11.25:1**이고 기존 fg-secondary는4.42:1이어서 머리글에 그대로 남기지 않아요(V10). 조사한 column.headerClassName은 너비 지정이며 유지해요. 분류/상태/선택/본문 색에는 전파하지 않아요.

## 5. API 계약 영향 (`docs/spec/03_gravit_admin_api_spec.md`, 별도 서비스는 해당 D 항목)

없음 — 응답/요청·필드·쿼리·Zod·권한·상태 흐름을 고치지 않는 공용 표시 보정이에요.

## 6. 상태 4종

| 상태 | 조건 | 화면 동작 |
|---|---|---|
| 로딩 | 기존 isLoading | 기존 정적 LoadingSkeleton. 실제 머리글 추가/데이터 노출 없음 |
| 빈 상태 | data.length=0 | 기존 EmptyState·문구/행동 유지. 가짜 헤더/빈 행 추가 없음 |
| 오류 | 기존 isError | 기존 ErrorState/onRetry 유지 |
| 정상 | 기존 데이터 있음 | 머리글48·본문52 이상·열 순서/클릭 유지. 포인터 hover로 머리 면이 지워지거나 바뀌지 않음 |

## 7. 문구

| 위치 | 문구 | 근거 |
|---|---|---|
| 모든 표 | 기존 컬럼명/원문·aria-label 그대로 | W11·public props/원문 보존 |

새 문구/아이콘/정렬 표시/툴팁은 만들지 않아요.

## 8. 고칠 명세

| 파일 | 절 | 바꿀 내용 |
|---|---|---|
| docs/spec/DS-STYLE-01_foundations.md | §2-1·2-4 | 페이지와 표 머리를 같은 면으로 연결한 역할을 분리. 새 table-header는 기존 원색의 역할별 합성으로 명시하고 foreground 대비11.25 쌍 추가 |
| docs/spec/DS-STYLE-02_components.md | §1 Table·DataTable | 전용 머리 면·600/foreground·아래 경계·기존 치수/모서리 규칙 |
| docs/conventions/ui-conventions.md | 중립 표면 매핑 | table-header ↔ bg-table-header ↔ --table-header 명명 연결 |
| docs/conventions/decisions.md | 새 D16 | 사용자 테이블 식별성 피드백에 따른 국소 보정, 기존 T1 main 머지 승인 이력/기존 계약 보존 |

원래 T1 감사/캡처/커밋 목록은 당시 기록으로 보존해요.

## 9. 테스트 계획

| 종류 | 파일 | 확인할 동작 |
|---|---|---|
| 단위(Vitest) | 기존 DataTable.test.tsx·ChapterStatsWidget.test.tsx·QA 테스트 | 로딩/오류/빈/정상 우선순위·원문/row 클릭·풀이/게이지 데이터 유지. CSS 클래스와 구현을 그대로 복사하는 새 단위 테스트는 쓰지 않음 |
| e2e(Playwright+MSW) | 기존 shared-ui·style-operations·style-learning-staging·style-qa·QA 흐름 | 행 진입/필터/판정/모달·상태 회귀. 공용 변경이므로 전체 npm run test:e2e 실행 |
| UI computed | verify-ui 캡처/증거JSON |13라우트×1280/1440의 thead 면/글자/구분선·48높이·열 순서·overflow·텍스트 대비, hover 후에도 머리 면 유지 |
| 목 핸들러 | 기존 handlers/qaHandlers | 변경0. 현재 목·GET loading/empty/error 브라우저 전용 재현 재사용 |
| 게이트 | npm run check·test·test:e2e·check:full | 실제 exit code/개수 기록·변경 TSX에 최신 web-design-guidelines. 모션 추가/변경이 없어 review-animations 대상 없음 |

## 10. 확인할 화면 (verify-ui)

| 경로 | 목 데이터 조건 | 볼 것 | 전 캡처 | 후 캡처 |
|---|---|---|---|---|
| /users·/notices·/reports·/inquiries·/chapters·/staging/labels·/qa/sprints | 기존 정상 MSW | 헤더와 페이지/본문 분리·숫자/라벨/필터 위치 | 현재 최종 base PNG + 구현 전 대표 보충 | 계획 assets/after에 두 폭 |
| /chapters/1·/units/12·/lessons/901 | 기존 정상 | 통계/하위 표 일관성·원문/진행/모서리 | 현재 최종 base + 구현 전 대표 보충 | 같은 곳 |
| /qa/sprints/9/design-review·/qa/sprints/2/checklist/1·/checklist/2 | 기존 정상 | 그룹별 머리·고정 열·판정/관리 셀 | 현재 최종 base + 구현 전 대표 보충 | 같은 곳 |
| /users | GET 로딩/빈/오류·재시도 | 기존4상태 유지·빈/오류에 가짜 머리 추가 없음 | 기존 operations 상태 + 필요한 보충 | 같은 곳 |
| /users·/chapters/1·QA1차 | hover/키보드·normal/reduced | 머리 면 고정·클릭 행만 hover·focus 잘림 없음 | 구현 전 | 구현 후 |

agent-browser 명명 세션·목 dev 127.0.0.1 고포트/strictPort·종료 후 정리. 이전 PNG는 덮어쓰지 않아요. 정적 preview는 색/위계 견본이며 실제 UI 통과 증거로 쓰지 않아요.

## 11. 결정 필요

| # | 질문 | 선택지 | 추천 |
|---|---|---|---|
|1|헤더 전용 합성 회색 면·진한 글자·아래선을 공용 데이터표에 적용|2026-11-14 사용자 “ㄱㄱ 진행” 승인|승인된 안 구현(V1·V4·V10)|

## Deviation Log

| 날짜 | 계획 | 실제 | 이유 |
|---|---|---|---|
| 2026-11-14 | 계획 먼저 | 제품 변경0·초안/정적 견본만 작성 | 사용자 승인 관문 |

작업 시작 때 추적 파일 변경은 없고 이름에 ` 2`가 붙은 미추적 파일731개가 있었어요. 원인은 확정하지 않았으며 정리/삭제/스테이징하지 않아요. 이번 계획/증거와 구분해 보존해요.

## 검증 결과

| 명령·점검 | 결과 |
|---|---|
| 계획서·필수 절·견본 파일 존재 | 초안 작성 후 실제 파일 확인 |
| npm run check | exit0·타입/ESLint0오류/6경고·token-lint 통과 |
| npm run test |22파일78개 통과·실패0·exit0 |
| npm run test:e2e |133개 통과·실패0·exit0(1.1m) |
| npm run check:full |exit0·타입/ESLint0오류6경고/token/빌드 |
| verify-ui 점검표 |13라우트×2폭 정상26·전후38조건·머리/열/첫행 위치 동일·대비11.25·전체30쌍 통과. 아래 증거/점검표 |

## 자기 점검

- [x] 명세에 없는 엔드포인트·필드·쿼리 없음
- [x] 상태 4종 각각 화면 동작이 적혀 있음
- [x] 문구가 기존 문구 체계와 맞음 — 변경0
- [x] features 간 직접 import 없이 구현 가능
- [x] 단위·e2e·목 변경 여부/시각 검증 계획 있음
- [x] 확인할 화면 목록·경로·목 조건·전후가 있음

### 실제 검증·verify-ui 점검표

| 점검 | 결과·증거 |
|---|---|
| 계획 구현 |제품5파일·명세4파일 변경. TableHeader 공용 규칙·DataTable override 제거·카드 면 자르기, API/행동/문구/의존성 변화0 |
| 정상13×2 |26조건 모두 RGB222/224/228 머리 면·RGB32/40/51/600 글자·input1px 구분선·48높이. 기존26조건은 새 규칙0/26 → 수정 후26/26 |
| 레이아웃 |26정상·6interaction의 머리/첫행 rect·모든 열 x/y/폭/이름 동일,38조건 셸 동일·overflow0 |
| 4상태 |users GET loading/empty/error 두 폭6조건 전후. 기존 비정상 상태에 가짜 머리 추가0·기존 재시도/빈 문구 유지 |
| hover/키보드/reduced |users/풀이현황/QA1차6조건 머리 면 고정·focusVisible 유지·잘림0. QA등록/신고문제이동4조건 추가로 새 DataTable 잘림 면 내부 focus 확인 |
| 대비 |실제 머리글11.2466:1·기존29+새1=30/30 통과 |
| 시각 검토 |전18/후38 PNG와 보충focus4·contact8/비교1.13개 화면의 두 폭 contact·유저/QA/풀이현황/등록focus 직접 열람 |
| 최신웹 |2026-11-14 GitHub command.md 수신·변경3TSX 점검. 네이티브표/접근이름/번호 정렬 유지·기존 별도 접근성 과제는 문서에 기록 |
| 모션 |변경0, review-animations 미호출·정적normal/reduced 확인 |
| 경고 |ESLint0오류·기존4+미추적테스트복제2=6경고. 기존 Browserslist/큰chunk 경고. 기존731미추적파일 존재/크기/mtime 그대로 |
| 테스트 |check0·unit78/22파일0·전체e2e133/0·check:full0. 실제 원문은 아래 verification의txt로 보존 |
| 종료·git |브라우저close exit0·서버SIGINT exit130·원격/HEAD 변경0·스테이징/커밋/푸시0 |

[전후 비교](assets/20261114-table-header-contrast/compare-users-1440.png) · [전체 결과](assets/20261114-table-header-contrast/README.md) · [전](assets/20261114-table-header-contrast/before/manifest.json) · [후](assets/20261114-table-header-contrast/after/manifest.json) · [위치](assets/20261114-table-header-contrast/layout-comparison.json) · [명령](assets/20261114-table-header-contrast/verification/commands.json)

### Deviation Log 보충

| 날짜 | 계획 | 실제 | 이유 |
|---|---|---|---|
|2026-11-14|계획 승인 관문|사용자 “ㄱㄱ 진행” 후 승인 상태로 바꾸고 전 캡처 뒤 구현|요청한 순서 준수 |
|2026-11-14|기존 동작/크기 유지|QA등록·신고 문제 이동의focus4조건을 추가 확인|새overflow-hidden의키보드ring잘림 방지 검증 |
|2026-11-14|링크 초점 검증|신고의 기존 문제 이동 요소가button인 것을 소스/스냅샷으로 확인해 검증selector만 수정|기존 시맨틱/동작을 바꾸지 않고 실제 컨트롤 검증 |

구현 시작 전 원본 미추적 파일 전체 해시 읽기는 동기화 파일 대기로 중단하고, 보존 대상731파일의 존재/크기/mtime를 기록해 종료 때 대조했어요. 원본을 고치거나 옮기지 않았어요. 개발 서버 첫 연결 거부는 서버가 아직 시작되지 않은 시점의1회이며 doctor8pass0fail 후 정상 구동했어요.

### 커밋·원격 main 반영 승인 (2026-11-15)

사용자 “커밋푸시 진행하고 머지까지 해”로 이번 수정의 커밋·푸시·main 반영을 승인받았어요. 현재 작업 브랜치가 main이고 origin/main과 같은 기준이므로 별도 머지 커밋 없이 main에 직접 기록해요. 제품 코드5개 해시가 unit78/e2e133 검증과 같음을 확인하고 커밋 직전 check:full을 다시 실행해 exit0을 확인했어요.

- 메시지: `fix(ui): 테이블 머리글 구분과 대비 개선`
- 본문: `Plan: docs/plans/PLAN-20261114-table-header-contrast.md`
- 대상: 제품5·명세4·계획1·이 계획 전후/검증 자료82 = 정확히92파일. 각 경로는 verification/commands.json의 commit.stagingFiles에 기록했어요.
- 기존 미추적 복제 파일731개는 스테이징하지 않아요. .env·로컬 핸드오프·하네스 변경0, 강제 푸시/실제 배포0.

현재 HEAD/원격 반영 상태는 git log/status/원격 main을 기준으로 확인해요. 앞선 ‘미커밋’ 기록은 검증 시점의 상태예요.
