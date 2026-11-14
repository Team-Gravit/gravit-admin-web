> **2026-11-14 커밋·푸시 승인:** 사용자 “응 커밋 푸시 진행해”에 따라 승인 목록의9개 커밋을 `experiment/style-refresh`에 기록해요. 원격은 `origin`(Team-Gravit/gravit-admin-web)이며 main에는 머지하지 않아요. 아래 staged0/승인대기 표현은 검토 시점 기록이에요. 실제 실행 결과는 git log/status와 원격 브랜치를 기준으로 확인해요.

> **2026-11-14 최신 이어가기 위치:** 단계5A~F 구현과 단계6 최종 검증까지 마쳤고 커밋 확인만 남았어요. 아래 본문은 단계4 종료 때의 원래 인계 기록으로 보존해요. 새 세션에서는 [STAGE5](STAGE5.md)·[최종 결과](after/final/README.md)·[CURRENT_COMMITS](CURRENT_COMMITS.md)부터 읽고, 단계5를 다시 구현하지 마세요. check:full/단위78/전체목e2e133/token4 통과, 인증17은H2검증. 현재 experiment/style-refresh·HEAD fd83538bc640e62cc1bed5a17ddc4657e3de421b·스테이징/커밋/푸시0·main머지0·서버/브라우저종료. 최종 코드 뒤 문서만 마감했어요. 정확한 파일/9개 메시지 사용자 확인 후에만 commit-push 절차로 실험브랜치에 커밋하며 푸시는 별도 확인이에요. 기존T0 staging객관식 정답단독저장 dirty잔류 결함/접근성별도과제는 REVIEW를 보세요.

# T1 스타일 개편 — 새 세션 이어가기 프롬프트

> 이 본문을 새 Codex 대화에 붙여 넣거나, 새 대화에서 이 파일을 읽으라고 지시해 주세요.
> 아래의 ‘사람 확인2 승인’은 이 프롬프트를 사용자가 새 세션에 보내는 시점의 승인입니다. 이 파일 작성만으로 단계5를 실행하거나 기존 승인 대기 기록을 바꾸지는 않았습니다.

---

## 요청과 승인

gravit-admin-web의 T1 스타일 개편 실험을 이어서 진행해 주세요. 단계4 QA 1차 체크리스트 샘플 방향을 승인합니다(사람 확인2). 이제 단계5 전체 화면 적용과 단계6 최종 검증을 진행해 주세요.

당신은 .agents/skills/style-designer/SKILL.md의 시니어 프로덕트 디자이너이면서 직접 구현하는 디자인 엔지니어입니다. 한국어 존대체·표 중심으로 답하고 모든 디자인 결정에 P/W/V/M 원칙 번호를 붙이세요. 추측하지 말고 모르는 것은 ‘정확하게 알지 못합니다’라고 한 뒤 🙋🏻로 물어보세요.

새 세션에서도 원래 T1의 범위와 작업 흐름을 유지하세요. 단계/변경별 docs/plans/ 계획을 먼저 쓰고 write-plan → implement → write-test·verify-ui → commit-push를 따르세요. 이미 승인된 방향 H1~H3와 QA 샘플을 다시 제안하거나 승인받지 마세요. 새로운 경계·의존성·public props 의미 변경만 변경 전에 질문하세요.

## 저장소와 미커밋 결과 보호

| 항목 | 현재 상태 |
|---|---|
| 작업 폴더 | /Users/xunsseoie/Desktop/melong/INU/appcenter/gravit-admin-web |
| 작업 브랜치 | experiment/style-refresh |
| HEAD / T0 기준 | fd83538bc640e62cc1bed5a17ddc4657e3de421b |
| T0 사전조건 | main 원격 반영을 단계0에서 확인했음 |
| 현재 변경 | 단계0~4의 문서·토큰·공용 UI·QA 샘플·테스트·PNG가 미커밋 상태로 존재 |
| 커밋/스테이징/푸시 | 아직 없음 |
| 서버/브라우저 | 검증용 dev 서버와 브라우저 세션을 종료한 상태 |

같은 작업 폴더와 브랜치에서 시작하세요. 처음에 git status·현재 브랜치·diff를 확인하고 기존 변경을 보존하세요. main 체크아웃·실험 브랜치 재생성·reset·clean·기존 변경 덮어쓰기로 처음부터 시작하면 안 됩니다. untracked 문서/PNG/테스트도 앞선 작업 결과입니다.

현재 미커밋 결과를 논리적 체크포인트로 보존하는 일을 먼저 준비하세요. commit-push의 구체 파일 목록·커밋 메시지 확인 절차를 지키고, 사용자의 별도 승인 없이 커밋/푸시를 실행하지 마세요. 앞으로의 화면 묶음도 되돌리기 쉬운 논리 단위로 커밋을 준비하세요.

T1의 명시적 지시가 AGENTS.md/commit-push의 main 직접 작업 규칙에 우선합니다. **experiment/style-refresh에만 커밋하고 main에 머지하지 마세요. 원격 푸시는 별도 사용자 확인 뒤에만 하세요.** git add . / git add -A 금지, 파일을 지정하세요. .env*·루트 로컬 핸드오프 문서·QA_SPEC.md·RAVVIT_SPEC.md 등 제외 규칙을 지키세요.

## 먼저 읽을 자료

1. AGENTS.md와 .agents/skills/style-designer/SKILL.md.
2. docs/spec/00_INDEX.md 및 docs/conventions/decisions.md의 D15, 변경 영역의 관련 D 항목.
3. docs/spec/DS-STYLE-01_foundations.md 및 DS-STYLE-02_components.md.
4. docs/experiments/style/REPORT.md의 **현재 머리말과 §11~12**. §1~10은 이전 단계의 감사/제안 기록이며 그 안의 옛 ‘미승인/미적용’ 표현으로 현재 상태를 되돌리지 마세요.
5. docs/plans/PLAN-20261114-style-shared-components.md 및 PLAN-20261114-style-qa-sample.md.
6. 변경 경로에 필요한 docs/conventions/ 및 기존 화면/계약 명세. 전체 문서를 무조건 다시 출력하지 말고 AGENTS.md 문서 지도에 따라 관련 절을 읽으세요.

기존 계획 기록은 PLAN-20261113-style-preparation.md, style-audit.md, style-foundations.md도 있습니다.

## 이미 끝낸 것 — 다시 구현/캡처하지 않기

| 단계 | 결과 |
|---|---|
| 0 준비 | 실험 브랜치 생성, 목 로그인·전체 화면 접근 확인 |
| 1 기록 | DS-02의16개와 추가 화면을 합친25개 화면. before110장(기본50+변형38+full22), 감사150행 |
| 2 방향 | 새 토큰·대비29쌍·정적 견본, H1~H3 승인 |
| 3 공용 UI | CSS/Tailwind 토큰·컨트롤·표·배지·모달·메뉴·툴팁·토스트·상태·문구·token-lint 개편. after/shared79장 |
| 4 QA 샘플 | 중립/즉시 게이지, 기대 결과14/22, 파트 보조글, 행 관리 아이콘, 관련 해요체. 샘플23장+비교2장 |

샘플 비교: docs/experiments/style/after/sample/compare-1440.png 및 compare-1280.png.
전체 공용 토큰은 이미25개 화면에 전파됐습니다. 따라서 ‘25개 화면을 전부 처음부터 새로 만드는’ 작업이 아닙니다. 고유 컴포넌트/문구/모션의 잔여 이관을 감사표와 실제 diff로 확인하세요.

QA 공용 ProgressGauges/PartChips/FeatureGroupHeader/FailReasonModal 변경은 2차/디자인 검수에도 일부 전파됐습니다. 같은 수정을 다시 하지 마세요.

## 승인된 디자인과 불변 조건

- H1: 새 팔레트/타이포/간격/반경/그림자/문구/모션, 기존 변수·클래스·props 의미 유지, 새 의존성0개.
- H2: 로그인 제공자 로고·브랜드 면은 중립 텍스트 UI로 바꾸되 제공자 이름·인증·2열 위치/폭 유지. 왼쪽은 기존 Gravit 식별자와 중립 면으로 단순화. 방향은 승인됐고 제품 구현은 아직입니다.
- H3: Ravvit의 완성 답변을 추가 타이핑 연출 없이 즉시 표시. SSE·history·권한·대화 유지·중단/재생성·스크롤 추종 조건 유지. 방향은 승인됐고 제품 구현은 아직입니다.
- 흰/중립 읽기 면, 행동/선택만 파랑, 실제 상태만 작은 의미 색. 일반 데이터/분류는 중립.
- 기존 HSL 의미 변수 이름 유지. public props 이름/의미·API·Zod 검증 조건·권한·데이터 흐름·라우트·탭·화면 수 고정.
- Sidebar240·Header56·Content max1200·padding32/24와 페이지 영역 순서/대략 위치 고정. staging 내부 목록 실제 폭288도 유지.
- 본문/보조 대비4.5:1 이상, 컨트롤 경계/의미 신호3:1 이상. 승인 쌍의 최소는 글자4.84:1·비텍스트3.29:1.
- control8/card12/overlay16, floating shadow는 떠 있는 요소만. 모션 값은 foundations 참조.
- 본문/표/차트/수치 진입은 즉시, skeleton 정적. 반복 로딩은 실제 대기에만, reduced에서 이동/확대 끄기.
- 다른 회사 로고/전용 서체/키트/공식 팔레트를 새로 가져오지 말고, 참고 회사 이름을 파일/브랜치/커밋에 쓰지 마세요.
- .env*를 읽거나 고치지 마세요. 하네스/AGENTS/.agents/.codex를 고치지 마세요. 실제 promote/배포/publish/공유 dev 서버 쓰기 금지.

## 남은 필수 작업

| 묶음 | 해야 할 일 |
|---|---|
| 현재 결과 보존 | dirty diff 검토, 문서/토큰/공용UI/QA샘플/테스트를 논리적 체크포인트로 나눠 커밋 준비. 승인 절차 준수 |
| 일반 운영9화면 | 공지·유저·신고·문의의 고유 카드/표 셀/폼/확인창/빈·오류 상태/프론트 문구·강조 정리 |
| 학습·스테이징7화면 | 챕터/유닛/레슨/문제 및 라벨 목록/상세. 원문/정답 단일 객체/strict-match/이탈/부분 실패/288폭 유지 |
| QA 잔여 | 목록·연결 현황·디자인 고유 부분·2차 고유 부분·수정사항·등록/종료/이력 모달·copy 잔여·로딩/reduced. 샘플 적용분 재사용 |
| 대시보드 | 고유 카드/정보 위계, Recharts 진입 연출·부분 MAU 구분·중립색/숫자. DAU/MAU 카드/집계/계약 유지 |
| 로그인 H2 | 중립 제공자 UI/기존 식별자·그림 자리 단순화, 동일2열·제공자·인증/세션 유지 |
| Ravvit H3 | 완성 답변 즉시 표시·대기/빈/오류·프론트 문구/모션. 기존 네트워크/상태 흐름 유지, 계약에 맞는 목 검증 준비 |
| 최종 단계6 | 최종25화면×1280/1440 after, 상태/모달/full 보충, 레이아웃 비교표·접근성/모션 점검·reduced 캡처·전체 회귀 |
| 문서 마감 | foundations/components/REPORT·문구/모션 목록·감사 대응/남은 과제·실제 증거 링크와 상태 갱신 |
| 기존 DS 정리 제안 | DS-00/02/03의 골격/상호작용은 보존, 활성 시각 권위는 새 DS로 대체. 현재 옛 문서 삭제0. 삭제를 자동 실행하지 않기 |
| Git 마감 | 화면 묶음별 실험 브랜치 커밋, 사용자 확인 후 원격 푸시 여부 결정. main 머지 없음 |

별도 범위: DataTable 행 키보드 진입·StrictMatch/문의 입력 접근 이름·skip link·기존 키보드 선택/초기 Escape 경합 등은 기록된 접근성/동작 과제입니다. 스타일 확산에 섞어 기능/시맨틱을 묵시 변경하지 말고 별도 계획/승인을 받아야 합니다.

## 구현·검증 시 알아둘 점

- src/shared/hooks/useOverlayMotion.ts는 Radix Presence 수명은 유지하고 WAAPI opacity/scale만 관리합니다. 같은 DOM의 ref 재연결에서 현재 프레임을 유지하도록 고친 상태입니다. 모션을 처음부터 재설계하지 마세요.
- Dropdown에는 exit90ms, Dialog160/120ms, reduced100ms·키보드0ms. 설치된 Radix Select는 닫을 때 즉시 unmount하므로 기존 즉시 닫힘을 보존했습니다. 연출 때문에 포커스/상태 수명을 바꾸지 마세요.
- Sonner가 --success-text를 자체 형식으로 덮어써서 --toast-success-color 어댑터를 둔 상태입니다. 실제 성공/오류 SVG 색은 승인한 의미 색으로 확인했습니다.
- LoadingSkeleton은 page/막대가 같은 색으로 보이지 않던 문제를 surface·card12·내부16으로 고친 상태입니다. 이 보정도 되돌리지 마세요.
- QA 게이지의650ms RAF/시각 entrance state는 제거됐습니다. 서버 checked/total/percent·반원 치수·meter 의미는 그대로입니다.
- token-lint는 이제 components/ui도 검사하며 allow는 globals.css와 tailwind.config.ts의 정확한 상대경로만입니다. raw hex 및 literal px/rem/em arbitrary를 막고 Radix var/data/구조 선택자는 허용합니다.
- agent-browser 첫 사용은 core 가이드를 읽고 이름 있는 세션을 사용하세요. 설치 CLI0.41.2에서는 addinitscript와 find ... focus가 지원되지 않았습니다. focus는 snapshot ref로 실행했습니다. 실패 시 doctor로 확인하세요.
- 목 로그인은 localStorage의 gravit_admin_session='true'. VITE_USE_MOCK=true, localhost47000번대·--host127.0.0.1·--strictPort. 먼저 lsof로 포트를 확인하고 끝나면 종료하세요.
- Ravvit 초기 /health는 기존 목 핸들러가 없어 브라우저 전용 응답으로 열었습니다. 실제 채팅/SSE 회귀는 별도 계획에서 계약에 맞게 목으로 준비해야 합니다. 실서버 쓰기로 검증하지 마세요.
- QA 종료 UI가1/2차 체크리스트를 미리 조회합니다. 상태 캡처의 XHR hold/기존404 재현은 목록에서 들어가기 전에 설정했습니다. 상세에서 설치하면 이미 캐시됐을 수 있습니다.
- Vite가 Tailwind TS 설정 변경 뒤 옛 테마를 유지한 일이 있었습니다. 필요하면 서버를 재시작하고 computed font/경계/반경을 확인한 뒤 캡처하세요.
- 같은 오류3회 반복 시 멈춤 등 local skill의 규칙을 지키세요. 새로운 실패·소스 변경 없이 비싼 전체 검사를 불필요하게 반복하지 마세요.

## 이전 검증 기록 — 새 변경 이후에는 필요한 검증 갱신

| 명령 | 단계4 마지막 결과 |
|---|---|
| npm run check:full | exit0, 타입·ESLint0오류/기존4경고·token-lint·빌드 |
| npm run test |12파일40개 통과·실패0·exit0 |
| npm run test:e2e |101개 통과·실패0·exit0 |
| node --test scripts/checks/token-lint.test.mjs |4개 통과·실패0·exit0 |

원문은 docs/experiments/style/after/sample/verification/와 commands.json에 있습니다. 기존 Browserslist·큰 chunk 경고는 남아 있습니다. 이 기록을 새 변경 후의 통과 증거로 재사용하지 마세요.

최종 필수 게이트: check:full·Vitest·전체e2e·web-design-guidelines 최신 원문·review-animations·reduced 캡처·화면별 영역 순서/위치 표. 계획의 읽을 문서와 테스트 범위를 지키고 결과의 통과 수/exit code를 보고하세요.

## 첫 행동과 사용량을 아끼는 진행

먼저 브랜치/dirty diff와 위 핵심 자료를 확인하고, 사람 확인2 승인 기록을 현재 상태에 반영하세요. 단계5를 작은 화면 묶음의 계획으로 나누어 우선순위를 보고한 뒤 기존 흐름으로 이어가세요. 이미 완료한 감사/토큰/샘플을 다시 수행하거나 모든 원본 이미지를 무조건 재캡처하지 마세요. 기존 before/중간 after는 보존하고 최종 after를 별도로 남기세요.

계정 사용량 한도는 새 세션으로 초기화되지 않습니다. 남은23%로 전체를 끝낼 수 있다고 단정하지 마세요. 불필요한 대용량 파일/로그 출력·전체 검증 반복을 줄이고, 각 묶음의 변경/증거/남은 일을 파일로 기록해 다음 세션에도 이어갈 수 있게 하세요.
