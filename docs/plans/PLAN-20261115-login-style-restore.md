# PLAN-20261115-login-style-restore: 로그인 화면을 T1 개편 전 디자인으로 복원

| 항목 | 내용 |
|---|---|
| 상태 | 커밋됨 (2026-11-15) — 사용자 커밋·푸시·main 반영 승인 |
| 요청 | 2026-11-15: 로그인 페이지를 이번 스타일 수정 전 버전으로 원복 |
| Git 승인 | 2026-11-15 사용자 “커밋 푸시 머지까지 ㄱㄱ” — main에 두 변경을 나누어 커밋·푸시 |
| 복원 기준 | T1 직전 `fd83538bc640e62cc1bed5a17ddc4657e3de421b`의 로그인 소스·토큰과 기존 before 캡처 |
| 범위 | 로그인 일러스트·제공자 로고/브랜드 버튼·배경/글자/모서리/그림자·오류 문구 복원 |
| 범위 밖 | OAuth/state/쿠키/권한/API·다른 관리자 화면·커밋/푸시·기존 접근성 별도 과제 |

## 1. 목적

사용자가 원하신 개편 전 로그인 디자인을 되살립니다. 왼쪽 우주 일러스트와 Google·카카오·네이버 브랜드 버튼을 기존 자산으로 복원합니다. 원본은 [1440px](../experiments/style/before/login-normal-1440.png)·[1280px](../experiments/style/before/login-normal-1280.png)입니다.

로그인 파일만 되돌리면 전역 T1 색·글자·모서리가 남습니다. 따라서 로그인 레이아웃 안에만 원래 토큰을 적용하고 다른 화면의 T1은 보존합니다. 흰 테이블 헤더의 미커밋 결과·D17·계획/캡처 및 기존 미추적 복제731개를 보존합니다. 전체 커밋 revert나 과거 globals.css 덮어쓰기는 하지 않습니다.

## 2. 읽은 문서

| 문서 | 절 | 이 계획에 주는 제약 |
|---|---|---|
| AGENTS·write-plan·00_INDEX·antipatterns | 승인·시각·우선순위 | 계획 승인 전 코드/명세 변경 없음, 토큰으로 복원 |
| decisions | D5·D10·D15·D16·D17 | 로그인 브랜드 예외 재적용 제안, 최신 인증·흰 헤더 보존 |
| ui-conventions·DS-01 | 명명·토큰·라이트/데스크톱 | 전역 토큰 대신 로그인 범위·명명 토큰만 추가 |
| DS-02 §1·DS-03 §5-1·01 §4-1 | 로그인 표시·상호작용 | 문서의 옛400px 단일 카드보다 D5의 실제2열 구현을 복원 기준으로 사용 |
| DS-STYLE-01 §8/9/단계5E·DS-STYLE-02 §13 | H2 | 승인 후 H2의 로그인 시각 부분만 대체, 과거 증거 보존 |
| api-contract·good-patterns·04 인증 절·D10 | 인증 | 오래된 idToken/refresh 예시로 회귀하지 않음 |
| architecture·testing·기존 로그인 계획 | 경계·검증 | shared에서 auth import 없음, 기존 기능 회귀 유지 |
| LoginPage·LoginLayout·OAuthButtons·auth api/hooks/schemas·router·handlers·단위/e2e/auth 테스트 | 실제 흐름 | 제공자 id/순서·잠금·분기·계약 그대로 |

Figma는 새로 필요하지 않습니다. Git 원본과 당시 캡처를 디자인 입력으로 사용합니다.

## 3. 바뀌는 화면·라우트

| 라우트 | 화면 | 변경 |
|---|---|---|
| /login, ?error=forbidden/failed | 로그인 | 원래 일러스트·3브랜드 버튼·시각·오류 문구 |
| /login/oauth2/code/:provider | 기존 콜백 | 공유 LoginLayout의 원래 색 범위만 상속, 인증 처리/이동 동일 |
| /users 등 관리자 화면 | 회귀 확인 | 기존 T1·흰 표 머리 그대로 |

## 4. 코드 변경 (스키마 → API → 훅 → 컴포넌트 → 페이지 → 라우트 순)

| 파일 | 단위 | 변경 내용 |
|---|---|---|
| schemas/api/hooks/store/oauthState/router·OAuthCallbackPage | 인증 | 변경 없음 |
| src/shared/styles/globals.css | 로그인 범위 `.login-theme` | 원본 HSL 값의 page/foreground/fg-secondary/muted-foreground/border/ring/destructive/brand-*·radius만 이 범위에서 재정의. surface 흰색·전역값·table-header 유지. inherited 기본 글자는 원본 text-base |
| tailwind.config.ts | 로그인 명명 토큰 | `login-h1`24/32·`login-caption`12/16·`rounded-login-provider`12를 원본 값으로 정의. 기존 h1/caption/xl 및 다른 역할 유지 |
| src/shared/components/layout/LoginLayout.tsx | 범위 지정 | 기존 레이아웃에 login-theme 연결. 전역 body 변경 없음 |
| src/features/auth/components/OAuthButtons.tsx | 표시 | 기존3SVG·브랜드 클래스·native button 형태 복원. 높이56/간격12·18/28/500 글자·원본 hover opacity/disabled50·focus ring 유지. 현재 즉시 피드백 유지, 진입/반복 모션 추가 없음 |
| src/pages/login/LoginPage.tsx | 표시 | 기존 일러스트·2열/폭1024·패딩/간격·shadow-sm·카드8 복원. 원본 글자 토큰 적용. 기존 명시 이미지 치수는 유지/원본 intrinsic 치수로 지정해 레이아웃 변동 방지 |
| tests/e2e/style-login.spec.ts | 기존 기대 | 중립/로고0 기대를 원래 일러스트·로고3으로 갱신. 정상/오류/2폭/56높이/순서/포커스/잠금 회귀 유지 |
| tests/auth/oauth.spec.ts | 기존 기대 | 권한 오류 문구만 원본으로, 시나리오/요청/세션 검증 유지 |

기존 자산을 재사용하며 다운로드·새 의존성·새 제품 이미지 생성은 없습니다. 사용하지 않는 login-panel 구조 토큰을 지우는 정리는 하지 않습니다.

## 5. API 계약 영향

없음 — D10의 login-url+dest·code/state·HttpOnly 쿠키·토큰 재발급·ADMIN 게이트를 유지합니다. 실제 OAuth나 공유 서버 요청 없이 목 및 로컬 가짜 백엔드로 검증합니다.

## 6. 상태 4종

| 상태 | 커밋됨 (2026-11-15) — 사용자 커밋·푸시·main 반영 승인 |
|---|---|---|
| 로딩 | 기존 login-url isPending | 3제공자 disabled, 원래 비활성 표시 |
| 빈 상태 | 입력/응답 없음 | 별도 폼·새 빈 상태 없음, 기존 제공자 선택 화면 |
| 오류 | error 쿼리/요청 실패 | 기존 예약 영역과 분기를 유지하고 원래 문구로 표시 |
| 정상 | 초기/성공 | 원래3버튼, 선택하면 기존 OAuth·콜백·대시보드 이동 |

## 7. 문구

| 위치 | 복원 문구 | 근거 |
|---|---|---|
| 권한 오류 | 백오피스 접근 권한이 없습니다. | fd83538 LoginPage |
| failed 쿼리/unknown fallback | 로그인에 실패했습니다. 다시 시도해주세요. | 같은 원본 |
| login-url 요청 오류 | 로그인에 실패하였습니다. | 같은 원본 |
| 제목·제공자 | Gravit/Admin Page·백오피스 로그인·내부 운영자 전용 관리 시스템·Google/카카오/네이버로 시작하기 | 원본과 현재 동일 |

## 8. 고칠 명세

| 파일 | 절 | 바꿀 내용 |
|---|---|---|
| docs/conventions/decisions.md | 새 D18 | 승인 시 로그인 한정 D5 시각 재적용, D15 H2만 대체. D10·D17 보존. 원본 브랜드 대비 한계 명시 |
| docs/spec/DS-STYLE-01_foundations.md | 로그인 brand 매핑·H2/단계5E | 원본은 역사 기록, 현재 로그인 범위는 이전 값 복원. 전역 T1 값 유지 |
| docs/spec/DS-STYLE-02_components.md | §13 | 실제 일러스트·브랜드 버튼·원래 글자/모서리/그림자·문구 규칙 |
| docs/conventions/ui-conventions.md | 로그인 예외/명명 | 로그인 범위 토큰과3개 치수 명칭·일반 화면 금지 |

기존 T1 계획·REPORT·전후 이미지는 당시 기록으로 보존합니다.

## 9. 테스트 계획

| 종류 | 파일·명령 | 확인할 동작 |
|---|---|---|
| 단위 | 기존 OAuthButtons.test.tsx, npm run test |3제공자 이름/순서/id·disabled 콜백 차단. CSS를 복사하는 테스트 추가 없음 |
| e2e | style-login.spec.ts, npm run test:e2e |일러스트/아이콘 복원·2열/56px·오류·포커스·대기 잠금 및 기존 전체 목 회귀 |
| 인증 | tests/auth/oauth.spec.ts, npm run test:auth |3제공자·state/만료/1회 소비·쿠키·권한·재발급. 문구 외 기존 계약 유지 |
| 목 핸들러 | 기존 handlers·auth 테스트 로컬 서버 | 변경 없음. UI 상태는 브라우저 한정 GET 대기/실패로 재현 |
| 게이트 | npm run check, check:full | 타입·ESLint·token-lint·빌드 |

## 10. 확인할 화면 (verify-ui)

| 경로 | 목 조건 | 볼 것 | 전 캡처 | 후 캡처 |
|---|---|---|---|---|
| /login | 정상1280/1440×900 | 원본 일러스트/버튼/배경·카드/글자/모서리/그림자·넘침 | [1280](assets/20261115-login-style-restore/before/normal-1280.png) · [1440](assets/20261115-login-style-restore/before/normal-1440.png) | [1280](assets/20261115-login-style-restore/after/normal-1280.png) · [1440](assets/20261115-login-style-restore/after/normal-1440.png) |
| /login?error=forbidden/failed | 기존 오류 | 원래 문구·예약 영역·배치 | [목록](assets/20261115-login-style-restore/before/manifest.json) | [1280 상태](assets/20261115-login-style-restore/states-1280-2.png) · [1440 상태](assets/20261115-login-style-restore/states-1440-2.png) |
| /login | login-url GET 대기/실패 | 잠금/실패 표시·해제 | [목록](assets/20261115-login-style-restore/before/manifest.json) | [후 목록](assets/20261115-login-style-restore/after/manifest.json) |
| /login | 키보드·reduced | 포커스 식별·정적인 화면 | [목록](assets/20261115-login-style-restore/before/manifest.json) | [후 목록](assets/20261115-login-style-restore/after/manifest.json) |
| /users | 기존 목 로그인 | page/white table-header/글자/치수에 로그인 범위 누출 없음 | [전](assets/20261115-login-style-restore/before/manifest.json) | [측정](assets/20261115-login-style-restore/regression-evidence.json) |

목 고포트127.0.0.1·명명 agent-browser를 쓰고 종료합니다. 최신 web-design-guidelines로 변경 파일을 점검합니다. 모션 변경이 생길 때만 review-animations를 적용합니다.

원본과 비교하는 색 값은 댓글 HEX보다 실제 fd83538 HSL/computed 값을 기준으로 합니다. 원본 네이버 흰 글자/초록 배경 대비는 약2.8:1로 현재 일반 글자4.5:1 기준에 미달합니다. 원본을 그대로 복원하는 경우 이 한계를 명시하며 AA 통과로 보고하지 않습니다. 브랜드 색을 임의로 바꾸지 않습니다.

## 11. 결정 필요

| # | 질문 | 선택지 | 추천 |
|---|---|---|---|
|1|2026-11-15 사용자 “고고!”로 원본 디자인 복원 승인|원본 디자인 복원|네이버 원래 대비 한계를 기록하고 보정은 별도 범위로 둡니다|

## Deviation Log

| 날짜 | 계획 | 실제 | 이유 |
|---|---|---|---|
|2026-11-15|원본 조사·계획 우선|코드 전 조사/계획 작성 후 사용자 “고고!”로 승인|사용자 승인 관문|
|2026-11-15|기존 전체 목e2e 설정|기존 설정을 가져온 /tmp 임시 config로127.0.0.1:47174·reuseExistingServer=false 사용|5173에 이미 실행 중인 다른 서버가 있어 재사용하지 않음. 테스트/목 조건은 동일|

## 검증 결과

| 명령·점검 | 결과 |
|---|---|
| Git 원본·자산 | fd83538와 현재 diff 확인, 원래1440 캡처 직접 열람. 일러스트/제공자SVG 보존 확인 |
| 미커밋 보존 | 흰 표 머리·D17·관련 계획/증거 및 기존 미추적761개 크기/mtime 변경0. 스테이징/커밋/푸시0 |
| 계획서 | 필수11절·파일·증거 링크 확인(exit0) |
| npm run check | exit0 — 타입·ESLint 오류0/기존 경고6·token-lint OK |
| npm run test | exit0 — 22파일78개 통과·실패0. [로그](assets/20261115-login-style-restore/verification/test.txt) |
| npm run test:e2e (임시 config) | exit0 — 전체 목133개 통과·실패0. 기존5173 재사용 없이47174. [로그](assets/20261115-login-style-restore/verification/e2e.txt) |
| npm run test:auth | exit0 — 로컬 인증17개 통과·실패0. [로그](assets/20261115-login-style-restore/verification/auth.txt) |
| 레드→그린 | 원본 로고 기대가 구현 전2조건 실패(exit1), 구현 후 동일2조건 포함133개 통과. [레드](assets/20261115-login-style-restore/verification/red.txt) |
| npm run check:full | exit0 — 타입·ESLint 오류0/기존 경고6·token-lint·빌드. 기존 Browserslist/큰 chunk 경고 유지. [로그](assets/20261115-login-style-restore/verification/check-full.txt) |
| verify-ui | 원본 정상2폭 픽셀 차이0. 전후28 PNG+비교/상태6 PNG 직접 열람·로그인14/users2조건 확인. [측정](assets/20261115-login-style-restore/regression-evidence.json)·[점검표](assets/20261115-login-style-restore/README.md#ui-점검) |
| 서버/브라우저 | 명명 브라우저 종료exit0·수동47173 서버SIGINT130. 테스트47174/5174/5175 종료 확인, 기존5173 서버 보존 |
| 웹/모션 | [최신 웹 점검](assets/20261115-login-style-restore/web-review.md)·[모션 Approve](assets/20261115-login-style-restore/motion-review.md). 원래 접근성/네이버 대비 한계 명시 |

| 커밋 전 최종 게이트 | npm run check:full exit0·오류0/기존 경고6·token-lint·빌드. [로그](assets/20261115-login-style-restore/verification/commit-check-full.txt). 마지막 단위/e2e/인증 검증 이후 코드 변경 없음 |

## 자기 점검

- [x] 명세에 없는 엔드포인트·필드·쿼리 없음
- [x] 상태4종 각각 화면 동작 있음
- [x] 문구는 요청하신 원본을 기준으로 복원
- [x] features 간 직접 import 없음
- [x] 단위/e2e/인증·목 변경 여부 계획 있음
- [x] 경로·목 조건·전후 화면 목록 있음
