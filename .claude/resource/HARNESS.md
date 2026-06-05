# Gravit 빌드 하네스 — 설치/사용

> 이 하네스를 다른 repo·계정에서 돌릴 때의 설치/사용 안내. **훅·게이트의 사실 권위는 `.claude/rules/hooks.md`** (여기서 재서술하지 않는다).

## 설치
1. 이 `.claude/` 트리를 빌드용 빈 repo 루트에 복사(하네스 전체가 `.claude/` 아래에 통합).
2. `.claude/spec/` 에 SoT 8문서 투입(읽기전용): `01_...wireframe`, `03_..._api_spec`, `04_...frontend`, `DS-00`~`DS-04`. 인덱스·약어 매핑은 `spec/00_INDEX.md`. (02 번호는 백엔드 몫이라 부재 — 누락 아님.)
3. Node 18+ 설치 확인(게이트/훅이 node 사용).
4. Claude Code 에서 repo 를 열면 `.claude/CLAUDE.md`·`.claude/rules/` 자동 로드, `.claude/settings.json` 훅 활성, `.claude/skills`·`.claude/agents` 인식. **SessionStart 훅이 재개 항목을 띄운다.**
5. Figma Dev Mode MCP 연결은 직접 수행(프레임/링크 준비 — Step 3 전까지).

## 사용
- "빌드 시작" 또는 "이어서" → `build-orchestrator` 스킬이 Phase 0 복구로 재개 지점 판단 후 진행.
- 매 Step(STAGING_DETAIL 은 9 하위단계) 종료 시 리뷰 패킷 제출 후 정지 → 사용자 승인 후 다음.

## 게이트 강도 (상세는 rules/hooks.md)
- **fast**(Stop 훅·매 턴): validate-state · typecheck · token-lint.
- **`--full`**(커밋/리뷰패킷 전): + vite build. **`--with-smoke`**(QA): + Playwright.
- lint 는 PostToolUse 에서 자동수정(소프트, 비차단).
- 자가수정 3회 초과 → `manual-review` + 정지(사람 검수). 데드락 없음.
- 안전 차단(PreToolUse): rm -rf · 원격푸시 · 배포/publish · `.claude/spec/` 쓰기 · `.env` 비밀값. 비가역(실 promote·배포·OAuth 비밀값)은 코드 구조만, 실행은 사람.

## 구조 한눈에 (모두 `.claude/` 아래)
| 버킷 | 경로 | 내용 |
|---|---|---|
| **skill** | `skills/` | 흐름·절차(build-orchestrator·implement-one-screen·build-review-packet) |
| **agent** | `agents/` | 무상태 리뷰어(spec-conformance·architecture·ds-conformance) |
| **hook** | `hooks/` | 진입점(session-start·pretool-guard·posttool-lint·stop-gate) + `checks/`(gate-runner·validate-state·typecheck·token-lint·build·smoke·lint) |
| **spec** | `spec/` | SoT 지식 8문서(읽기전용). 인덱스 = `00_INDEX.md` |
| **기타** | `resource/` | `phases/`(재개 단위 phase-0·step-1~7) · `smoke/`(Playwright) · `HARNESS.md`(이 파일) |
| (예약·고정) | `CLAUDE.md`·`settings.json`·`build-state.json`·`rules/` | 상시 인덱스 · 훅 배선 · 척추 · 자동로드 규칙 |

> `skills/`·`agents/`·`rules/`·`settings.json`·`CLAUDE.md` 는 Claude Code 예약 이름이라 이름 변경/이동 불가 — top-level 고정.
