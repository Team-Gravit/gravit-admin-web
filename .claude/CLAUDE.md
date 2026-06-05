# Gravit 백오피스 프론트엔드 — 빌드 하네스 (메모리)

> 상시 로드 파일. **최소 인덱스 + 복구 규칙만** 담는다. 사실·절차는 아래 경로에서 Read 한다. 여기에 spec/rules 내용을 복붙하지 않는다.

## 디렉토리 한눈에 (모두 `.claude/` 아래)
```
CLAUDE.md            상시 인덱스(이 파일)
settings.json        훅 배선(SessionStart·PreToolUse·PostToolUse·Stop)
build-state.json     척추 — 진행의 유일한 권위 신호
skills/   흐름·절차(build-orchestrator·implement-one-screen·build-review-packet)
agents/   무상태 리뷰어(spec-conformance·architecture·ds-conformance)
rules/    SoT 인용 규칙(자동 로드)
hooks/    훅 진입점 3 + session-start + checks/(결정적 검증)
spec/     SoT 지식 8문서(읽기전용). 인덱스 = spec/00_INDEX.md
resource/ phases/(재개 단위) · smoke/(Playwright) · HARNESS.md(설치/사용)
```
> 참조 규약: **실제로 Read 할 파일은 명시 경로**(`.claude/...`)로 쓴다. `[[name]]` 은 `rules/name.md` 가리키는 힌트일 뿐이며, rules/ 는 전부 자동 로드되므로 그 내용은 이미 컨텍스트에 있다(따로 열 필요 없음).

## 0. 항상 먼저: 복구 (Phase 0)
- 어떤 작업이든 시작 전 `.claude/resource/phases/phase-0-recovery.md` 를 Read 하고 그대로 따른다. (SessionStart 훅이 재개 항목을 미리 띄워준다.)
- **진행의 유일한 권위 신호**: `.claude/build-state.json` 의 `checklist` 에서 **가장 이른 비완료(TODO/IN_PROGRESS) 항목**.
- `IN_PROGRESS` 는 동시에 정확히 1개만 존재한다(2개+ = 상태 손상 → 멈춰 보고 🙋🏻).

## 1. 흐름 소유
- 전체 흐름은 오케스트레이터가 소유: `.claude/skills/build-orchestrator/SKILL.md`
- 한 화면 구현 표준 절차: `.claude/skills/implement-one-screen/SKILL.md`
- 리뷰 패킷 양식: `.claude/skills/build-review-packet/SKILL.md`

## 2. 지식(SoT) 인덱스 — 사실은 오직 여기서만
- 인덱스/약어 매핑/관할: `.claude/spec/00_INDEX.md` (먼저 보기)
- 동작/데이터/상태전이/검증: `spec/01_gravit_admin_wireframe_spec.md`
- API 계약: `spec/03_gravit_admin_api_spec.md`
- 프론트 통합/Step 가이드: `spec/04_gravit_admin_frontend_spec.md`
- 디자인 토큰·컴포넌트: `spec/DS-01_design_system.md`(§1~7 토큰·컴포넌트 권위) · 화면 시각 명세: `spec/DS-02_screens.md`(16화면) · 상호작용: `spec/DS-03` · 개요: `spec/DS-00`
- 우선순위·충돌 해소: `.claude/rules/source-of-truth.md`, `.claude/rules/decisions.md`

## 3. 불변 제약 (요약만 — 권위·상세는 `rules/`)
- 명세에 없는 엔드포인트/필드를 **만들지 않는다.** 불명확하면 멈춰 질문(🙋🏻). → `rules/source-of-truth.md`·`rules/api-contract.md`
- `any` 금지. 모든 API 응답은 Zod 스키마로 파싱 후 사용. → `rules/api-contract.md`
- 데스크탑 1280px+ 단일 폭, 라이트 모드 전용. 반응형/다크 코드 금지. → `rules/ui-conventions.md`
- 색/간격/타이포는 DS-01 토큰·컴포넌트 명칭. raw hex·매직 px 금지. → `rules/ui-conventions.md`
- `features/{a}` 가 `features/{b}` 를 직접 import 하지 않는다(`shared` 만). 절대경로 `@/` 만. → `rules/architecture.md`
- 안티패턴 전체 목록: `rules/antipatterns.md` · 권장 패턴: `rules/good-patterns.md`

## 4. 자동 게이트 (통과 전 "완료" 선언 금지)
- 게이트 러너: `.claude/hooks/checks/gate-runner.sh` → `OK` 또는 `FAIL\n{사유}`.
  - 인자 없음 = **fast**(validate-state·typecheck·token-lint) — Stop 훅이 매 턴 실행.
  - `--full` = fast + `vite build` — **커밋/리뷰패킷 전** 오케스트레이터가 실행.
  - `--with-smoke` = full + Playwright 스모크 — QA(Step 7).
- 훅 배선·동작의 **단일 권위는 `.claude/rules/hooks.md`**. (여기서 재서술하지 않는다.)
- 자가수정 한도 **3회**(`build-state.json.retry`). 초과 시 `manual_review` 기록 후 멈춰 보고.

## 5. 사람 게이트
- Step 종료마다(STAGING_DETAIL 은 9 하위단계마다) 리뷰 패킷 제출 후 **정지**. 사용자 승인 후 다음 단계.
- 비가역/외부 작업(실제 promote, 배포/publish, OAuth 비밀값 입력)은 **코드 구조만** 생성하고 실행은 사람에게 위임.
