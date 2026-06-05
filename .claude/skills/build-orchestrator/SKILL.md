---
name: build-orchestrator
description: Gravit 백오피스 빌드의 전체 흐름을 소유한다. "빌드 시작/이어서/계속" 또는 어느 화면을 구현할지 정해야 할 때 사용. Phase 0 복구로 재개 지점을 판단하고, 체크리스트 항목을 하나씩 게이트·리뷰 패킷·정지 순으로 진행한다.
---

# 빌드 오케스트레이터

전체 흐름의 단일 소유자. **진행의 유일한 권위 신호는 `.claude/build-state.json` 의 `checklist`** (가장 이른 비완료 항목).

## 0. 항상 먼저 — Phase 0 복구
`.claude/resource/phases/phase-0-recovery.md` 를 Read 하고 그대로 따른다. (SessionStart 훅이 재개 항목을 미리 띄워준다.)
- 재개 지점 = checklist 의 가장 이른 `TODO`/`IN_PROGRESS`.
- 불변식: `IN_PROGRESS` 는 동시에 정확히 1개. 2개 이상이면 상태 손상 → 멈추고 보고(🙋🏻).
- 휘발 산출물(node_modules 등) 없으면 재생성. 완료 컴포넌트는 재사용.

## 1. 항목 1개 처리 루프 (한 번에 하나)
1. 재개 항목을 `IN_PROGRESS` 로 표시(state 갱신).
2. 항목이 속한 `.claude/resource/phases/step-N-*.md` 의 절차·참조파일을 따른다.
3. 화면 구현 항목이면 **`implement-one-screen`** 스킬 절차를 사용 (0단계 = 해당 화면 **Figma URL 확인(선택)**, 없으면 DS-02 로 진행·중단 없음).
4. 결정 D1~D4 적용 → [[decisions]] (특히 주관식=D1 단일 객체).
5. 게이트 실행(커밋 직전): `bash .claude/hooks/checks/gate-runner.sh --full`(QA 는 `--with-smoke`). 매 턴 Stop 훅은 fast 게이트를 자동 실행한다.
   - `OK` → green 커밋(메시지에 항목 ID).
   - `FAIL` → 사유 보고 부분만 자가수정 후 재실행. **한도 3회**(`build-state.json.retry[항목]`). 초과 → 더 고치지 말고 `manual_review` 에 기록하고 멈춰 보고.
6. **리뷰 게이트 (화면 항목 step-3~6 — 미실행 방지, `checks/validate-state.mjs` 가 강제).** 게이트 green·커밋 후 **`spec-conformance-reviewer` + `ds-conformance-reviewer` 를 호출**하고 결과를 `harness/review/<항목ID>.json` 에 기록한다:
   `{ "id", "spec": "PASS"|"FAIL", "ds": "PASS"|"FAIL", "diffs": [], "commit", "ts" }`.
   - **`spec`·`ds` 모두 `PASS` 인 증거가 있을 때만** 항목을 `COMPLETED` 로 전환한다(7).
   - 하나라도 `FAIL`/DIFF → 수정 → 재게이트(`--full`) → 재리뷰. **자가수정 한도 3회**(`retry`). 초과 시 `manual_review` 기록 후 멈춰 보고.
   - validate-state 가 COMPLETED 인 step-[3-6] 항목에 **통과 리뷰 JSON** 을 요구하므로, JSON 없거나 미통과면 fast 게이트가 FAIL(Stop 차단)된다.
7. 항목 `COMPLETED`(또는 사유와 함께 `SKIPPED`/`manual-review`) 로 갱신, `log` 추가.

## 2. 사람 게이트 (정지 지점)
- **Step 종료마다**(STAGING_DETAIL 은 9 하위단계 각각마다) → `build-review-packet` 스킬로 패킷 제출 후 **정지**. 사용자 승인 전 다음 단계로 넘어가지 않는다.

## 3. 비가역/외부 작업
실제 promote(`PATCH /staging/labels/{label}/status`), 배포/publish, `git push`, OAuth 비밀값·`.env` → **코드 구조만 생성**, 실행은 사람에게 위임. (PreToolUse 훅도 차단) → [[hooks]]

## 4. 상태 파일 갱신 규칙
- 한 번에 `IN_PROGRESS` 1개. 끝나면 즉시 다음으로 넘기지 말고 정지 규칙(§2) 확인.
- `retry`/`manual_review`/`log` 는 사실대로. 게이트 red 를 green 으로 보고하지 않는다. → [[antipatterns]]

참조 규칙: [[source-of-truth]] · [[decisions]] · [[architecture]] · [[api-contract]] · [[ui-conventions]] · [[good-patterns]] · [[antipatterns]] · [[hooks]]
