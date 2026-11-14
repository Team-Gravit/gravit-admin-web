# PLAN-20261113-style-preparation: T1 단계 0 — 실험 준비

| 항목 | 내용 |
|---|---|
| 상태 | 커밋됨 (2026-11-14) — 사용자 커밋·푸시 승인 |
| 요청 | 사용자 세션 T1 단계 0. T0 원격 반영 확인, 실험 브랜치 분리, 목 로그인·전체 화면 접근 확인 |
| 범위 밖 | 제품 코드·테스트·토큰·기존 명세 변경, 커밋·푸시·머지, 실제 서비스 변경 요청 |

## 1. 목적

스타일 실험을 `main`과 분리하고, 실제 서비스에 쓰기 요청을 보내지 않고 화면을 관찰할 수 있는지 확인해요. 단계 1의 화면 감사와 이후 사람 확인 1·2의 전제 조건을 기록해요.

## 2. 읽은 문서

| 문서 | 절 | 이 계획에 주는 제약 |
|---|---|---|
| 사용자 T1 요청 | 단계 0·진행 단계·범위 | `experiment/style-refresh`에서만 작업, 각 단계 별도 계획, 사람 확인 1·2에서 정지 |
| `AGENTS.md` | 2~8 | 계획 승인 관문, `.env*` 열람·수정 금지, 고포트·strictPort 사용·서버 정리 |
| `docs/spec/00_INDEX.md` | 전체 | 최신 D 결정 우선, 오래된 16화면 문서를 현재 전체 라우터와 대조 |
| `docs/conventions/decisions.md` | D1·D2·D4·D5·D6·D7·D8·D10·D11~D14 | 주관식 단일 정답, OAuth 목 세션, 추가 화면·QA 최신 계약, T0 작업 흐름 |
| `docs/conventions/antipatterns.md` | 전체 | 계약·라우트·코드를 바꾸지 않는 사전 점검 |
| `docs/conventions/architecture.md` | 전체 | 기존 앱·공용 컴포넌트·목 핸들러 위치 조사 |
| `docs/spec/DS-02_screens.md` | 화면 목록 | 기본 16화면의 접근 경로 |
| `.agents/skills/style-designer/SKILL.md` | 전체 | P·W·V·M 근거와 감사 → 방향 → 샘플 → 확산 → 검증 순서 |
| `.agents/skills/write-plan/SKILL.md` | 전체·템플릿 | 다음 단계의 구체 계획을 승인받고 실행 |
| `.agents/skills/verify-ui/SKILL.md` | 1~3·완료 | 목 서버, 이름 있는 브라우저 세션, 캡처 직접 확인, 종료 |
| `.agents/skills/agent-browser/SKILL.md` 및 CLI core·commands | 세션·대기·네트워크·캡처 | 독립 세션과 의미 있는 준비 조건, Ravvit health 임시 응답 |
| `.agents/skills/verification-before-completion/SKILL.md` | 전체 | 실제 명령 결과와 캡처를 근거로 기록 |

조사한 코드: `src/app/main.tsx`·`router.tsx`, `src/features/auth/store.ts`, `src/mocks/browser.ts`·`handlers.ts`·`qaHandlers.ts`, `src/features/ravvit/api.ts`·`schemas.ts`·`components/`, `src/pages/AppShell.tsx`, `src/shared/components/layout/MainLayout.tsx`, `tests/e2e/qa-flow-v2.spec.ts`.

## 3. 바뀌는 화면·라우트

없음 — 화면 접근만 확인했어요. DS-02의 16화면과 이후 추가된 문의 2·Ravvit 1·QA 6화면, 합계 25화면을 점검했어요. OAuth 콜백과 QA 상세 index는 화면을 추가하지 않고 기존 흐름으로 유지해요.

## 4. 코드 변경 (스키마 → API → 훅 → 컴포넌트 → 페이지 → 라우트 순)

없음 — 브랜치만 생성했으며 파일 변경은 계획서와 준비 증빙뿐이에요.

| 파일·대상 | 단위 | 변경 내용 |
|---|---|---|
| Git 브랜치 | `experiment/style-refresh` | `main`의 `fd83538bc640e62cc1bed5a17ddc4657e3de421b`에서 생성 |
| 이 계획서 | 문서 | 사전 점검 근거와 제한 기록 |
| `docs/plans/assets/20261113-style-preparation/` | PNG 2장 | QA 1차 체크리스트 준비 증빙, 단계 1 전체 before 캡처와 구분 |

## 5. API 계약 영향 (`docs/spec/03_gravit_admin_api_spec.md`, 별도 서비스는 해당 D 항목)

없음 — API 함수·데이터 흐름·Zod·인증을 고치지 않았어요.

Ravvit에는 MSW 핸들러가 없어요. 브라우저 세션에서만 `**/health`를 `{status:"ok",model:"mock-model",tools:[],auth:"mock"}`로 가로챘어요. D8-2와 `healthResponseSchema`의 기존 형태를 사용했으며 실제 서버 응답을 검증했다는 뜻은 아니에요. 대화 전송은 하지 않았어요. 세션을 닫아 임시 응답도 정리했어요.

## 6. 상태 4종

| 상태 | 조건 | 화면 동작 |
|---|---|---|
| 로딩 | 최초 앱·MSW·데이터 준비 | 기존 동작 유지, 필요한 화면 문구나 입력값이 나타난 뒤 확인 |
| 빈 상태 | Ravvit 새 대화 | 임시 health 응답 후 추천 질문·입력창 활성 확인, 전송하지 않음 |
| 오류 | 접근 실패·목 누락 | 제품 코드를 수정하지 않고 원인과 다음 단계의 준비 방법 기록 |
| 정상 | 목 세션과 기본 fixture | DS-02 16화면·추가 9화면의 핵심 내용 표시 확인 |

## 7. 문구

변경 없음 — 기존 문구를 대기 조건으로만 사용했어요. QA 문구의 근거는 `src/features/qa/copy.ts`예요. 코드·ID·상태 원문은 그대로 유지해요.

## 8. 고칠 명세

없음 — 준비 단계에서는 기존 DS와 확정 결정을 변경하지 않아요. 새로운 시각 토큰·문구 규칙과 기존 결정의 대체 범위는 단계 2 계획·사람 확인 1에서 다뤄요.

## 9. 테스트 계획

| 종류 | 파일 | 확인할 동작 |
|---|---|---|
| 단위(Vitest) | 기존 `src/**/*.test.ts(x)` | 변경 없음·미실행 — 제품 코드 변경이 없는 준비 점검 |
| e2e(Playwright + MSW) | 기존 `tests/e2e/` | 변경 없음·미실행 — agent-browser로 직접 화면 접근 확인 |
| 목 핸들러 | `src/mocks/handlers.ts`·`qaHandlers.ts` | 읽기만, 기존 fixture 사용 |
| 브라우저 | 이름 있는 독립 세션 | 목 세션으로 보호 라우트 진입·25화면 핵심 내용 확인 |

## 10. 확인할 화면 (verify-ui)

| 경로 | 목 데이터 조건 | 볼 것 | 전 캡처 | 후 캡처 |
|---|---|---|---|---|
| `/login` | 로컬 목 모드, 초기 세션 없음 | 로그인 화면과 OAuth 버튼 표시 | 없음 — 접근 확인 | 해당 없음 |
| DS-02 15개 보호 화면 | `gravit_admin_session=true`, 기본 fixture | 목록·상세·폼 핵심 내용 표시 | 없음 — 단계 1에서 전체 기록 | 해당 없음 |
| `/inquiries`, `/inquiries/5001` | 기본 목 문의 | 목록과 상세 내용 | 없음 — 단계 1에서 전체 기록 | 해당 없음 |
| `/ravvit` | 브라우저 health 임시 응답 | 새 대화와 입력 활성, 메시지 전송 없음 | 없음 — 단계 1에서 전체 기록 | 해당 없음 |
| `/qa/sprints`·9번 상세의 5개 탭 | 기본 QA fixture | 목록·연결·디자인·1/2차·수정사항 접근 | 아래 준비 증빙 | 해당 없음 |
| `/qa/sprints/9/checklist/1` | 1280×900·1440×900, 모든 검수 완료 fixture | 셸·탭·진행도·체크리스트 표시 | [1280](assets/20261113-style-preparation/qa-first-1280.png) · [1440](assets/20261113-style-preparation/qa-first-1440.png) | 해당 없음 |

## 11. 결정 필요

현재 준비 작업에는 없음. 단계 1은 [별도 계획서](PLAN-20261113-style-audit.md) 승인 후 실행해요. 전체 before 캡처나 감사 완료를 주장하지 않아요.

## Deviation Log

| 날짜 | 계획 | 실제 | 이유 |
|---|---|---|---|
| 2026-11-13 | 목으로 모든 화면 접근 확인 | Ravvit에만 브라우저 health 임시 응답 사용 | 기존 MSW가 Ravvit health·chat을 제공하지 않음. 제품·목 핸들러 변경 없이 초기 화면 확인 |
| 2026-11-13 | 스테이징 레슨 제목을 본문 텍스트로 대기 | 최초 대기 exit 1·25초 timeout, 입력값 조건으로 재확인 exit 0 | 레슨 제목은 input.value여서 텍스트 대기로는 확인할 수 없음. 화면 오류가 아니며 snapshot과 값으로 확인 |

## 검증 결과

| 명령·점검 | 결과 |
|---|---|
| `git ls-remote origin refs/heads/main` | exit 0, `fd83538bc640e62cc1bed5a17ddc4657e3de421b` — 로컬 HEAD·origin/main과 일치 |
| `git switch -c experiment/style-refresh` | exit 0, 요청한 브랜치 생성 |
| `VITE_USE_MOCK=true node_modules/.bin/vite --host 127.0.0.1 --port 47173 --strictPort` | ready, 로컬 서버 시작. 확인 뒤 SIGINT로 종료(exit 130은 의도한 종료) |
| `agent-browser --session style-t1-97d832c2c5e9 …` | 25화면 진입 확인. 스테이징 대기 조건 오류 1건은 위 기록대로 재확인 |
| Ravvit health 임시 응답·`wait --fn` | exit 0, textarea.disabled=false 확인 |
| `screenshot`·`view_image` | 1280×900·1440×900 PNG 2장 저장·직접 열람 |
| `agent-browser … close` | exit 0, 독립 브라우저 종료 |
| `lsof -nP -iTCP:47173 -sTCP:LISTEN` | 출력 없음 — 점검 서버 포트 해제 |
| `npm run check`·`test`·`test:e2e`·`check:full` | 미실행 — 제품 코드 변경 없음. 전체 회귀 통과를 의미하지 않음 |
| verify-ui 점검표 | 준비 화면 열람만 수행. 전체 감사·접근성·모션 리뷰는 해당 단계에서 수행 |

## 자기 점검

- [x] 명세에 없는 엔드포인트·필드·쿼리 없음
- [x] 상태 4종 각각 화면 동작이 적혀 있음
- [x] 문구가 기존 문구 체계와 맞음 — 제품 문구 변경 없음
- [x] `features` 간 직접 import 없이 구현 가능 — 코드 변경 없음
- [x] 테스트 계획에 단위·e2e와 목 핸들러 변경 여부가 있음 — 모두 변경 없음
- [x] 확인할 화면 목록이 있음
