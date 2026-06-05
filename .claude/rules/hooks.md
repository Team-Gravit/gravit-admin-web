# 규칙 — 훅·게이트 동작 (단일 권위)

> 훅·게이트의 **사실은 이 파일이 권위**다. CLAUDE.md·resource/HARNESS.md 는 여기로 가리키기만 한다(재서술 금지).
> 배선: `.claude/settings.json`. 스크립트: `.claude/hooks/`(진입점) + `.claude/hooks/checks/`(검증).

## hooks/ 구조
- `hooks/` — settings.json 이 직접 부르는 **진입점**: `session-start.mjs` · `pretool-guard.mjs` · `posttool-lint.mjs` · `stop-gate.mjs`.
- `hooks/checks/` — 진입점이 호출하는 **결정적 검증**: `gate-runner.sh`(묶음) · `validate-state.mjs` · `typecheck.sh` · `token-lint.mjs`(+`token-lint.allow.txt`) · `build.sh` · `smoke.sh` · `lint.sh`.

## 배선된 훅 (settings.json)
| 이벤트 | 매처 | 스크립트 | 동작 |
|---|---|---|---|
| **SessionStart** | (전체) | `hooks/session-start.mjs` | build-state 의 재개 항목·무결성 경고를 컨텍스트에 주입. **비차단**(exit 0). |
| **PreToolUse** | `Bash`·`Write`·`Edit`·`MultiEdit` | `hooks/pretool-guard.mjs` | 위험/비가역 차단(exit 2). |
| **PostToolUse** | `Write`·`Edit`·`MultiEdit` | `hooks/posttool-lint.mjs` | 수정한 `src/**.{ts,tsx}` 만 `eslint --fix`. **비차단**(exit 0). |
| **Stop** | (전체) | `hooks/stop-gate.mjs` | 완료 선언 전 **fast 게이트** 강제. red 면 정지 차단(exit 2)→자가수정 유도. |

## 게이트 모드 (`hooks/checks/gate-runner.sh`)
출력 `OK` 또는 `FAIL\n{사유}`. 모드별 검증 묶음:
- **fast**(인자 없음) = `validate-state` + `typecheck` + `token-lint`. **Stop 훅이 매 턴 실행**(가볍게).
- **`--full`** = fast + `build`(vite). **커밋/리뷰패킷 직전** 오케스트레이터가 실행(무거운 풀빌드는 여기서만).
- **`--with-smoke`** = full + Playwright 스모크. **QA(Step 7)**.
- 근거(#9): 매 턴 풀빌드 비용 제거 — Stop 은 fast, 의미있는 체크포인트에서만 full.

## PreToolUse 차단 대상 (pretool-guard.mjs)
- Bash: `rm -rf /|~|..`, `git push`(--force 포함), `gh release|pr merge|repo delete`, npm/yarn/pnpm `publish`, vercel/netlify/firebase/gh-pages deploy·`--prod`, `curl | sh`, `> .claude/spec/` 리다이렉트.
- Write/Edit: `.claude/spec/`(**`00_INDEX.md` 만 예외**) · `.env*` 파일. → spec 읽기전용·비밀값은 사람 입력. [[antipatterns]]

## Stop 게이트 (stop-gate.mjs → checks/gate-runner.sh fast)
- `package.json` 없으면(=Step 1 이전) 게이트 대상 없음 → **통과**. Step 1 이후 자동 활성화.
- red → 정지 차단(자가수정). **자가수정 한도 3회**(`build-state.json.retry`). 초과하거나 `manual_review` 태그 시 → 데드락 방지로 정지 허용 + 사람 검수.
- token-lint(`checks/token-lint.mjs`): `src/` 의 raw hex·arbitrary 값 탐지. 토큰 정의 파일은 `checks/token-lint.allow.txt` 로, shadcn 생성물은 `src/components/ui` 경로로 제외. → [[ui-conventions]]

## 상태 무결성 (validate-state.mjs)
- 검사: `IN_PROGRESS` ≤ 1 · checklist `id` 유일 · `status` ∈ {TODO,IN_PROGRESS,COMPLETED,SKIPPED,manual-review}.
- fast 게이트에 포함(매 턴) + SessionStart 에서도 경고. 손상 시 진행 금지 신호.

## 경로 계약 (변경 시 동기화 필수)
- 권위 상태 파일: **`.claude/build-state.json`**(단일·top-level). 스크립트는 자기 위치 기준 상대경로로 접근(`stop-gate.mjs`·`session-start.mjs` → `../build-state.json`, `validate-state.mjs` → `../../build-state.json`).
- 검증 묶음: `stop-gate.mjs` → `hooks/checks/gate-runner.sh`(같은 디렉토리의 `checks/`).
- smoke 테스트: `.claude/resource/smoke/` (`checks/smoke.sh` 가 실행).
