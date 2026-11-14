# PLAN-20261114-style-shared-components: T1 단계 3 — 토큰·공용 UI 적용

| 항목 | 내용 |
|---|---|
| 상태 | 커밋됨 (2026-11-14) — 사용자 커밋·푸시 승인 |
| 요청 | 사용자 T1 단계 3. 2026-11-14 “응 ㄱㄱ”로 사람 확인 1의 H1·H2·H3 승인 |
| 범위 밖 | 개별 화면의 재배치·문구 일괄 수정, 로그인 자산 교체·Ravvit 연출 구현(단계 5), QA 샘플 화면의 고유 컴포넌트 수정(단계 4), API·스키마·데이터 흐름·권한·라우트·탭 변경, 스타일 밖 접근성 동작 보완, 의존성 설치, 커밋·푸시·머지 |

## 1. 목적

승인한 기초 토큰을 기존 변수·클래스 이름에 연결하고 공용 UI를 같은 규칙으로 맞춰요. 읽기 정보는 중립, 행동·선택은 파랑, 실제 상태는 작은 의미 색으로 보여줘요(P4·P8·V1~V4·V8·V10). 공개 props·ref·이벤트·활성 조건을 유지하며 화면마다 스타일이 달라지는 원인을 줄여요(P2·P5).

작업 브랜치는 experiment/style-refresh예요. main의 T0 푸시 확인과 before 기록은 단계 0·1에 있어요. 새 Figma 입력 없이 승인된 foundations·정적 견본과 before 실측을 사용해요. 새 의존성은 0개이며 shadcn CLI로 소스를 추가하거나 기존 키트를 가져오지 않아요.

이번 단계는 공용 UI 적용이에요. 전역 토큰 변경은 25개 화면에 전파되지만 화면별 잔여 클래스·QA 게이지·차트 진입·로그인·Ravvit은 해당 후속 단계까지 중간 상태일 수 있어요. 이 단계 결과를 전체 개편 완료로 보고하지 않아요.

## 2. 읽은 문서

| 문서 | 절 | 이 계획에 주는 제약 |
|---|---|---|
| 사용자 T1 요청·AGENTS.md | 전체 | 실험 브랜치, 단계별 계획, 사람 확인 1·2 정지, 골격·기능·원문 보존 |
| docs/spec/00_INDEX.md | 전체 | 승인된 시각 결정의 실험 범위를 인덱스에 명시하고 계약 권위 보존 |
| docs/conventions/decisions.md | D1·D2·D5~D8·D10~D14 | 단일 정답·마크다운·인증·QA 계약 유지, D5/D7/D8의 승인된 시각 부분만 대체 |
| docs/conventions/antipatterns.md | 전체 | raw 값·미승인 기능·새 의존성·외부 쓰기 금지 |
| docs/conventions/architecture.md | 전체 | shared→features 금지, 기존 공용 컴포넌트와 @/ import 사용 |
| docs/conventions/ui-conventions.md | 전체·명명 매핑 | 기존 이름 유지, 값의 권위는 실험 DS로 이관, 1280px+·라이트 전용 |
| docs/conventions/good-patterns.md | 폼·이탈 보호·오류·STAGING_DETAIL | 폼 등록·검증·strict-match·이탈·실패 처리 유지 |
| docs/conventions/testing.md | 전체 | 대상 옆 Vitest, 역할·접근 이름으로 행동 검증, MSW e2e |
| docs/spec/DS-00_overview.md | 글로벌 레이아웃 | 셸 240/56·본문 최대 1200·padding 32/24 유지 |
| docs/spec/DS-01_design_system.md | 토큰·컴포넌트·상태·아이콘 | 기존 이름과 변형의 이관 대상 |
| docs/spec/DS-02_screens.md | 전체 화면·표시/편집 모드 | 영역 순서·위치·필드·모드 유지 |
| docs/spec/DS-03_interactions.md | 모달·토스트·검증·상태·글로벌 | dismiss·위험 액션·이탈·3초 토스트 정책 유지 |
| docs/spec/01_gravit_admin_wireframe_spec.md | §4~5·§6-7-8 | 셸·4상태·표·모달·strict-match 조건 유지 |
| docs/spec/04_gravit_admin_frontend_spec.md | §9~10 | 폼·이탈·메시지 우선순위·배지·마크다운 동작 유지 |
| docs/spec/DS-STYLE-01_foundations.md | 전체·§9 H1~H3 | 승인한 값·이름·문구·모션·새 의존성 0개 |
| docs/experiments/style/REPORT.md·before/capture-manifest.json | 감사·실측 | 25개 화면·110장 기준, 스타일 밖 접근성 과제 분리 |
| .agents/skills/style-designer/SKILL.md | 전체 | 모든 결정에 P·W·V·M 근거, 감사 7장 순서 |
| .agents/skills/write-plan/SKILL.md·assets/plan-template.md | 전체 | 이 계획 승인 전 src·tests·명세 수정 금지 |
| .agents/skills/shadcn/SKILL.md·rules/styling.md·base-vs-radix.md | 기존 Radix UI·의미 토큰 | 설치된 컴포넌트 확장, 공개 API·기존 FormField 유지. 새 Field/키트로 교체하지 않음 |
| .agents/skills/vercel-react-best-practices/SKILL.md | Vite SPA에 해당하는 지침 | 불필요한 상태·효과·의존성 없이 스타일 변경, 서버/Next 전용 규칙 제외 |
| .agents/skills/verification-before-completion/SKILL.md | 전체 | 명령 결과·실제 캡처를 확인한 뒤 상태 보고 |
| 기존 코드·테스트 | shared/components·constants/badgeVariants·styles·tailwind·token-lint·tests/e2e | 현재 props·DOM·상태·기본 문구·예외 확인, 기존 핸들러와 회귀 흐름 재사용 |

## 3. 바뀌는 화면·라우트

| 라우트 | 화면 | 변경 |
|---|---|---|
| 기존 25개 화면 전체 | 공용 토큰을 사용하는 화면 | 색·타이포·반경·그림자가 전파됨. 영역 순서·라우트 수 고정(V1·V4·V5) |
| /notices·/users·/reports·/inquiries·/chapters·/staging/labels·/qa/sprints | 목록·검색·필터·페이지네이션 | 조용한 표·분류 배지·입력·선택·4상태(P8·V2·V8) |
| 기존 상세·편집 화면 | 공용 입력·마크다운·모달 | 내부 여백·가독성·경계·기본 문구·피드백(P5·V10·M2) |
| /qa/sprints/2/checklist/1 | 단계 4용 샘플의 중간 상태 | 공용 모달·배지·메뉴만 자동 적용. 체크 셀·게이지·고유 정보 강조는 단계 4 |
| /login·/ravvit | 후속 화면 | 토큰 전파만 확인. 승인 H2·H3의 화면 구현은 단계 5 |

## 4. 코드 변경 (스키마 → API → 훅 → 컴포넌트 → 페이지 → 라우트 순)

스키마·API·도메인 훅·페이지·라우터는 수정하지 않아요. 공용 상태 로직과 remount 조건도 유지해요. 새 public props·변형 이름을 만들지 않아요(P2·P5).

| 파일 | 단위 | 변경 내용·근거 |
|---|---|---|
| src/shared/styles/globals.css | 기존 의미 CSS 변수·공용 스타일 | foundations §2·§8의 HSL 값, --radius 12px, 새 모션 변수. 배경·전경·입력 경계·의미 색·차트·로그인 brand 변수 연결. body 기본 14/22, 숫자 비교 tabular-nums. 모달 가림은 N950/28%. 코드 원문 보존(V1~V4·V9·V10) |
| tailwind.config.ts | 테마 확장 | 기존 색·타입 이름 유지, primary-badge 8%, control/card/overlay 8/12/16. md/lg 그림자는 같은 floating 값. typography 플러그인의 prose 색·타입도 의미 토큰으로 연결해 숨은 기본 회색을 제거(V4·V5·V6) |
| tailwind.config.ts·globals.css | 새 모션·필요 geometry | foundations §6의 instant/feedback/menu-enter/menu-exit/overlay-enter/overlay-exit/reduced/loading-cycle/ease/scale-start만 신설. 기존 80px textarea 최소높이와 128px 메뉴 최소폭은 이름 있는 textarea/menu 토큰으로 보존(M4·P2) |
| src/shared/components/ui/button.tsx | Button·buttonVariants | 기본40·compact32·large48·icon40, body/600, control8, disabled opacity0.48. 변형 이름·asChild·이벤트 유지. 색은 즉시, 눌림 투명도80ms, 포커스2px/offset2. 위험 버튼은 danger 단색(P4·V3·V10·M2) |
| src/shared/components/ui/input.tsx·textarea.tsx·select.tsx | 입력·선택 | body 14/22·control8·N400 경계·N600 placeholder. 40px 기본 입력, textarea 최소80px 보존. readonly/disabled/aria-invalid의 시각만 정리. Select의 선택·스크롤·값·포커스 로직 유지(P5·V8·V10) |
| src/shared/components/ui/checkbox.tsx·radio-group.tsx | 선택 컨트롤 | 외곽24px·glyph16px(라디오 내부 점은 기존 의미), 체크박스 control8·라디오 원형. 미선택 경계N400, 선택파랑, focus2px. 16px 상자에8px 반경을 적용해 원형이 되는 문제를 피함. 인접 영역 순서·라벨·RHF 등록 유지(V5·V8·V10) |
| src/shared/components/ui/table.tsx·data-table/DataTable.tsx·PaginationControl.tsx | 표·페이지네이션 | 평평한 card12, 머리48·단일 행 최소52, 여러 줄은 자동 증가. 표 안 여백만 조정. 클릭 가능한 행만 파랑 옅은 hover, 비조작 행은 중립. 열·정렬·페이지 계산·onRowClick 조건 유지(P8·V1·V2·V9) |
| src/shared/components/ui/badge.tsx·status-badge/StatusBadge.tsx·ProblemTypeBadge.tsx | 배지 | control8·caption/500·작은 면. variant 이름·children·원문 유지. 위험/성공/대기는 기존 의미. Primary 변형 자체를 중립 의미로 바꾸지 않음(V2·V3·V8) |
| src/shared/constants/badgeVariants.ts | 시각 매핑 | 역할 ADMIN/USER·신고/문의/문제 유형을 기존 중립 variant로 연결. 상태 ACTIVE/SUSPENDED/DELETED·해결 여부·공지/라벨/문의 상태 매핑은 유지. enum/한글 라벨/분기 조건 미변경(V2·V3·V8) |
| src/shared/components/ui/dialog.tsx | Dialog | overlay16·동일 floating shadow·h3 제목·body 설명·gap 토큰. 중앙 위치와400/480폭·max-height·스크롤·Portal·닫기·포커스 유지. enter160/exit120ms opacity/scale.98. reduced opacity100ms만(M1~M5) |
| src/shared/components/ui/dropdown-menu.tsx·select.tsx | 메뉴·하위 메뉴 | overlay16·동일 floating shadow·행32 이상·중립 hover/명시 선택파랑. Radix origin에서 enter120/exit90ms. reduced opacity100ms만. 현재 popper offset·포커스·키보드·선택 이벤트 유지(M2~M5·V8) |
| src/shared/components/ui/popover.tsx·tooltip.tsx | 즉시 안내 | 새 진입 애니메이션 없음. popover16·tooltip8·공통 그림자·본문 대비. sideOffset·hover/focus/click/Escape·Tooltip의 rAF 준비 로직 유지(M1·M2·V10) |
| src/shared/components/ui/sonner.tsx·globals.css | Toast | 우상단72px·3000ms·전달 props·큐·동작 유지. 토큰 색·overlay16·floating shadow. 설치된 Sonner의 data 속성에 한정해 enter160/exit120ms와 reduced opacity100ms 적용. 높이·그림자 보간 제거, 위치 계산값은 유지(M1~M5·V6) |
| src/shared/components/ui/skeleton.tsx·states/LoadingSkeleton.tsx·EmptyState.tsx·ErrorState.tsx | 4상태 | skeleton pulse 제거, 실제 대기 조건·rows 유지. 작은 의미 아이콘20·간결한 body 문구·내부 gap. 오류는 위험 신호, 빈 상태는 중립. 로딩/오류/빈/데이터 우선순위 유지(P9·V7·V8·M1) |
| src/shared/components/modals/ConfirmModal.tsx·StrictMatchModal.tsx·UnsavedChangesModal.tsx | 기본 문구·내부 간격 | §7의 문구만 교체. 일치 판정·value reset·loading·이탈 콜백·확인/취소 동작은 유지(W1·W4·W8·P5) |
| src/shared/components/form/FormField.tsx·FieldError.tsx | 필드·오류 | 내부 간격을 토큰 단계로 정리, required/label/error/children 의미 유지. 위험 텍스트 대비. 기존 FormField 대신 새 키트를 도입하지 않음(V1·V10·P2) |
| src/shared/components/markdown/MarkdownViewer.tsx·MarkdownEditor.tsx | 본문·작성/미리보기 | prose를 새 토큰으로 통일, 탭 경계·포커스·즉시 피드백·빈 미리보기 문구. content·raw HTML 정책·플러그인·링크·가로 스크롤·숨겨진 입력 보존(W1·V4·V10·M2) |
| src/shared/components/layout/MainLayout.tsx·Sidebar.tsx·Header.tsx | 셸 내부 시각 | MainLayout의 animate-in/fade-in/duration-200만 제거, wrapper/key=pathname 유지. Sidebar 색 보간 제거. Header 로그아웃 문구만 변경. 셸 위치·240/56·max1200·padding32/24·메뉴 순서 고정(M1·M6·P5) |
| src/shared/components/ui/chart.tsx | 검사 대상 차트 래퍼 | '#ccc'/'#fff'를 조건으로 한 선택자를 해당 Recharts 요소 클래스 선택자로 바꿈. 의미 토큰 색·config·ResponsiveContainer·Tooltip 동작 유지. 데이터 그래프 구조·호출 미변경(V2·P2) |
| scripts/checks/token-lint.mjs·token-lint.allow.txt | 토큰 검사 | components/ui 전체 제외를 제거. allow는 globals.css·tailwind.config.ts의 정규화한 상대경로 정확 일치만. raw hex·px/rem/em literal arbitrary 탐지, Radix var·data/구조 선택자는 허용. 전체 CSS 파서로 확대하지 않음(V10·P2) |
| scripts/checks/token-lint.test.mjs | 검사 회귀 | Node 내장 test로 UI 위반·정상 의미 클래스·동적var·allow 정확 일치 확인. 패키지·하네스 파일 변경 없이 실행 |
| §9의 테스트·§8의 문서 | 기대 문구·증거 | 구현과 함께 테스트/명세/캡처/REPORT 갱신 |

기존 CSS를 통한 크기·색만 바꾸며 public props의 이름·의미는 유지해요. 대외 코드값·ID·상태 원문을 바꾸지 않아요. StrictMatch 입력 접근 이름, 행 키보드 이동, skip link, 로그인 heading 변경은 감사의 별도 동작 과제로 남겨요.

### 모션 적용 경계

| 대상 | 보통 | reduced | 원칙 |
|---|---|---|---|
| 본문·표 행·셀·정적 배지 | 즉시 | 동일 | M1·M6 |
| 버튼 눌림 | opacity80ms, 색·포커스 즉시 | 이동/확대 없이 동일 | M2·M5 |
| Dropdown·Select | Radix origin, .98→1/opacity120ms, 닫힘90ms | transform 없이 opacity100ms | M3~M5 |
| Dialog·Toast | 중앙/기존 고정 위치, .98→1/opacity160ms, 닫힘120ms | 위치용 transform과 연출을 구분, 확대·이동 없이 opacity100ms | M3~M5 |
| Tooltip·호버 범례 | 기존 즉시 표시 | 동일 | M1·M2 |
| skeleton | 정적 | 정적 | P9·M1 |
| feature 차트·QA 게이지·Ravvit | 이번 단계 고유 코드 미변경 | 후속 단계에서 심사 | 별도 단계 경계 |

## 5. API 계약 영향 (docs/spec/03_gravit_admin_api_spec.md, 별도 서비스는 해당 D 항목)

없음 — 요청·응답·필드·오류 envelope·Zod·axios·query key·권한·세션·MSW 계약을 변경하지 않아요. 데이터 흐름에 손대지 않으며 실제 promote·OAuth·공유 서버 쓰기는 실행하지 않아요.

## 6. 상태 4종

| 상태 | 조건 | 화면 동작 |
|---|---|---|
| 로딩 | 기존 isLoading·loading true | 기존 순서와 개수의 정적 skeleton, 기존 버튼 disabled 유지. 로딩 시간을 새로 만들지 않음(P9·V8·M1) |
| 빈 상태 | 로딩·오류가 아니며 data.length=0 | 기존 message/action/icon props를 같은 영역에 표시. 기본 문구만 §7대로 변경. 필터값·페이지 유지(W1·P5) |
| 오류 | 기존 isError·errorMessage | 알려진 상황과 재시도 행동, onRetry가 있을 때만 버튼. 서버·도메인 고유 문구는 전달값 그대로. 요청·재시도 정책 유지(W12·V8) |
| 정상 | 기존 데이터 수신 | 기존 행·필드·상태·코드·액션 유지. 분류는 중립, 상태는 의미 색, 선택/행동은 파랑(P4·V2·V3·V8) |

## 7. 문구

| 위치 | 지금 → 변경 | 근거 |
|---|---|---|
| DataTable 기본 emptyMessage | 데이터가 없습니다. → 표시할 데이터가 없어요. | W1·W5 |
| ErrorState 기본 message | 데이터를 불러올 수 없습니다. 잠시 후 다시 시도해주세요. → 데이터를 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요. | W1·W12, 원인 추측 없음 |
| ErrorState 재시도 | 다시 시도 → 다시 시도하기 | W7 |
| ConfirmModal 기본 cancelLabel | 취소 → 닫기 | W8. 전달받은 cancelLabel은 보존 |
| ConfirmModal 기본 confirmLabel | 확인 유지 | 호출자가 행동 의미를 전달하는 API 유지. 도메인별 구체 행동은 단계 5(W7·P5) |
| StrictMatchModal 기본 title | 라벨을 반영하시겠습니까? → 라벨을 반영할까요? | W1·W4 |
| StrictMatchModal 안내 | 확인을 위해 라벨명 … 을(를) 정확히 입력하세요. → 반영할 라벨명 … 을(를) 정확히 입력해 주세요. | W1·W5. 원문 label·완전 일치·placeholder 금지 유지 |
| StrictMatchModal 닫기 | 취소 → 닫기 | W8 |
| UnsavedChangesModal 기본 message | 변경 사항이 있습니다. 페이지를 나가시겠습니까? → 저장하지 않은 변경 사항이 있어요. 페이지를 나갈까요? | W1·W4, 경고 의미 보존 |
| UnsavedChangesModal 돌아가기 | 취소 → 닫기 | W8, onCancel 그대로 |
| Header 로그아웃 확인 title | 로그아웃하시겠습니까? → 로그아웃할까요? | W1·W4 |
| MarkdownEditor 빈 미리보기 | 표시할 내용이 없습니다. → 표시할 내용이 없어요. | W1 |

이 목록에 없는 feature copy·Zod 검증 문구·서버 메시지·목 응답 본문은 이번 단계에서 고치지 않아요. 운영자가 작성한 학습/공지/문의 본문도 원문을 보존해요(W11·어드민 예외).

## 8. 고칠 명세

| 파일 | 절 | 바꿀 내용 |
|---|---|---|
| docs/spec/DS-STYLE-01_foundations.md | 머리말·§8~9 | H1~H3 승인일2026-11-14 기록, “제안/대기”를 승인 상태로 정리. 값 자체는 승인안 유지. 실제 checkbox/radio24·button large48·보존 geometry 이름·단계별 적용 상태 명시 |
| docs/spec/DS-STYLE-02_components.md | 신규 | 공용 컴포넌트 변형·4상태·키보드/focus 유지 조건·문구·모션/reduced·대비·사용 토큰·원칙 번호 |
| docs/spec/00_INDEX.md | 관할·우선순위 | 실험 브랜치의 시각은 DS-STYLE-01/02·D15, 골격/동작/계약은 기존 권위 유지 |
| docs/conventions/decisions.md | 새 D15 | T1 실험 브랜치·H1~H3 승인·D5/D7/D8/QA 문구의 시각/연출/톤 대체 범위, API·동작 불변·단계4 확인2 정지·푸시 미승인 |
| docs/conventions/ui-conventions.md | 근거·명명·값·모션 | 새 실험 DS 관할, 기존 이름과 새 역할 매핑. primary-badge8%·destructive 단색/옅은 danger-bg 구분·분류 중립·반경·검사 범위 |
| docs/spec/DS-00_overview.md·DS-01_design_system.md·DS-02_screens.md·DS-03_interactions.md | 머리말 안내만 | 실험에서 시각 값은 새 DS로 대체한다는 링크. 기존 골격/상호작용 자료 보존, 문서 삭제하지 않음 |
| docs/spec/04_gravit_admin_frontend_spec.md | §9-8 안내 | 역할/유형 시각 매핑이 실험에서 중립으로 바뀜을 명시, enum·상태 의미 유지 |
| docs/experiments/style/REPORT.md | 단계3 결과·문구·모션·미해결 | 감사 대응·적용/보류 구분·전후·검증·스타일 밖 접근성 잔여·DS 이관 제안 |
| 이 계획서 | 승인·Deviation Log·검증 | 실제 실행 결과와 증빙 링크 |

명세 내용의 시각 충돌은 D15에서 승인 범위만 해소해요. 기존 DS는 삭제하지 않고 비교 자료로 남겨요. 기존 문서의 API·권한·상태 전이 규칙은 유지해요.

## 9. 테스트 계획

| 종류 | 파일 | 확인할 동작 |
|---|---|---|
| 단위(Vitest) | src/shared/components/modals/ConfirmModal.test.tsx | 기본 “닫기”·전달 label·loading에 따른 기존 비활성·닫기/확인 콜백 |
| 단위(Vitest) | src/shared/components/modals/StrictMatchModal.test.tsx | 라벨 완전 일치/대소문자·공백 불일치·닫고 재열기 reset·loading·새 기본 안내 |
| 단위(Vitest) | src/shared/components/modals/UnsavedChangesModal.test.tsx | 새 기본 안내와 기존 나가기/닫기 콜백·메시지 override |
| 단위(Vitest) | src/shared/components/data-table/DataTable.test.tsx·states/ErrorState.test.tsx | 로딩/오류/빈/정상 우선순위·새 기본 문구·전달 문구 보존·조건부 재시도와 onRetry |
| 단위(Vitest) | src/shared/components/markdown/MarkdownEditor.test.tsx | 빈 미리보기 새 문구·작성/미리보기 전환 후 기존 입력값 보존 |
| 단위 범위 | 기존 src/**/*.test.ts(x) | 상태 변경 컴포넌트 회귀 포함 전체 실행. 단순 클래스 문자열·픽셀값 복제 테스트는 쓰지 않음 |
| e2e(Playwright+MSW) | tests/e2e/shared-ui.spec.ts 신규·기존 tests/e2e/*.spec.ts | 로그아웃 모달 닫기/ESC·Select 키보드·strict-match gate·편집 이탈 닫기·기존 위험/권한 흐름·새 문구. 변경한 문구에 의존하는 기존 기대값만 갱신 |
| 목 핸들러 | 기존 src/mocks/ 재사용 | 계약·payload·응답 문구 변경 없음. 로딩/빈/오류 재현은 기존 시나리오 또는 브라우저 테스트에서 기존 URL의 응답만 가로채기 |
| token-lint 회귀 | scripts/checks/token-lint.test.mjs | shared/components/ui 안 raw hex/px/rem/em 차단, 토큰·data 선택자·Radix var 허용, 부분일치 allow 우회 차단. Node 내장 test 사용 |
| UI·접근성 | verify-ui·web-design-guidelines | 최신 가이드라인으로 변경 파일 점검, 대비4.5:1·컨트롤 경계3:1·포커스·넘침·상태 표시 확인 |
| 모션 | review-animations·agent-browser | 실제 computed duration/property/origin·빠른 열고닫기·reduced·정적 skeleton·본문 즉시 전환. Sonner 실제 표시/닫힘 확인 |

회귀 테스트는 해당 기대값의 실패를 먼저 확인한 뒤 변경안에서 통과하는지 기록해요. 새 테스트가 묻는 것은 표시/행동 계약이며 구현 클래스 복제가 아니에요. npm run check → npm run test → npm run test:e2e → UI 점검 순서로 진행해요. 커밋할 때는 check:full도 필수예요.

## 10. 확인할 화면 (verify-ui)

전 캡처는 기존 before PNG110장·capture-manifest.json을 그대로 보존해요. 후 캡처는 docs/experiments/style/after/shared/에 1280×900·1440×900 두 폭으로 저장하고 경로·상태·실측을 manifest.json에 남겨요. 긴 화면은 필요하면 full 캡처도 추가해요.

| 경로 | 목 데이터 조건 | 볼 것 | 전 캡처 | 후 캡처 |
|---|---|---|---|---|
| /notices | 기존 목록 MSW·세션 true | 표 머리·행·배지·페이지네이션 | before/notices-normal-{폭}.png | after/shared/notices-normal-{폭}.png |
| /notices/new | 기존 목 세션·빈 폼 | 입력·checkbox·에디터·빈 미리보기·검증 오류 | before/notice-new-normal-{폭}.png | after/shared/notice-new-form-{폭}.png |
| /notices/1 | 기존 목·편집 후 내부 이동 시도 | 미저장 모달·닫기·값 보존·본문 typography | before/notice-detail-edit-{폭}.png | after/shared/notice-unsaved-{폭}.png |
| /users/1001 | 기존 목·역할 선택·확인 직전 | Select·분류/상태 배지·위험 모달·닫기 | before/user-detail-normal-{폭}.png | after/shared/user-select-{폭}.png·user-confirm-{폭}.png |
| /problems/1001 | 기존 목·편집 모드 | radio·입력·오류·본문 | before/problem-objective-edit-{폭}.png | after/shared/problem-objective-edit-{폭}.png |
| /staging/labels/2026-04-25-a3f9 | 기존 목·반영 모달, 확인 요청 금지 | 480폭·strict match 비활성/활성·닫기·토큰 | before/staging-promote-dialog-{폭}.png | after/shared/staging-promote-dialog-{폭}.png |
| /qa/sprints | 기존 목 정상·?qaMock=empty·?qaMock=503 | 표/빈/오류·재시도 | before/qa-sprints-{normal,empty,error}-{폭}.png | after/shared/qa-sprints-{normal,empty,error}-{폭}.png |
| /qa/sprints/9/fix-reports?qaMock=fixes-loading | 기존600ms 지연 | 실제 대기 skeleton 정적 | before/qa-fixes-loading-{폭}.png | after/shared/qa-fixes-loading-{폭}.png |
| /qa/sprints/2/checklist/1 | 기존 목·Fail 창·범례·체크 메뉴 | 공용 Dialog/Dropdown/Popover/Tooltip·단계4 고유 영역은 미적용 표시 | before/qa-{first-normal,fail-dialog,legend}-{폭}.png | after/shared/qa-{first-normal,fail-dialog,legend,menu}-{폭}.png |
| / | 기존 대시보드 목 | 차트 래퍼·중립 데이터·hover 표시, 고유 진입 연출은 후속 | before/dashboard-normal-{폭}.png | after/shared/dashboard-normal-{폭}.png |
| /notices/1 | 목 편집·정상/실패 저장, 테스트 안에서만 | 실제 Sonner 토스트·대비·모션·dismiss | before/notice-detail-edit-{폭}.png(상태 추가는 기존 기준과 구분) | after/shared/toast-{success,error}-{폭}.png |
| /users/1001 | reduced-motion: reduce·확인 모달 | 확대/이동 없음·opacity100ms·포커스 유지 | 같은 before 기준 | after/shared/reduced-confirm-1440.png |
| 25개 화면 전체 | 단계1의 동일 목·세션·탭 | 공용 토큰으로 인한 셸/영역 순서·대략 위치 회귀 | before의 base25×2 | after/shared/base/ 동일 key×2 |

예전 baseline에 같은 열린 모달 상태가 없으면 정상 화면을 모달 “전후 동일 상태” 증거로 주장하지 않아요. 필요하면 현재 HEAD를 별도 임시 worktree로 열어 그 상태를 보충하고 baseline-extra/로 구분해요. 기존 before 파일은 덮어쓰지 않아요.

실측 표에는 Sidebar240·Header56·본문max1200·padding32/24·staging 내부목록288 및 각 페이지 주요 영역의 순서를 기록해요. 타이포/내부 여백으로 생긴 높이 차이와 영역 이동을 구분하고, 의도한 골격 변경은 허용하지 않아요(P5·P8). 목 로그인으로만 열고 Ravvit base 확인은 이전과 같은 브라우저 health 응답만 사용하며 채팅을 보내지 않아요.

실행 전 점유 포트를 확인해 47000번대·--host 127.0.0.1·--strictPort로 목 dev 서버를 띄워요. agent-browser 이름 있는 세션을 쓰고 확인 후 세션·서버를 종료해요. 바뀐 파일은 web-design-guidelines 최신 원문, 모션은 review-animations로 점검하고 결과 표를 붙여요.

## 11. 결정 필요

| # | 질문 | 선택지 | 추천 |
|---|---|---|---|
| 1 | 이 단계3 계획대로 토큰·공용 UI 구현/테스트를 진행할까요? | 승인 / 계획 수정 | 승인 후 implement → write-test·verify-ui |

H1·H2·H3는 이미 승인받았으며 재승인 대상이 아니에요. 추가 라이브러리·공개 props 변경·계약 변경 제안은 없어요. 단계3 결과 보고 후 단계4 계획을 별도로 작성하고, 샘플 적용 결과의 사람 확인2에서는 반드시 멈춰요. 커밋/푸시는 아직 실행하지 않아요.

## Deviation Log

구현 전이므로 없음. 계획과 다른 구현이 필요하면 원인·범위를 기록하고, 새로운 결정이면 변경 전에 질문해요.

| 날짜 | 계획 | 실제 | 이유 |
|---|---|---|---|
| 2026-11-14 | 공용 overlay 토큰 모션 | src/shared/hooks/useOverlayMotion.ts로 시각 연출만 분리 | Radix Presence는 animationend를 기다리므로 CSS timer로 기존 퇴장 수명을 유지하고 실제 연출은 WAAPI로 현재 프레임에서 이어서 반전. props·포커스·닫기·상태 로직 불변 |
| 2026-11-14 | 기존 before 자료 재사용 | baseline-extra/에 역할 선택·확인·미저장 상태6장 보충 | 기존 before에 동일 열린 상태가 없어 코드 수정 전에 두 폭의 실제 상태를 기록 |
| 2026-11-14 | token-lint 회귀 | Node 내장 test에서 임시 목 저장소의 CLI 실행 | 기존 CLI는 process.exit로 끝나므로 import 방식 대신 실제 exit code/진단을 검사. 추가 의존성 없음 |

### 구현 중 확인한 보존 경계

- 설치된 Radix Select는 open=false 때 즉시 unmount해요. Dropdown의 Presence와 달라 exit90ms를 재생하려면 상태/포커스 수명을 바꿔야 하므로 상위 불변 제약에 따라 기존 즉시 닫힘을 보존해요(P5·M2). enter120ms·reduced100ms·키보드instant0ms는 적용해요.
- 새 키보드 선택→권한 확인 흐름과 즉시 재열기→Escape 검사를 T0 fd83538 임시 worktree에서도 실행해 같은2건 실패를 확인했어요. 역할 메뉴의 키보드 탐색/Escape/값 보존을 검증하고, 확인창 Escape는 focus/진입 완료를 기다린 뒤 검증해요. 기존 기능의 경계이며 도메인/포커스 로직은 고치지 않아요.
- 첫 캡처에서는 Vite가 이전 Tailwind TS 설정을 캐시해 새 치수 utility를 반영하지 않았어요. computed CSS로 발견하고 서버를 재시작했으며 최종 캡처는 새 설정에서 다시 생성해요.

## 검증 결과

| 명령·점검 | 결과 |
|---|---|
| 계획 파일·템플릿·경로·원칙·승인 상태 점검 | 문서 검증 명령 exit 0 — 필수 절·체크리스트·승인 기록 확인 |
| 제품 변경 없음 | git diff --exit-code로 src·tests·scripts·설정·명세의 tracked 변경 0 확인 |
| npm run check | exit0 — 타입·린트0오류/기존4경고·token-lint OK |
| npm run test | exit0 — 9파일30개 통과(새16). red6실패→green30통과 |
| npm run test:e2e | exit0 — 101개 통과·실패0 |
| node --test scripts/checks/token-lint.test.mjs | exit0 — 4개 통과, red2실패/2통과 |
| npm run check:full | exit0 — 타입·린트·token-lint·빌드 통과, 기존 Browserslist/chunk 경고 |
| verify-ui·web-design-guidelines·review-animations | [REPORT §11](../experiments/style/REPORT.md) — PNG79장·비교50장·reduced·실제 반전·접근성 잔여 기록 |

## 자기 점검

- [x] 명세에 없는 엔드포인트·필드·쿼리 없음
- [x] 상태4종 각각 화면 동작이 적혀 있음
- [x] 문구가 기존 체계의 승인된 톤 대체와 맞고 QA copy는 후속 단계
- [x] features 간 직접 import 없이 구현 가능
- [x] 테스트 계획에 단위·e2e·목 핸들러 변경/재사용 범위가 있음
- [x] 확인할 화면 목록(경로·목 조건·전후 경로)이 있음
- [x] H1~H3 승인 기록·기존 이름/의미·새 의존성0개·사람 확인2 정지를 명시

## 실제 UI 증빙

[캡처79장 manifest](../experiments/style/after/shared/manifest.json) · [보충 before6장](../experiments/style/baseline-extra/manifest.json) · [실측 비교50장](../experiments/style/after/shared/layout-comparison.json) · [reduced 캡처](../experiments/style/after/shared/reduced-confirm-1440.png) · [모션 증거](../experiments/style/after/shared/motion-evidence.json) · [명령 원문](../experiments/style/after/shared/verification/)

Sonner가 같은 이름의 success-text 변수를 자체 색 형식으로 덮어쓰므로 루트에서 --toast-success-color 어댑터를 먼저 해석해 승인한 성공 아이콘 색을 유지해요(V3·V10). Radix ref 재연결은 실제 DOM 제거와 구분해 진행 중 모션을 유지해요(M3·M4).

단계4 최종 캡처에서 공용 LoadingSkeleton 배경/막대가 같아 보이지 않는 문제를 발견해 surface·card12·내부16을 보충했어요. 상태/개수는 유지하고 fixes-loading 캡처와 최종 검증을 갱신해요(P9·V8).

최종 단계6 문구 보정: StrictMatchModal 안내를 `라벨명을 정확히 입력해 주세요. {label}`로 바꿔 조사 템플릿을 없애요(W1·W6). label 원문/strict 비교/콜백은 같고 최종 계획/회귀를 참조해요.
