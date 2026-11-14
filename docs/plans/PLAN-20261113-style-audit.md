# PLAN-20261113-style-audit: T1 단계 1 — 현재 화면 기록과 감사

| 항목 | 내용 |
|---|---|
| 상태 | 커밋됨 (2026-11-14) — 사용자 커밋·푸시 승인 |
| 요청 | 사용자 세션 T1 단계 1(2026-11-13). 현재 화면을 두 폭으로 기록하고 P·W·V·M 원칙으로 감사 |
| 범위 밖 | 제품 코드·기존 명세·토큰·문구 변경, 신규 의존성, 단계 2 토큰 확정, API·권한·라우트·레이아웃 변경, 커밋·푸시 |

## 1. 목적

스타일을 바꾸기 전에 현재 전체 화면의 영역 순서·위치와 정보 밀도를 기록해요. 이 기록을 단계 2의 디자인 방향과 단계 6의 레이아웃 비교 근거로 사용해요(P8·V4·M1).

준비 근거: [단계 0 기록](PLAN-20261113-style-preparation.md). 실험 브랜치는 `experiment/style-refresh`, 비교 기준은 `fd83538bc640e62cc1bed5a17ddc4657e3de421b`예요.

## 2. 읽은 문서

| 문서 | 절 | 이 계획에 주는 제약 |
|---|---|---|
| 사용자 T1 요청 | 목표·범위·단계 1·사람 확인 1/2 | 페이지 골격 고정, 전체 화면·두 폭 기록, 단계별 별도 계획 |
| `AGENTS.md` | 2~9 | 승인 후 진행·증거 확인·한국어 표·로컬 서버 정리 |
| `docs/spec/00_INDEX.md` | 전체 | 관할·우선순위, D 결정이 오래된 DS 묘사보다 우선 |
| `docs/conventions/antipatterns.md` | 전체 | 계약을 바꾸거나 추측으로 화면을 추가하지 않음 |
| `docs/conventions/decisions.md` | D1~D14의 관련 결정 | 주관식 단일 객체, OAuth, DAU/MAU, Ravvit, QA 최신 화면·문구·모션 기록 |
| `docs/conventions/architecture.md` | 전체 | 기존 레이어·라우터·목 핸들러 위치 확인 |
| `docs/conventions/ui-conventions.md` | 전체 | 현재 토큰 매핑·셸 수치·공용 패턴의 기준 기록 |
| `docs/conventions/testing.md` | 전체 | MSW 격리·기존 테스트 역할, 실제 서비스 쓰기 금지 |
| `docs/spec/DS-00_overview.md` | 전체 | 데스크톱·라이트·셸 골격 |
| `docs/spec/DS-01_design_system.md` | 전체 | 기존 색·글자·여백·반경·컴포넌트의 비교 기준 |
| `docs/spec/DS-02_screens.md` | 전체 | 필수 16화면과 표시/편집·객관식/주관식·스테이징 변형 |
| `docs/spec/DS-03_interactions.md` | 전체 | 모달·오류·빈 상태·로딩의 현재 기준. 주관식 구기재는 D1·D2 우선 |
| `docs/spec/01_gravit_admin_wireframe_spec.md` | §1~3 | 서비스 목적·고정 골격·기존 IA |
| `docs/spec/04_gravit_admin_frontend_spec.md` | §1~2-2 | 주관식 모델 충돌 해소·검색/필터 범위 |
| `.agents/skills/style-designer/SKILL.md` | 전체, 특히 §7·§8 | 감사 순서와 원칙 번호, 삭제·단순화 우선 |
| `.agents/skills/write-plan/SKILL.md` | 전체·템플릿 | 이 계획서 승인 후 실행 |
| `.agents/skills/verify-ui/SKILL.md`·`agent-browser/SKILL.md` | 전 캡처·core·commands | 목 세션·두 폭·의미 있는 대기·화면 직접 확인·종료 |
| `.agents/skills/verification-before-completion/SKILL.md` | 전체 | 캡처 존재·해상도·내용·계획서 근거 확인 후 보고 |
| `.agents/skills/web-design-guidelines/SKILL.md`·최신 원문 | 전체 | 2026-11-13에 지침을 받아 현재 사용 UI 코드 감사. 발견 사항은 보고서에 기록 |

읽은 코드: `src/app/router.tsx`·`main.tsx`, `src/pages/AppShell.tsx`, `src/shared/components/layout/MainLayout.tsx`, `src/features/auth/store.ts`, `src/mocks/handlers.ts`·`qaHandlers.ts`, `src/features/ravvit/api.ts`·`schemas.ts`·`components/`, `src/features/qa/copy.ts`, `tests/e2e/qa-flow-v2.spec.ts`.

화면별 감사 때 실제 사용 컴포넌트를 추가로 읽고, 관찰한 값과 문구만 보고서에 적어요. 현재 단계에는 새 화면 디자인 입력이 필요하지 않아 Figma를 사용하지 않아요. 레이아웃은 실행 화면을 기록하고, 개선 제안은 P·W·V·M에 근거해요.

## 3. 바뀌는 화면·라우트

없음 — 실행 화면을 관찰하고 PNG·감사 문서만 추가해요.

| 범위 | 화면 수 | 캡처 |
|---|---|---|
| DS-02 기본 목록 전체 | 16 | 1280×900·1440×900 각 1장, 합계 32장 |
| 현재 라우터의 추가 화면 | 9 | 문의 목록/상세·Ravvit·QA 목록/5개 상세 탭, 합계 18장 |
| 기존 변형·상태·오버레이 | §10의 추가 행 | 각 두 폭으로 기록. 새 라우트·상태를 만들지 않음 |

OAuth 콜백은 임시 인증 처리 경로이고 QA 상세 index는 기존 탭으로 이동하므로 독립 화면 수에 넣지 않아요. 기본 캡처는 최소 50장이에요. 긴 화면의 하단 감사에는 `--full` 캡처를 추가하고 기본 뷰포트 캡처와 구분해요.

## 4. 코드 변경 (스키마 → API → 훅 → 컴포넌트 → 페이지 → 라우트 순)

없음 — 모든 제품·테스트 코드를 유지해요.

| 파일 | 단위 | 변경 내용 |
|---|---|---|
| `docs/experiments/style/before/` | PNG | `{screen}-{state}-{1280|1440}.png` 명명. 기본 상태는 `normal`, 편집·오버레이는 이름으로 구별 |
| `docs/experiments/style/REPORT.md` | 문서 | 캡처 목록·실행 조건·25화면 감사표 150행·골격 기준·문구/모션 후보·후속 결정 목록 |
| `docs/experiments/style/before/capture-manifest.json` | 증빙 | 경로·폭·fixture·영역 좌표·표시 문구·계산된 글자 스타일. Deviation Log 참고 |
| 이 계획서 | 실행 기록 | 승인일·캡처 링크·실제 검증 결과·Deviation Log 추가 |

REPORT는 단계 1 시점임을 표시해요. 적용 결과·문구 변경·모션 변경은 아직 없다고 적고, 이후 단계에서 채울 절을 마련해요. 기존 DS 삭제·대체는 제안만 기록하고 실제로 지우지 않아요.

## 5. API 계약 영향 (`docs/spec/03_gravit_admin_api_spec.md`, 별도 서비스는 해당 D 항목)

없음 — 기존 API·Zod·권한·데이터 흐름을 바꾸지 않아요. MSW의 현재 fixture와 `qaMock` 시나리오만 사용해요.

Ravvit은 기존 MSW 지원이 없으므로 브라우저 세션에 한해 계약과 같은 health 응답을 제공해 초기 화면을 기록해요(단계 0에서 확인). 이 조건을 PNG 인덱스에 적어요. 답변·스트리밍 감사가 필요하면 이미 정의된 SSE 스키마를 확인한 뒤 브라우저 안에서만 응답을 제공하고, 실제 `/chat` 요청은 보내지 않아요. 목 준비가 부족해 기록할 수 없는 상태는 미확인으로 표시해요.

## 6. 상태 4종

| 상태 | 조건 | 화면 동작 |
|---|---|---|
| 로딩 | `/qa/sprints/9/fix-reports?qaMock=fixes-loading`의 기존 지연 | 스켈레톤이 보이는 동안 캡처. 현재 600ms로 안정적 기록이 어려우면 브라우저 응답 지연을 사용하고 조건 기록 |
| 빈 상태 | `/qa/sprints?qaMock=empty`, Ravvit 새 대화 | 안내·시작 행동·불필요한 아이콘 여부 기록(P4·V7·V8·W5) |
| 오류 | `/qa/sprints?qaMock=503` | 실제 목 오류 UI와 재시도·해결 안내 기록(W12·V8) |
| 정상 | 기본 25화면·기존 fixture | 주요 행동·상태 신호·정보 위계·문구·움직임 순서대로 감사 |

상태 4종의 대표 사례를 기록하고 화면별 해당 여부를 표시해요. 모든 화면의 모든 실패 조합을 검증했다는 뜻은 아니에요. 신규 오류 시나리오나 목 핸들러를 만들 필요가 생기면 별도 변경 계획으로 올려요.

## 7. 문구

| 위치 | 문구 | 근거(명세 절·copy 키) |
|---|---|---|
| 모든 화면 | 기존 문구를 원문 그대로 기록, 개선안만 별도 열 | W1·W5·W6·W7·W8·W12 |
| QA | `src/features/qa/copy.ts`의 키와 현재 값 병기 | D11·D12·D13 |
| 코드·ID·상태·데이터 본문 | 사람이 읽는 안내와 구분하여 원문 유지 대상으로 표시 | 페르소나 어드민 예외·사용자 범위 |

감사표는 `위치 | 원칙 번호 | 지금 | 제안` 형식이에요. 각 화면마다 주요 행동(P4·P8) → 상태 신호(V8) → 강조색(V2) → 문구(W1·W5·W12) → 모션(M1) → 제거 가능성(P10) 순서로 적어요. 관찰하지 못한 모션은 추측하지 않고 미확인으로 적어요.

## 8. 고칠 명세

없음 — 단계 1은 현재 화면의 기록이에요. 기존 DS-00~03, `decisions.md`, 토큰 명명 표를 바꾸지 않아요. 새 토큰·문구·모션 정의와 기존 결정의 대체 범위는 단계 2 계획에 적고 사람 확인 1로 올려요.

## 9. 테스트 계획

| 종류 | 파일 | 확인할 동작 |
|---|---|---|
| 단위(Vitest) | 기존 `src/**/*.test.ts(x)` | 변경 없음 — 동작·문구·상태 표시를 수정하지 않는 기록 단계 |
| e2e(Playwright + MSW) | 기존 `tests/e2e/*.spec.ts` | 변경 없음 — 현재 fixture·목 세션 방법을 참조 |
| 목 핸들러 | `src/mocks/handlers.ts`·`qaHandlers.ts` | 변경 없음 — 현재 ID·시나리오 사용 |
| 캡처 확인 | `docs/experiments/style/before/*.png` | 필수 25화면×2폭 누락 없음, 픽셀 크기 확인, 모든 캡처 직접 열람 |
| 문서 확인 | `REPORT.md`·이 계획서 | 캡처 경로·상태 조건·감사 원칙 번호·미확인 상태 누락 없음 |

소스 변경이 없으므로 테스트를 새로 쓰지 않아요. 이후 문구·상태 표시 구현 단계에서는 `write-test`로 단위·e2e 기대값을 함께 갱신해요. 커밋이 승인되는 단계에서는 `commit-push`의 `npm run check:full`과 푸시 전 확인을 따라요.

## 10. 확인할 화면 (verify-ui)

아래 모든 행을 1280×900·1440×900으로 기록해요. `전 캡처`에 실제 파일 링크를 기록했어요. 모든 행의 후 캡처는 해당 없음(아직 스타일 변경 없음)이에요.

| 경로 | 목 데이터 조건 | 볼 것 | 전 캡처 | 후 캡처 |
|---|---|---|---|---|
| `/login` | 목 모드·로그인 힌트 제거 | 기존 로그인 골격·버튼·문구·브랜드 요소 | [1280](../experiments/style/before/login-normal-1280.png) · [1440](../experiments/style/before/login-normal-1440.png) | 해당 없음 |
| `/` | 목 세션 | 통계 카드·별도 DAU/MAU 카드·숫자 위계 | [1280](../experiments/style/before/dashboard-normal-1280.png) · [1440](../experiments/style/before/dashboard-normal-1440.png) | 해당 없음 |
| `/notices` | 기본 fixture | 고정·상태·날짜·행 액션 | [1280](../experiments/style/before/notices-normal-1280.png) · [1440](../experiments/style/before/notices-normal-1440.png) | 해당 없음 |
| `/notices/new` | 초기 폼, 제출 안 함 | 필드·하단 행동 위계 | [1280](../experiments/style/before/notice-new-normal-1280.png) · [1440](../experiments/style/before/notice-new-normal-1440.png) | 해당 없음 |
| `/notices/1` | 기본 fixture | 표시 모드·게시 상태·본문 | [1280](../experiments/style/before/notice-detail-normal-1280.png) · [1440](../experiments/style/before/notice-detail-normal-1440.png) | 해당 없음 |
| `/users` | 기본 fixture | 검색·역할·상태·정보 밀도 | [1280](../experiments/style/before/users-normal-1280.png) · [1440](../experiments/style/before/users-normal-1440.png) | 해당 없음 |
| `/users/1001` | 일반 사용자 fixture | 프로필·역할·상태 영역 | [1280](../experiments/style/before/user-detail-normal-1280.png) · [1440](../experiments/style/before/user-detail-normal-1440.png) | 해당 없음 |
| `/reports` | 기본 미해결 필터 | 상태 신호·유형·문제 링크 | [1280](../experiments/style/before/reports-normal-1280.png) · [1440](../experiments/style/before/reports-normal-1440.png) | 해당 없음 |
| `/reports/1024` | 기본 fixture | 신고 내용·메타·처리 상태 | [1280](../experiments/style/before/report-detail-normal-1280.png) · [1440](../experiments/style/before/report-detail-normal-1440.png) | 해당 없음 |
| `/chapters` | 기본 fixture | 제목·설명 위계 | [1280](../experiments/style/before/chapters-normal-1280.png) · [1440](../experiments/style/before/chapters-normal-1440.png) | 해당 없음 |
| `/chapters/1` | 기본 fixture | 풀이 현황·유닛의 기존 영역 순서 | [1280](../experiments/style/before/chapter-detail-normal-1280.png) · [1440](../experiments/style/before/chapter-detail-normal-1440.png) | 해당 없음 |
| `/units/12` | 기본 fixture | 정보·레슨 목록 | [1280](../experiments/style/before/unit-detail-normal-1280.png) · [1440](../experiments/style/before/unit-detail-normal-1440.png) | 해당 없음 |
| `/lessons/901` | 기본 fixture | 문제 ID·유형·지시문 | [1280](../experiments/style/before/lesson-detail-normal-1280.png) · [1440](../experiments/style/before/lesson-detail-normal-1440.png) | 해당 없음 |
| `/problems/1001` | 객관식 | 문제·보기·정답·해설 | [1280](../experiments/style/before/problem-objective-normal-1280.png) · [1440](../experiments/style/before/problem-objective-normal-1440.png) | 해당 없음 |
| `/staging/labels` | 기본 PENDING 필터 | 라벨 코드·설명·상태 | [1280](../experiments/style/before/staging-normal-1280.png) · [1440](../experiments/style/before/staging-normal-1440.png) | 해당 없음 |
| `/staging/labels/2026-04-25-a3f9` | PENDING·레슨 선택 | 고정 2단 골격·반영 행동·비활성 저장 | [1280](../experiments/style/before/staging-detail-normal-1280.png) · [1440](../experiments/style/before/staging-detail-normal-1440.png) | 해당 없음 |
| `/inquiries` | 기본 fixture | 문의 유형·상태·제목 | [1280](../experiments/style/before/inquiries-normal-1280.png) · [1440](../experiments/style/before/inquiries-normal-1440.png) | 해당 없음 |
| `/inquiries/5001` | 미답변 fixture | 문의·사용자·답변 입력 | [1280](../experiments/style/before/inquiry-detail-normal-1280.png) · [1440](../experiments/style/before/inquiry-detail-normal-1440.png) | 해당 없음 |
| `/ravvit` | 세션 한정 health 임시 응답 | 새 대화·입력·추천 질문·스크롤 골격 | [1280](../experiments/style/before/ravvit-normal-1280.png) · [1440](../experiments/style/before/ravvit-normal-1440.png) | 해당 없음 |
| `/qa/sprints` | 기본 fixture | 3열 목록·등록 행동 | [1280](../experiments/style/before/qa-sprints-normal-1280.png) · [1440](../experiments/style/before/qa-sprints-normal-1440.png) | 해당 없음 |
| `/qa/sprints/9/setup` | 기존 9번 fixture | 연결·준비 작업·단계 | [1280](../experiments/style/before/qa-setup-normal-1280.png) · [1440](../experiments/style/before/qa-setup-normal-1440.png) | 해당 없음 |
| `/qa/sprints/9/design-review` | 기존 9번 fixture | 디자인 항목·판정·관리 행동 | [1280](../experiments/style/before/qa-design-normal-1280.png) · [1440](../experiments/style/before/qa-design-normal-1440.png) | 해당 없음 |
| `/qa/sprints/2/checklist/1` | 기존 2번 fixture | 샘플 후보, 게이지·필터·항목·판정 | [1280](../experiments/style/before/qa-first-normal-1280.png) · [1440](../experiments/style/before/qa-first-normal-1440.png) | 해당 없음 |
| `/qa/sprints/2/checklist/2` | 기존 2번 fixture | 수동 검수·남은 항목·종료 행동 | [1280](../experiments/style/before/qa-second-normal-1280.png) · [1440](../experiments/style/before/qa-second-normal-1440.png) | 해당 없음 |
| `/qa/sprints/9/fix-reports` | 검수 완료·Fail 없음 | 파트별 결과·빈 수정사항 | [1280](../experiments/style/before/qa-fixes-normal-1280.png) · [1440](../experiments/style/before/qa-fixes-normal-1440.png) | 해당 없음 |
| `/problems/1003` | 주관식 | 단일 콤마 문자열·해설1개 | [1280](../experiments/style/before/problem-subjective-normal-1280.png) · [1440](../experiments/style/before/problem-subjective-normal-1440.png) | 해당 없음 |
| 공지·챕터·유닛·레슨·문제 상세 | 기존 편집 모드, 저장 안 함 | 기존 폼 변형과 행동·마크다운 작성/미리보기 | [편집 모드 6종·두 폭 목록](../experiments/style/REPORT.md) | 해당 없음 |
| PENDING 스테이징 상세 | 문제 1·문제 3 선택 | 객관식·주관식 폼, 입력값으로 준비 확인 | [1280](../experiments/style/before/staging-objective-1280.png) · [1440](../experiments/style/before/staging-objective-1440.png) · [1280](../experiments/style/before/staging-subjective-1280.png) · [1440](../experiments/style/before/staging-subjective-1440.png) | 해당 없음 |
| `/staging/labels/2026-04-23-d4e1` | COMPLETED | 완료 안내·읽기 전용·숨겨진 저장 | [1280](../experiments/style/before/staging-completed-1280.png) · [1440](../experiments/style/before/staging-completed-1440.png) | 해당 없음 |
| `/qa/sprints?qaMock=empty` | 기존 empty 시나리오 | 빈 상태 | [1280](../experiments/style/before/qa-sprints-empty-1280.png) · [1440](../experiments/style/before/qa-sprints-empty-1440.png) | 해당 없음 |
| `/qa/sprints?qaMock=503` | 기존 503 시나리오 | 오류 상태 | [1280](../experiments/style/before/qa-sprints-error-1280.png) · [1440](../experiments/style/before/qa-sprints-error-1440.png) | 해당 없음 |
| `/qa/sprints/9/fix-reports?qaMock=fixes-loading` | 기존 지연 fixture | 로딩 상태 | [1280](../experiments/style/before/qa-fixes-loading-1280.png) · [1440](../experiments/style/before/qa-fixes-loading-1440.png) | 해당 없음 |
| QA 목록·1차 체크리스트 | 등록 모달·Fail 사유 창·상태 범례 열기, 변경 확정 안 함 | 공용 오버레이의 문구·포커스·정보 배치 | [등록·사유·범례 두 폭 목록](../experiments/style/REPORT.md) | 해당 없음 |
| PENDING 스테이징 상세 | 반영 모달 열기만, 입력·확정 안 함 | 위험 안내·정확 일치 입력 골격 | [1280](../experiments/style/before/staging-promote-dialog-1280.png) · [1440](../experiments/style/before/staging-promote-dialog-1440.png) | 해당 없음 |

기본 50장 이외의 캡처는 보고서에서 변형·상태별로 구분해요. 조작 전에 snapshot으로 현재 요소를 확인하고, 화면 전환 뒤에는 의미 있는 문구·입력값·데이터 조건으로 대기해요. 직접 수정하거나 확정하는 버튼은 누르지 않아요.

## 11. 결정 필요

| # | 질문 | 선택지 | 추천 |
|---|---|---|---|
| 1 | 단계 1의 전체 화면 기록·감사 | 2026-11-13 사용자 “승인” | 승인 범위 기록·감사 수행 |

아래는 이번 단계에서 바꾸지 않고 단계 2 보고에 올릴 쟁점이에요.

| 쟁점 | 현재 근거 | 단계 2에서 제시할 것 |
|---|---|---|
| 기존 보라 Primary와 P·W·V·M 방향 | DS-01·D7 ↔ T1의 새 시각 시스템 요청 | 새 색·차트/게이지 처리·대비·기존 결정 대체 범위(V2·V3) |
| 기존 QA 확정 문구와 해요체 | D11~D13·copy.ts | 동작 의미·원문 코드 유지 조건과 문구 변경 목록(W1·W7·W12) |
| 기존 OAuth 제공자 로고 | D5의 기존 로그인 한정 예외 ↔ T1의 타사 로고 제한 | 기존 자산 처리 방안, 경계가 애매한 사항은 변경 전 질문 |
| 토큰 이름·의존성 | 현재 CSS 변수·Tailwind 별칭 | 이름 유지/변경 제안과 이유, 필요 시 의존성 제안. 승인 전 설치 없음 |

사람 확인 1은 단계 2의 실제 토큰 문서·정적 견본을 제시한 뒤 별도로 멈춰요. 단계 1 승인으로 토큰 구현이나 전체 화면 적용을 승인받은 것으로 간주하지 않아요.

## Deviation Log

| 날짜 | 계획 | 실제 | 이유 |
|---|---|---|---|
| 2026-11-13 | PNG·REPORT 중심 증빙 | capture-manifest.json 추가 | 경로·폭·영역 좌표·표시 문구·계산된 스타일을 보존해 이후 비교를 재현하기 위한 문서 증빙 |
| 2026-11-13 | 600ms QA 로딩을 기록, 어려우면 브라우저 지연 | setup에서 같은 문서의 XHR GET만 일시 보류한 뒤 탭 이동 | 설치 CLI 0.41.2의 addinitscript 미지원은 doctor 확인. 실제 응답·MSW·소스는 변경 없음, 브라우저 종료로 정리 |
| 2026-11-13 | 긴 화면에 full 캡처 추가 | 11종·두 폭 22장 추가, 모달은 900px 뷰포트 기록만 유지 | 아래 영역과 저장 행동까지 감사하고 고정 오버레이는 실제 뷰포트 모습으로 비교하기 위함 |

## 검증 결과

| 명령·점검 | 결과 |
|---|---|
| `npm run check` | 통과(exit 0). 타입 검사 통과·ESLint 오류 0/기존 경고 4·token-lint OK. implement의 확인 절차 수행 |
| `npm run test` | 미실행 — 기록 단계·테스트 변경 없음 |
| `npm run test:e2e` | 미실행 — 기록 단계·테스트 변경 없음 |
| `npm run check:full` | 커밋 단계에서 실행, 현재 커밋하지 않음 |
| 캡처 수·크기·열람·링크 | 기본 50·변형/상태 38·긴 문서 전체 22 = PNG 110장. Python 검사 exit 0, 모든 이미지 타일 열람·주요 원본 확대. 문서 링크·계획서 3개 구조·감사표 25개/150행·오버레이 4종·로딩 확인 |
| verify-ui 점검표 | 아래 점검표와 [REPORT](../experiments/style/REPORT.md). before만 기록, 제품 변경·after 없음 |


### verify-ui 점검표

| 점검 | 관찰·근거 | 처리 |
|---|---|---|
| 화면 목록 | DS-02 16·추가 9화면, 각각 두 폭 | 기본 50장, 25개 감사표 150행 |
| 변형·상태 | 주관식·편집·마크다운 미리보기·스테이징 완료·QA 빈/오류/로딩·오버레이 | 19종×2폭=38장, 조건은 REPORT·manifest 기록 |
| 긴 화면 | QA 상세·공지/챕터/문제 편집·스테이징 객관식 | 11종×2폭=22장 |
| 골격 | 사이드바 240·헤더 56·현재 영역 순서, 모든 캡처 scrollWidth≤폭 | before 기준을 기록, after 동일성 판정은 아직 없음 |
| 대비 | 로그인 흰 글자/초록 면 2.81:1, 회색 배지 4.35:1 | 단계 2 토큰 설계 입력. 이번에는 수정하지 않음(V10) |
| 웹 UI 지침 | 최신 지침·사용 파일 기준 이름·키보드 진입·대비·모션 발견 사항 | REPORT §5의 file:line·처리 표. 스타일 밖 동작은 별도 승인 후보 |
| 문구 | 프론트 소유 안내·콘텐츠·코드 원문 구분 | 후보만 기록, 실제 변경 0건 |
| 모션 | 현재 소스의 시간·reduced 분기와 관찰 범위를 구분 | 정식 review-animations diff 심사는 변경 단계에서 수행 |
| 정리 | 브라우저 2세션 close exit 0·서버 SIGINT 종료·포트 해제 | 임시 health 응답·XHR 보류 정리 |

## 자기 점검

- [x] 명세에 없는 엔드포인트·필드·쿼리 없음
- [x] 상태 4종 각각 화면 동작이 적혀 있음
- [x] 문구가 기존 문구 체계와 맞음 — 기존 원문을 기록하고 제안만 분리
- [x] `features` 간 직접 import 없이 구현 가능 — 제품 코드 변경 없음
- [x] 테스트 계획에 단위·e2e와 목 핸들러 변경 여부가 있음 — 모두 변경 없음
- [x] 확인할 화면 목록이 있음
