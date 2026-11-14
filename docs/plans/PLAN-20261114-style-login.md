# PLAN-20261114-style-login: T1 단계5E — 로그인 H2

| 항목 | 내용 |
|---|---|
| 상태 | 커밋됨 (2026-11-14) — 사용자 커밋·푸시 승인 |
| 목적 | 승인된 중립 제공자 UI·왼쪽 중립 면/Gravit 식별자(V1·V2·V7·V10) |
| 범위 밖 | 인증·state·쿠키·권한·라우트·제공자 이름/순서/콜백·2열 위치/폭·새 의존성·git 실행 |

## 1. 읽은 문서

AGENTS·NEXT_SESSION_PROMPT·STAGE5·00_INDEX·decisions D10/D15·antipatterns·architecture·api-contract·testing·ui-conventions·good-patterns·DS-01 명명·DS-02 §1·DS-03·DS-STYLE-01/02·01 §4-1·04 §7(인증은 D10이 대체)·LoginPage/OAuthButtons/hooks/api/oauthState·tests/auth/oauth.spec.ts·playwright.auth.config.ts. 새 Figma 대신 승인 H2·기존 before와 실제 2열 소스를 기준으로 해요.

## 2. 바뀌는 화면

| 경로 | 변경 | 보존 |
|---|---|---|
| /login | 제공자 로고/브랜드 면을 같은 중립 텍스트 버튼으로·왼쪽 일러스트를 중립 면/기존 Gravit 로고로·고정 카드 그림자 제거 | 50%씩 2열·max-w-5xl·오른쪽 px12/py16/gap16·버튼56px/간격12·이름/순서/인증 |

## 3. 코드 변경

| 순서·파일 | 단위 | 변경 |
|---|---|---|
| schemas/api/hooks/router/store | 인증 | 변경0 |
| OAuthButtons.tsx | 표시 | 기존 Button outline 재사용(h-14), provider id/label만 유지. 기존3아이콘 import/brand class 제거, bg-surface·border-input·control8·본문14/22·즉시 hover/focus·기존 disabled |
| LoginPage.tsx | 표시 | 왼쪽 bg-page·기존 로고 중앙, 원래 자리/폭·오른쪽 구조 유지. 기존 그림/아이콘 파일 삭제0. 고정 면 shadow 제거 |
| OAuthButtons.test.tsx | 단위 |3제공자 콜백 값·disabled·이름/순서 |
| tests/auth/oauth.spec.ts | 문구 기대만 | 원래 전체 인증 시나리오 유지 |
| style-login.spec.ts | e2e |2폭·3버튼/56높이·오류·GET 대기 잠금/실패·키보드 초점 |

왼쪽 원본 이미지의 intrinsic 비율559/720이 카드 높이를 결정하므로 `--login-panel-ratio`와 `aspect-login-panel` 이름으로 같은 비율을 유지해요. globals.css·tailwind.config.ts·DS-STYLE-01에 구조 값만 연결해요. 새 크기/팔레트나 public props 의미 변경은 없어요(P5).

## 4. API 계약 영향

없어요. D10의 GET login-url+dest, state 저장/검증, POST code/state, 쿠키/공유 reissue·ADMIN 게이트를 바꾸지 않아요(P5). 실제 OAuth/비밀 입력 없이 tests/auth의 로컬 가짜 백엔드로 회귀해요.

## 5. 상태 4종

| 상태 | 표현 |
|---|---|
| 정상/빈 입력 | 기존3제공자, 별도 필드/빈 상태 추가 없음 |
| 로딩 | 기존 startOAuth.isPending에서3버튼 disabled. 새 spinner/문구/연출 추가 없음 |
| 오류 | 기존 error query/unknown fallback/startOAuth.isError 분기 유지, 고정 FE 문구만 해요체 |
| 성공 | 기존 loginUrl 이동/state 저장, 같은 인증 콜백 |

## 6. 문구

| 현재 → 변경 | 근거 |
|---|---|
| 백오피스 접근 권한이 없습니다. → 백오피스 접근 권한이 없어요. | W1·기존 뜻 |
| 로그인에 실패했습니다. 다시 시도해주세요. → 로그인하지 못했어요. 다시 시도해 주세요. | W1·W6 |
| 로그인에 실패하였습니다. → 로그인하지 못했어요. 다시 시도해 주세요. | 같은 오류 안내 |

Google로 시작하기·카카오로 시작하기·네이버로 시작하기·Gravit/Admin Page·제목/보조 문구는 유지해요(W11).

## 7. 고칠 명세

DS-STYLE-02에 H2 실제 구현·DS-STYLE-01 기존 브랜드 alias 미사용/호환 유지·REPORT/STAGE5/이 계획에 증거를 적어요. 구 DS 삭제0.

## 8. 테스트 계획

단위 제공자 전달/잠금, 전체 Vitest·목e2e·check:full. 별도 `npm run test:auth`의 기존18개 시나리오로 OAuth/쿠키/state/401/403 회귀. 테스트 수는 실행 결과를 기준으로 기록해요.

## 9. 확인할 화면 (verify-ui)

| 경로·조건 | 확인 | 전 → 후 |
|---|---|---|
| /login 정상 |1280/1440×900·2열/버튼/카드 위치·focus | 기존 before/login + baseline-extra/login → after/login |
| ?error=forbidden/failed | 기존 예약 영역/문구·넘침 | baseline-extra/login → after/login |
| login-url GET hold/error |3버튼 잠금/복원·오류 | baseline-extra/login → after/login |
| reduced/키보드 | 정적 UI·focus ring | 같은 자리·모션0·after/login |

최신 web-design-guidelines·review-animations로 바뀐 두 컴포넌트와 transition-opacity 제거를 점검해요. 완료 후 브라우저/고포트 서버 종료.

## 10. 결정 필요

없어요. 승인 H2 안의 표시 변경이며 새 props/의존성/경계가 필요하면 먼저 질문해요.

## Deviation Log

| 날짜 | 계획 | 실제·이유 |
|---|---|---|
|2026-11-14|계획 먼저|연속 진행 승인으로 코드 전 작성|

## 검증 결과

| 명령·점검 | 결과 |
|---|---|
|check:full·test·test:e2e·test:auth|구현 후 기록|
|verify-ui|구현 후 실제 캡처/위치·최신 웹/모션 점검표|

## 자기 점검

- [x] 계약/제공자 이름·권한 불변
- [x]4상태·테스트/목·경로/전후 목록 있음
- [x]새 폴더 의존성/feature 직접 import 없음

### 실제 검증·verify-ui

| 점검 | 결과·처리 |
|---|---|
| check:full | exit0·타입/ESLint0오류/기존4경고·token/build. 기존 Browserslist/큰chunk 경고 |
| Vitest |20파일69개 통과·실패0·exit0. 제공자 id/순서/disabled 검증 |
| 목 전체e2e |126개 통과·실패0·exit0. 초기123통과3실패(첫 페이지5초내 미표시/이동), 소스 변경 없이 단독 재실행. 인증/단위/빌드 동시 실행의 부하 가능성은 추정이며 원인 확정 아님 |
| 인증 |17개 통과·실패0·exit0.3제공자·state 오류/만료/1회·쿠키HttpOnly/갱신/로그아웃·401공유·403차단 |
| 캡처 |baseline-extra/login14 → after/login14+contact1, 두 폭·normal/오류2/URL대기/요청오류/focus/reduced. 직접 contact 확인 |
| 위치 |14행 카드/2열/3버튼 rect 정확히 동일·제목y0·overflow0·실행animation0. 원본559/720 비율을 명명 토큰으로 유지 |
| 최신 웹 |2026-11-14 GitHub command.md 수신. 의미있는 버튼/접근 이름·focus·이미지크기·오류후속 안내 확인. 기존 오류 aria-live 누락은 기능 접근성 별도 과제 |
| review-animations |Approve. 제공자 transition-opacity 제거·공용 outline의 정적 hover/focus, 보통/reduced 실행0 |
| 보존 |auth schema/API/hooks/state/router·실제 제공자 요청/세션 방식 변경0. 기존 이미지/SVG 파일 삭제0 |

증거: [manifest](../experiments/style/after/login/manifest.json)·[위치](../experiments/style/after/login/layout-comparison.json)·[명령](../experiments/style/after/login/verification/commands.json). 원래 계획의 인증18개 예상은 실제17개로 기록했어요.
