# Phase 0 — 복구 (항상 먼저 실행)

## 목적
중단된 실행을 안전하게 이어간다. 매 세션/compaction 후 기본 진입점.

## 선행조건
- 없음. 항상 가장 먼저 실행.

## 참조파일
- `.claude/build-state.json` (척추)
- `.claude/skills/build-orchestrator/SKILL.md`

## 절차
1. `.claude/build-state.json` 을 Read.
2. **재개 지점** = `checklist` 의 가장 이른 비완료(`TODO`/`IN_PROGRESS`) 항목. (SessionStart 훅이 이 항목을 미리 띄워준다.)
3. 불변식 점검: `IN_PROGRESS` 가 2개 이상이면 상태 손상 → 멈추고 사용자에게 보고(🙋🏻).
4. 휘발 상태 재생성: `node_modules`/dev 산출물이 없으면 `npm install`. (불변 산출물=완료 컴포넌트는 재사용, playbook #13)
5. 재개 항목의 phase 파일로 이동.

## 출력
- 재개 항목 ID 1개 + 다음 phase 파일 경로.

## 실패처리
- 상태 파일 파싱 불가/불변식 위반 → 진행 금지, 사용자 보고.

## 다음 phase
- 재개 항목이 속한 `step-N-*.md`.
