# gravit-admin-web — Codex 작업 지침

Gravit 서비스의 **관리자 웹**(React 18 + TypeScript + Vite 5 SPA)입니다. 데스크톱 1280px 이상, 라이트 모드 전용입니다.
스택: TanStack Query · Zustand · React Hook Form + Zod · axios · React Router 7 · Radix(shadcn/ui) · Tailwind 3 · Recharts · MSW · Vitest · Playwright.

## 1. 명령

| 명령 | 내용 |
|---|---|
| `npm run dev` | 개발 서버. 목 데이터는 `VITE_USE_MOCK=true npm run dev` |
| `npm run check` | 타입 검사 + ESLint + token-lint. **구현 완료 전 필수** |
| `npm run check:full` | `check` + `vite build`. **커밋 전 필수** |
| `npm run test` | Vitest 단위 테스트(`src/**/*.test.ts(x)`) |
| `npm run test:e2e` | Playwright + MSW e2e(`tests/e2e/`). 최초 1회 `npm run test:e2e:install` |
| `npm run test:auth` | OAuth·쿠키 세션 검증(`tests/auth/`) |
| `npm run check:hooks` | `.codex/hooks` 훅 입력·차단 검증 |

## 2. 작업 흐름: 계획 → 구현 → 테스트 → 커밋·푸시

| 단계 | 스킬 | 끝나는 조건 |
|---|---|---|
| 계획 | `write-plan` | `docs/plans/PLAN-{YYYYMMDD}-{slug}.md` 작성 → **사용자 승인 전에는 코드를 고치지 않습니다** |
| 구현 | `implement` | 승인된 계획서대로 코드·명세 변경, 계획과 다른 점은 계획서 `Deviation Log`, `npm run check` 통과 |
| 테스트 | `write-test` → `verify-ui` | `npm run test`·`npm run test:e2e` 통과, 바뀐 화면 전후 캡처와 점검표를 계획서에 첨부 |
| 커밋·푸시 | `commit-push` | `npm run check:full` 통과, `main` 에 커밋, **푸시 전 사용자 확인** |

- `src/` 동작을 바꾸는 요청은 `write-plan` 부터 시작합니다. 질문 답변·문서 오타 수정은 계획서 없이 합니다.
- 계획서 1개 = 변경 1개. GitHub 이슈·PR 은 쓰지 않습니다.
- 모든 스킬의 마지막 단계는 `verification-before-completion` 을 따릅니다. 명령 결과를 보기 전에는 "완료·통과"라고 말하지 않습니다.

## 3. 불변 제약

| 영역 | 규칙 (상세 문서) |
|---|---|
| API 계약 | 명세에 없는 엔드포인트·필드·쿼리를 만들지 않습니다. 모든 응답은 Zod 로 파싱합니다. `any`·무검증 캐스팅 금지 ([api-contract](docs/conventions/api-contract.md)) |
| 구조 | `features/{a}` → `features/{b}` 직접 import 금지(`shared` 로 승격). import 는 `@/` 절대경로만 ([architecture](docs/conventions/architecture.md)) |
| 시각 | 색·간격·타이포는 DS-01 토큰만. raw hex·arbitrary 값(`[13px]`) 금지(token-lint). 반응형·다크 모드 코드 금지 ([ui-conventions](docs/conventions/ui-conventions.md)) |
| 라이브러리 | CSS-in-JS·Formik·Redux Toolkit·SWR·moment/dayjs 도입 금지 ([antipatterns](docs/conventions/antipatterns.md)) |
| 주관식 정답 | 단일 객체 `{answerId, content(콤마 String), explanation}` 1개 고정 ([decisions](docs/conventions/decisions.md) D1·D2) |
| 비가역 작업 | 실제 promote, 배포, publish, OAuth 비밀 값 입력, 공유 dev 서버에 쓰는 요청은 코드 구조만 만들고 실행은 사람에게 맡깁니다 |
| 비밀 값 | `.env*` 를 읽어 값을 옮기거나 수정하지 않습니다. 필요한 변수 이름만 알립니다 |
| 명세 | 명세에 없거나 서로 모순이면 추측해 채우지 말고 멈춰 질문합니다(🙋🏻). 우선순위는 [docs/spec/00_INDEX.md](docs/spec/00_INDEX.md) |

## 4. 문서 지도 — 이 경로를 고치면 이 문서를 먼저 읽습니다

명세(`docs/spec/`)와 규칙(`docs/conventions/`)은 자동으로 읽히지 않습니다. `write-plan` 은 아래 표에 맞는 문서를 반드시 읽고 계획서 "읽은 문서"에 적습니다.

| 바꾸는 경로 | 먼저 읽을 문서 |
|---|---|
| (모든 작업) | `docs/spec/00_INDEX.md` · `docs/conventions/decisions.md` 의 관련 D 항목 · `docs/conventions/antipatterns.md` |
| `src/features/*/api.ts` · `schemas.ts` · `src/shared/api/` | `docs/conventions/api-contract.md` · `docs/spec/03_gravit_admin_api_spec.md` 해당 절 |
| `src/features/*/components/` · `src/pages/` | `docs/conventions/ui-conventions.md` · `docs/spec/DS-01_design_system.md` · `DS-02_screens.md`(해당 화면) · `DS-03_interactions.md` · `docs/spec/01_gravit_admin_wireframe_spec.md` 해당 절 |
| 새 파일·폴더, import 구조 | `docs/conventions/architecture.md` |
| 폼·이탈 보호·오류 토스트·쿼리 키 | `docs/conventions/good-patterns.md` · `docs/spec/04_gravit_admin_frontend_spec.md` 해당 절 |
| `src/features/staging/` | `good-patterns.md` STAGING_DETAIL · `01 §6-7` · D1·D2 |
| `src/features/problems/` | D1·D2·D6 |
| `src/features/qa/` · `src/pages/qa/` · `src/mocks/qa*.ts` | D9·D11·D12·D13 (D11 이후가 D9 를 대체), 문구는 `src/features/qa/copy.ts` |
| `src/features/ravvit/` | D8 |
| `src/features/dashboard/` | D7 |
| `src/features/auth/` · 토큰·재발급 | D10 · `api-contract.md` |
| `tailwind.config.ts` · `src/shared/styles/globals.css` | `ui-conventions.md` 명명 매핑 표 · DS-01 |
| `src/**/*.test.ts(x)` · `tests/` · `src/mocks/` | `docs/conventions/testing.md` |

## 5. 외부 스킬 메모

| 스킬 | 이 저장소에서 쓸 때 |
|---|---|
| `vercel-react-best-practices` | Vite SPA 라 `server-*` 규칙, `React.cache()`, hydration(`rendering-hydration-*`), API routes, `next/dynamic`(→ `React.lazy`)은 해당 없음. `client-swr-dedup` 는 TanStack Query 로 대신합니다(SWR 금지) |
| `shadcn` | `components.json` 의 ui 별칭은 `@/shared/components/ui`. SKILL.md 첫 블록의 `` !`npx shadcn@latest info --json` `` 은 다른 에이전트 전용 문법이라 Codex 에서는 자동 실행되지 않습니다. 필요하면 직접 실행합니다. `npx shadcn@latest` 는 네트워크로 최신 CLI 를 받으므로 컴포넌트 추가는 계획서에 적은 뒤 실행합니다 |
| `web-design-guidelines` | 실행할 때마다 GitHub 에서 최신 가이드라인을 받습니다(네트워크 필요) |
| `agent-browser` | 첫 사용 전 `agent-browser skills get core` 를 읽습니다. 세션 이름을 붙여 씁니다(`verify-ui` 참고) |
| `review-animations` | 모션을 바꾼 작업에서만 `verify-ui` 가 호출합니다 |
| `style-designer` | 스타일 개편 실험용 페르소나. 명시 호출만 합니다. 확정된 결정(QA 문구 F절, DS-01 Primary 등)과 다르면 계획서 "결정 필요"로 올립니다 |

## 6. 훅·샌드박스

- `.codex/config.toml` 의 PreToolUse 훅 2개: `guard-bash.mjs`(강제 푸시·`reset --hard`·`clean -f`·광범위 `rm -r`·배포·publish·`curl | sh`·`.env` 쓰기 차단), `guard-patch.mjs`(`.env*` 차단, `AGENTS.md`·`.codex/`·`.agents/` 수정 차단).
- 훅은 `/hooks` 에서 신뢰 승인해야 실행됩니다. 바꾸면 다시 승인합니다.
- 하네스 설정을 고쳐야 하면 바꿀 내용을 사용자에게 보여 주고 멈춥니다. 사용자가 승인하면 `GRAVIT_ALLOW_HARNESS_EDIT=1 codex` 로 연 세션에서만 고칩니다.

## 7. git

- `main` 에 직접 커밋·푸시합니다. 커밋 타입은 `feat`·`fix`·`docs`·`chore`·`test` 다섯 가지뿐입니다(`commit-push`).
- 파일을 지정해 스테이징합니다. `git add -A`·`git add .` 금지.
- 다음은 의도적으로 git 밖에 둔 로컬 문서라 스테이징하지 않습니다: `.env.development`, `QA_SPEC.md`, `RAVVIT_SPEC.md`, 루트 핸드오프 문서(`BACKEND_ADMIN_API_SPEC.md`, `PROMPT_*.md`, `INTEGRATION_REPORT.md`).

## 8. 운영 메모

- **백엔드가 계약을 어기면** 프론트를 억지로 맞추지 않습니다. 현상·명세 근거·필요 조치를 `INTEGRATION_REPORT.md` 또는 계획서에 적고 다음 작업으로 넘어간 뒤 최종 보고에서 알립니다.
- **목 ↔ 실서버**: `VITE_USE_MOCK` 미설정이면 실서버, `true` 면 MSW. e2e 는 Playwright 설정이 목을 강제합니다. 실 dev 백엔드는 같은 이름의 DTO 때문에 OpenAPI 스키마가 틀린 곳이 있어 **라이브 응답이 기준**입니다.
- **dev 서버를 직접 띄울 때**: `lsof -nP -iTCP -sTCP:LISTEN` 으로 점유 포트를 보고, 47000번대 같은 고포트에 `--host 127.0.0.1 --strictPort` 로 띄운 뒤, 확인이 끝나면 바로 종료합니다(사용자가 SSH 포트 포워딩 중일 수 있습니다).
- **명령이 출력 없이 멈추면**: 저장소가 iCloud 동기화 폴더 아래라 `node_modules` 가 내려갔을 수 있습니다. `find node_modules -dataless | wc -l` 로 확인하고, 많으면 사용자 승인 후 `rm -rf node_modules && npm ci`.

## 9. 응답 방식

- 한국어 존대체, 표 중심으로 씁니다.
- 추측하지 않습니다. 모르는 것은 "정확하게 알지 못합니다"라고 쓴 뒤 🙋🏻 로 묻습니다.
- 완료를 보고할 때는 실행한 명령과 결과(통과 수·exit code)를 함께 적습니다.
