# PLAN-20261113-codex-harness: 하네스를 Claude Code 에서 Codex 로 전환

| 항목 | 내용 |
|---|---|
| 상태 | 커밋됨 |
| 요청 | 세션 T0 문서(사용자 작성, 2026-11-13). 결정 D1~D6 이 승인된 계획 역할을 한다 |
| 범위 밖 | 제품 코드(`src/`) 동작 변경, 스타일 개편(T1), 비밀 값 |

## 1. 목적
앞으로의 작업은 기능 추가·수정이다. Step 1~13 으로 백지부터 쌓던 Claude 빌드 하네스를 걷어 내고, Codex 로 "계획 → 구현 → 테스트 → 커밋·푸시"를 하는 구조로 바꾼다. 명세는 살아 있는 문서로 두고, Vitest 단위 테스트를 들인다.

## 2. 읽은 문서
| 문서 | 이 계획에 주는 제약 |
|---|---|
| Codex 공식 문서 — AGENTS.md | 루트에서 cwd 까지 이어 붙임, 합계 기본 32 KiB |
| Codex 공식 문서 — Skills | `.agents/skills/<name>/SKILL.md`, 필수 `name`·`description`, `agents/openai.yaml` 의 `policy.allow_implicit_invocation` |
| Codex 공식 문서 — Hooks, `openai/codex` 의 `pre-tool-use.command.input/output` 스키마·`output_parser.rs`·`apply_patch_tests.rs` | Bash·apply_patch 모두 `tool_input.command` 문자열. 차단은 exit 2 + stderr. **`permissionDecision: "ask"` 미지원** |
| Codex 공식 문서 — Agent approvals & security | `workspace-write` 에서 `.git`·`.agents`·`.codex` 는 읽기 전용 |
| vercel-labs/skills `docs/agents.md` | `-a codex` → `.agents/skills/` |
| Vitest v3 문서 / 최신(v5.1) 문서 | v3: "Vite >=v5.0.0", v5.1: "Vite >=v6.4.0" |
| 기존 `.claude/` 전체, Claude 메모리 | 이식할 규칙·운영 지식 |

## 3. 바뀌는 화면·라우트
없음 — 하네스·문서·테스트 설정만 바꾼다.

## 4. 변경
| 구분 | 내용 |
|---|---|
| 삭제 | `.claude/`(CLAUDE.md·settings·build-state·hooks·phases·HARNESS.md·리뷰어 3개·오케스트레이터 스킬 3개), `harness/review/` |
| 이동(`git mv`) | `.claude/spec/*` → `docs/spec/`, `.claude/rules/{architecture,api-contract,ui-conventions,antipatterns,good-patterns,decisions}.md` → `docs/conventions/`, `.claude/resource/smoke/*.spec.ts` → `tests/e2e/`, `token-lint.mjs`·`token-lint.allow.txt` → `scripts/checks/` |
| 합침·삭제 | `source-of-truth.md` → `docs/spec/00_INDEX.md`, `hooks.md` 삭제 |
| 새로 만듦 | `AGENTS.md`, `.codex/config.toml`, `.codex/hooks/guard-bash.mjs`·`guard-patch.mjs`, `.agents/skills/{write-plan,implement,write-test,verify-ui,commit-push,style-designer}`, 외부 스킬 6개 + `skills-lock.json`, `docs/conventions/testing.md`, `docs/plans/BACKLOG.md`, `scripts/checks/codex-hooks.test.mjs`, `src/test/{setup.ts,render.tsx}`, 단위 테스트 3개 |
| 설정 | `package.json` 스크립트(`typecheck`·`check`·`check:full`·`check:hooks`·`check:tokens`·`test`·`test:watch`), `vite.config.ts` `test` 항목, `playwright.config.ts` `testDir`, README |

## 5. API 계약 영향
없음 — 제품 코드를 바꾸지 않는다.

## 6. 상태 4종
해당 없음 — 화면 변경 없음.

## 7. 문구
해당 없음.

## 8. 고칠 명세
| 파일 | 바꾼 내용 |
|---|---|
| `docs/spec/00_INDEX.md` | 읽기 전용 표시 삭제, `source-of-truth.md` 의 권위·우선순위·멈춤 규칙 합침, "명세를 고칠 때" 절 추가 |
| `docs/conventions/*.md` | `[[이름]]` 힌트 → 상대 링크, 하네스 흐름 문장을 새 흐름으로 교체 |
| `docs/conventions/decisions.md` | D14(하네스 전환) 추가. 지난 결정 본문의 하네스 서술은 이력으로 두고 D14 에서 대체 범위를 명시 |

## 9. 테스트 계획
| 종류 | 파일 | 확인할 동작 |
|---|---|---|
| 단위(Zod) | `src/features/qa/schemas.test.ts` | `fixReportsSchema` 의 준비 완료 4파트·Fail 파일명·중복 파트·음수 거부 |
| 단위(유틸) | `src/shared/lib/formatDate.test.ts` | 빈 값 `-`, 날짜만 있는 값 그대로, Date 형식 |
| 단위(컴포넌트) | `src/features/qa/components/CheckCellButton.test.tsx` | 2차 검수 중 판정 3종 + 변경 이력, 종료 시 변경 이력만, 1차 검수 전 메뉴 차단 |
| 훅 | `scripts/checks/codex-hooks.test.mjs` | 공식 입력 형식 JSON 으로 차단(exit 2)·통과(exit 0) 39건 |
| e2e | `tests/e2e/*.spec.ts`(이동) | 기존 97건 그대로 통과 |

## 10. 확인할 화면 (verify-ui)
| 경로 | 목 데이터 조건 | 볼 것 | 캡처 |
|---|---|---|---|
| `/qa/sprints` | `VITE_USE_MOCK=true`, `gravit_admin_session=true` | agent-browser 로 목 모드 로그인 뒤 화면 캡처 | [qa-sprints-mock.png](assets/20261113-codex-harness/qa-sprints-mock.png) |

## 11. 결정 필요
| # | 질문 | 결정 |
|---|---|---|
| 1 | Vitest 3.2.x 에 보안 권고(tinypool critical 2·@vitest/mocker moderate 1, 개발 의존성. `npm audit` 22 → 25건)가 있다. 수정판 Vitest 4.1.12+ 는 Vite 6+ 가 필요하다 | **3.2.7 유지**, Vite 6+ 업그레이드는 별도 계획서로(사용자 결정 2026-11-13, `BACKLOG.md`) |
| 2 | 하네스 설정 수정을 "사용자 확인"으로 올리는 방식(Codex 가 `ask` 미지원) | 기본 차단 + `GRAVIT_ALLOW_HARNESS_EDIT=1` 세션에서만 허용(구현함) |
| 3 | `.gitignore` 마지막 줄이 `.env.development/RAVVIT_SPEC.md` 로 붙어 두 파일이 무시되지 않음 | **고침** — 두 줄로 분리, `/QA_SPEC.md` 도 추가(사용자 결정 2026-11-13). 두 문서는 git 이력에 없어 추적 해제할 것은 없었음 |

## Deviation Log
| 날짜 | 계획 | 실제 | 이유 |
|---|---|---|---|
| 2026-11-13 | `apply_patch` 훅: `.codex/`·`AGENTS.md`·`.agents/skills/` 수정은 사용자 확인으로 올림 | 기본 차단(exit 2) + 사용자가 `GRAVIT_ALLOW_HARNESS_EDIT=1 codex` 로 연 세션만 허용. 범위를 `.agents/` 전체·하위 `AGENTS.md` 까지 넓힘 | Codex PreToolUse 는 `permissionDecision: "ask"` 를 지원하지 않음(공식 문서, `output_parser.rs`). `.codex`·`.agents` 는 기본 샌드박스에서도 읽기 전용(공식 문서) |
| 2026-11-13 | 훅 matcher `apply_patch` | `^(apply_patch\|Edit\|Write)$` | 공식 문서: apply_patch 는 Edit·Write 로도 매칭됨. 다른 형태 입력(`file_path`)도 처리 |
| 2026-11-13 | Bash 차단 목록 유지 | 계획 목록 + `git clean -f`, `.env` 로의 셸 리디렉션 추가. 일반 `git push` 는 허용(D1) | `git clean -f` 는 git 밖 로컬 문서(`.env.development`, `QA_SPEC.md` 등)를 지움 |
| 2026-11-13 | PostToolUse(선택) | 넣지 않음 | 훅이 파일을 고치면 모델이 가진 내용과 달라져 다음 `apply_patch` 문맥이 어긋날 수 있음. lint 는 `npm run check` 가 맡음 |
| 2026-11-13 | Vitest(버전 미지정) | `vitest@3.2.7` | Vite 5 를 지원하는 마지막 계열(v4 이상은 Vite 6+) |
| 2026-11-13 | jsdom | `jsdom@29.1.1` | jsdom 30 이상은 엔진 범위가 `^22.22.2 \|\| ^24.15.0 \|\| >=26` 이라 현재 Node 25.2.1 에서 벗어남 |
| 2026-11-13 | agent-browser 최신 | `0.41.2` | 최신 0.43.0 은 배포 하루 미만. 공급망 위험을 줄이려 열흘 지난 판 선택 |
| 2026-11-13 | `npx skills add …` | `npx skills@1.7.6 … --copy`, `DISABLE_TELEMETRY=1 DO_NOT_TRACK=1` | CLI 최신 1.8.1 은 이틀 전 배포. 익명 통계 전송을 끔 |
| 2026-11-13 | `shadcn` 출처 `shadcn/ui` | `shadcn-ui/ui` | GitHub 실제 저장소 이름 |
| 2026-11-13 | `style-designer` 그대로 복사 | 본문 그대로 + frontmatter(`name`·`description`) + `allow_implicit_invocation: false` | Codex 스킬은 frontmatter 필수. 해요체·파랑 강조색이 현재 확정 문구·토큰과 달라 일반 작업에 자동으로 끼어들지 않게 함 |
| 2026-11-13 | (계획에 없음) | `commit-push` 도 명시 호출만 | 원격에 게시하는 작업 |
| 2026-11-13 | (계획에 없음) | `docs/plans/BACKLOG.md` | `build-state.json` 의 미완료 TODO 2건(H1·H2)과 사람 확인 항목이 삭제로 사라지지 않게 이관 |
| 2026-11-13 | (계획에 없음) | `npm run check:hooks` | 완료 조건 3(훅 직접 실행)을 반복 가능하게 |
| 2026-11-13 | `check` = typecheck + lint + token-lint | lint 는 기존 `npm run lint`(경고 허용) | 기존 경고 4건(`react-refresh/only-export-components`)을 없애려면 `src/` 를 고쳐야 함 — 범위 밖 |
| 2026-11-13 | (계획에 없음) | `.gitignore` 의 붙은 줄을 `.env.development`·`/RAVVIT_SPEC.md` 두 줄로 분리하고 `/QA_SPEC.md` 추가 | 비밀 값 파일과 로컬 명세 문서가 `git add .` 로 커밋될 수 있었음. 사용자 요청 |
| 2026-11-13 | 루트 `CLAUDE.md` 삭제(있다면) | 없었음. `.claude/CLAUDE.md` 만 있어 `.claude/` 와 함께 삭제 | — |
| 2026-11-13 | e2e 이동 | `qa-response-contract.spec.ts` 의 상대 import 경로를 `../../src/…` 로 수정 | 폴더 깊이가 바뀜 |
| 2026-11-13 | (계획에 없음) | Claude 메모리의 운영 지식(핸드오프 문서 스테이징 금지, 백엔드 계약 위반 처리, dev 서버 고포트, iCloud dataless)을 `AGENTS.md` 8장으로 옮김 | Codex 는 Claude 메모리를 읽지 못함 |

## 검증 결과
| 명령·점검 | 결과 |
|---|---|
| `npm run check` | 통과(exit 0). ESLint 오류 0·기존 경고 4, token-lint OK |
| `npm run check:full` | 통과(exit 0). 기존 500 kB 청크 경고만 |
| `npm run test` | 3 파일 14건 통과. CheckCellButton 잠금 조건을 잠시 깨면 1건 실패하는 것을 확인(레드-그린) |
| `npm run check:hooks` | 39건 통과. 공식 입력 형식 JSON 직접 실행: 강제 푸시·`.env` 수정 exit 2 |
| `npm run test:e2e` | 97건 통과(`tests/e2e`) |
| verify-ui | agent-browser 0.41.2 + Chrome for Testing 157 로 목 모드 `/qa/sprints` 캡처 1장 |

## 사용자 확인 (Codex 에서)
| # | 확인 |
|---|---|
| U1 | 저장소 루트에서 `codex` 실행 → "현재 지침을 요약해 줘"로 `AGENTS.md` 가 읽히는지 |
| U2 | `/skills` 에 자체 스킬 5개 + `style-designer` + 외부 6개가 보이는지 (`commit-push`·`style-designer` 는 명시 호출만) |
| U3 | `/hooks` 에서 프로젝트 훅 2개를 신뢰 승인한 뒤 강제 푸시·`.env` 수정·`AGENTS.md` 수정이 막히는지 |
