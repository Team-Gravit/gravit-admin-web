> **2026-11-14 커밋·푸시 승인:** 사용자 “응 커밋 푸시 진행해”에 따라 승인 목록의9개 커밋을 `experiment/style-refresh`에 기록해요. 원격은 `origin`(Team-Gravit/gravit-admin-web)이며 main에는 머지하지 않아요. 아래 staged0/승인대기 표현은 검토 시점 기록이에요. 실제 실행 결과는 git log/status와 원격 브랜치를 기준으로 확인해요.

# T1 단계5·6 진행표

| 항목 | 현재 기록 |
|---|---|
| 승인 | 2026-11-14 사람 확인2 명시 승인, 후속 “이어서 고고!”로 승인된 T1 범위의 연속 진행 |
| 브랜치·기준 | experiment/style-refresh · fd83538bc640e62cc1bed5a17ddc4657e3de421b |
| 보존 | 세션 시작 dirty 316파일·PNG231장, SHA-256 목록은 after/checkpoints/session-start-sha256.json |
| 방향 | H1~H3·QA 샘플 재승인 없음. 새로운 경계·의존성·public props 의미 변경만 사전 질문 |
| Git | 커밋 후보는 CHECKPOINTS.md의 정확한 파일 목록·메시지로 별도 확인. 스테이징/커밋/푸시 미실행, main 머지 없음 |

## 순서와 계획

계획서 1개당 한 화면 묶음의 잔여 표시 이관이에요. 각 계획을 코드 변경 전에 작성하고 implement → write-test·verify-ui 순서로 수행해요. 기존 공용 UI 전파를 다시 구현하지 않아요(P5·P10).

| 순서 | 묶음 | 고유 잔여 범위·원칙 | 상태·계획 |
|---|---|---|---|
| 5A | 일반 운영9화면 | 공지3·유저2·신고2·문의2. 고정 문구·행동 이름·고정핀/숫자/인용문 위계, 원문·필터·확인 흐름 유지(W1·W7·V2·V4·V9) | [계획·테스트 완료](../../plans/PLAN-20261114-style-operations.md) —54unit/110e2e·59PNG |
| 5B | 학습·스테이징7화면 | 학습5·라벨2. 원문/단일 정답·288폭·부분 저장·이탈·strict-match 유지, 내부 강조·문구 잔여만(P5·V1·W1) | [계획·테스트 완료](../../plans/PLAN-20261114-style-learning-staging.md) —62unit/117e2e·62PNG |
| 5C | QA 잔여 | 목록/연결/디자인/2차/수정사항·모달/copy·로딩/reduced. 샘플 게이지/파트/그룹/Fail 창 재사용(P5·V8·M1·M5) | [계획·테스트 완료](../../plans/PLAN-20261114-style-qa-remaining.md) —65unit/120e2e·42PNG |
| 5D | 대시보드 | 숫자/카드 위계·차트 즉시 표시·부분 MAU 신호. D7 집계/기간/두 카드 유지(V2·V8·V9·M6) | [계획·테스트 완료](../../plans/PLAN-20261114-style-dashboard.md) —67unit/123e2e·15PNG |
| 5E | 로그인 H2 | 중립 텍스트 제공자·중립 왼쪽 면·기존 식별자. 제공자/2열 폭/인증 그대로(V1·V2·V7·V10) | [계획·테스트 완료](../../plans/PLAN-20261114-style-login.md) —69unit/126e2e·인증17·15PNG |
| 5F | Ravvit H3 | 완성 답변 즉시 표시·대기/오류·문구. SSE/history/권한/중단/재생성/스크롤 조건 유지(P9·M1·M5) | [계획·테스트 완료](../../plans/PLAN-20261114-style-ravvit.md) —78unit/133e2e·19PNG |
| 6 | 최종 검증 | 25화면×2폭 after·상태/모달/full·영역 순서/위치·접근성/모션/reduced·문구/감사 대응·전체 회귀 | [계획·최종 검증 완료](../../plans/PLAN-20261114-style-final-verification.md) —78unit/133e2e·정상50/총99PNG·커밋 승인 대기 |

## 검증을 남기는 곳

| 대상 | 위치·규칙 |
|---|---|
| 기존 before/중간 결과 | before/·baseline-extra/·after/shared/·after/sample/ 모두 보존. 과거 PNG 속 승인 대기 문구는 당시 기록 |
| 화면 묶음 | after/operations/ 등 별도 폴더·manifest·layout-comparison·검증 원문. 구현 전 필요한 변형만 baseline-extra에 보충 |
| 최종 결과 | after/final/에 25×2폭 및 보충 상태. 단일 화면 완료를 전체 완료로 표시하지 않음 |
| 반복 검사 | 묶음별 필요한 검사, source 변경 뒤 전체 회귀. 새 실패/수정 없이 비싼 전체 검사를 반복하지 않음 |
| 별도 과제 | DataTable 키보드 진입·입력 접근 이름·skip link·기존 선택 직후 ESC 경합 등은 스타일에 섞지 않음 |

## 세션 재개 시 확인

1. git status·브랜치·HEAD와 이 진행표/각 계획의 실제 상태를 확인해요.
2. 기존 미커밋 결과·캡처를 보존하고 마지막 완료 묶음의 증거를 읽어요.
3. 다음 묶음의 계획을 먼저 기록해요. 승인된 T1 방향을 다시 묻지 않아요.
4. 커밋은 정확한 파일 목록·메시지의 사용자 확인 뒤 실험 브랜치에서만 해요. 푸시 승인은 별도예요.
