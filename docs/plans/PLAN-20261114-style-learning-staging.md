# PLAN-20261114-style-learning-staging: T1 단계5B — 학습·스테이징7화면

| 항목 | 내용 |
|---|---|
| 상태 | 커밋됨 (2026-11-14) — 사용자 커밋·푸시 승인 |
| 요청 | 승인된 기초/샘플을 학습5·스테이징2화면의 고유 문구·데이터 강조·대기 모션에 적용 |
| 범위 밖 | API/응답/검증 조건/상태/권한/public props/라우트/저장 로직·폭/영역 순서·실제 promote·기존 접근 이름 과제·새 의존성·커밋/푸시/머지 |

## 1. 목적

학습 통계의 비조작 파랑을 중립으로 낮추고, 고정 안내·확인·저장 이름을 해요체로 맞춰요(V2·V4·W1·W7). 본문/정답/해설 원문과 카드·폼/옵션 위치를 보존하며 이미 적용된 공용 토큰을 다시 만들지 않아요(P5·P10). 스테이징 저장 회전은 실제 대기 때만1200ms, reduced에서는 정적으로 표시해요(M1·M4·M5). 새로운 Figma 입력 없이 승인된 DS와 기존 화면을 사용해요.

## 2. 읽은 문서

| 문서 | 절 | 제약 |
|---|---|---|
| AGENTS·NEXT_SESSION_PROMPT·STAGE5 | 지도·현재 범위 | 단계0~5A 보존·experiment 브랜치·계획 먼저 |
| 00_INDEX·decisions | 우선순위·D1/D2/D6/D15 | 주관식 단일 객체/콤마문자열1개·본문만 Markdown·시각 권위만 대체 |
| antipatterns·architecture·ui-conventions | 전체 | 새 라이브러리0·@/·기존 의미 토큰·셸240/56/max1200/padding32/24 |
| good-patterns·testing | STAGING_DETAIL·폼/이탈/오류·테스트 | 독립 hidden form·부분 성공 baseline·실패 원문·MSW |
| DS-01·DS-02·DS-03 | 명명·화면10~16·모달/폼/학습/스테이징 상호작용 | 보기4개/정답1·편집/이탈·정확 일치·라벨 read-only. 구280폭은 실제288폭/D15로 대체 |
| DS-STYLE-01/02 | 전체 | 중립 데이터·선택/dirty 파랑·의미 상태·정적 본문·실제 대기/reduced |
| 01·04 | §6-5~7·§9/10-2 | 부분 PATCH·allSettled·정답 변경 시 이전/새 옵션·이탈·promote |
| api-contract·03 | §7/8 관련 계약 경계·§8-5~7 | 계약 코드는 변경하지 않음. 구 다중 정답 문구보다 D1/D2 우선 |
| 해당5도메인 코드·pages·mocks·promote/shared-ui e2e | schema/api/query/mutation·폼/통계·화면 | 분기/필드/원문/response parse/저장 payload 보존 |
| implement·write-test·verify-ui·review-animations·verification-before-completion | 절차·모션10기준 | 전 캡처·근거 기반검증·실제 대기 외 회전 없음 |

## 3. 바뀌는 화면·라우트

| 라우트 | 화면 | 변경 |
|---|---|---|
| /chapters | 챕터 목록 | 중복 소개 삭제·min-h-16으로 표 위치 유지·빈 안내(W5·P5) |
| /chapters/1 | 챕터 상세 | 통계 막대 중립·빈 안내·편집 문구(V2·W1) |
| /units/12·/lessons/901 | 유닛/레슨 상세 | 고유 빈 안내·편집 저장/취소 문구, 데이터 원문 유지(W1·W7) |
| /problems/512·513 | 문제 상세/같은 화면 유형 | 객관/주관 편집 문구·정답/해설 보조글 body14/22, 배열/단일 객체 불변(V4·W1) |
| /staging/labels | 라벨 목록 | 고정 소개 해요체·빈 안내, 기본 PENDING 유지(W1) |
| /staging/labels/2026-04-25-update | 라벨 상세 |288폭/독립폼·dirty·저장 유지, 안내/확인·숫자·row색 보간 제거·대기/reduced(M1·M5·M6) |

## 4. 코드 변경 (스키마 → API → 훅 → 컴포넌트 → 페이지 → 라우트 순)

| 파일 | 단위 | 변경 |
|---|---|---|
| features/{chapters,units,lessons,problems,staging}/schemas.ts | 폼 | message만 해요체/띄어쓰기. schema shape/min/max/trim/enum/response 유지 |
| api·queries·mutations·router·mocks | 계약/상태 | 변경 없음 |
| chapters/components/ChapterStatsWidget.tsx | 통계 | 막대/track 중립·집계/clamp/원문/치수/4상태 유지 |
| chapters/ChapterEditForm·units/UnitEditForm·lessons/LessonEditForm·problems/{Objective,Subjective}ProblemEditForm | 폼 | 저장/편집 취소·토스트·검증 문구. 원문/옵션 수/정답/이탈/요청 그대로 |
| problems/components/ProblemView.tsx | 설명 | 해설 caption→body14/22. 원문/영역/정답 상태 그대로 |
| staging/components/Staging{Lesson,Objective,Subjective}Form.tsx | 폼/실제 대기 | 저장/토스트·partial 결과 수 유지·spinner 기존 토큰1200ms 및 motion-reduce:animate-none·대기 라벨. 입력·hidden·tasks/commit/invalidation 불변 |
| pages/{chapters,units,lessons,staging} | 화면 | 빈/고정 안내만. staging row transition-colors 제거, 숫자 tabular. 반영 버튼 이름/strict match/288폭 유지 |
| chapters/components/ChapterStatsWidget.test.tsx·staging/schemas.test.ts·tests/e2e/style-learning-staging.spec.ts | 테스트 | 통계4상태·주관식/옵션/검증·dirty/원문/partial/요청·대기/reduced |
| tests/e2e/promote.spec.ts | 기대값 | 목 promote 토스트 문구만 갱신. 실서버 실행 없음 |

## 5. API 계약 영향 (`docs/spec/03_gravit_admin_api_spec.md`)

없음. 단일 answer 객체·comma String·4 options·이전/새 정답 PATCH·전체/부분/전체 실패 분기·재시도/캐시/권한을 바꾸지 않아요. 목 응답의 원문도 보존해요.

## 6. 상태 4종

| 상태 | 조건 | 화면 동작 |
|---|---|---|
| 로딩 | 기존 query loading·저장 pending | 정적 공용 skeleton. 저장 spinner1200ms transform만·reduced정적·disabled 조건 유지 |
| 빈 | 기존 contents/units=[] | 같은 위치·해요체 도메인 안내. 새 행동/검색 없음 |
| 오류 | 기존 query 또는 저장 실패 | 같은 재시도/메시지 우선순위. 부분 성공만 baseline·실패 입력/dirty 유지 |
| 정상 | 기존 목 | 동일 통계/원문/옵션4·주관식1·항목 전환/저장·288폭/이탈/정확 일치 |

## 7. 문구

| 위치 | 현재 → 변경 | 근거 |
|---|---|---|
| 공통 성공/필수 | 저장되었습니다. → 저장했어요. / 필수 항목을 확인해주세요. → 필수 항목을 확인해 주세요. | W1·W2 |
| 폼 필수·제한 | {제목/지시문/본문}은 필수 항목입니다. → {…}을 입력해 주세요. / 입력해주세요. → 입력해 주세요. | W1·W6·조건 유지 |
| 빈 안내 | {챕터/유닛/레슨/문제/라벨}이/가 없습니다. → …없어요. / 아직 풀이 데이터가 없습니다. → 아직 풀이 데이터가 없어요. | W1 |
| 학습 편집 | 취소 → 편집 취소 / 저장 → 저장하기 | W7·편집 취소 의미 보존 |
| staging 저장 | 저장 → 대기 전 저장하기/대기 중 저장하고 있어요… | W7·V8 |
| staging 일부 성공 | 일부 항목만 저장되었습니다. ({성공}/{전체} 성공) → 일부 항목만 저장했어요. ({성공}/{전체} 성공) | W1·집계 원문 유지 |
| staging 실패 | 저장에 실패했습니다. → 저장하지 못했어요. 다시 시도해 주세요. | W12 |
| staging 소개 | 자동 생성된 컨텐츠를 검수하고 운영에 반영합니다. → 자동 생성한 컨텐츠를 검수하고 운영에 반영해요. | W1·W2 |
| 완료 안내 | 이 라벨은 prod에 반영 완료되었습니다. 더 이상 수정할 수 없습니다. → 이 라벨을 prod에 반영했어요. 반영한 라벨은 수정할 수 없어요. | W1·의미 보존 |
| 미저장 | 저장하지 않은 항목이 있습니다 ({N}건) → 저장하지 않은 항목이 있어요 ({N}건) / …{N}건 있습니다. 페이지를 나가시겠습니까? → …{N}건 있어요. 페이지를 나갈까요? | W1·W4 |
| strict-match 경고 | 이 작업은 되돌릴 수 없습니다. 라벨의 레슨·문제가 운영(prod)에 반영됩니다. → 이 작업은 되돌릴 수 없어요. 라벨의 레슨·문제를 운영(prod)에 반영해요. | W1·W2·위험 의미 유지 |
| 목 promote 결과 | 라벨이 반영되었습니다. → 라벨을 반영했어요. / 반영에 실패했습니다. 잠시 후 다시 시도해주세요. → 반영하지 못했어요. 잠시 뒤 다시 시도해 주세요. | W1·W12 |

## 8. 고칠 명세

| 파일 | 절 | 변경 |
|---|---|---|
| DS-STYLE-02 | 단계5B | 통계 중립·설명body·저장/reduced 표시 |
| REPORT·STAGE5·이 계획 | 단계5B·검증/차이 | 실제 적용·문구/모션·캡처·남은 작업 |

## 9. 테스트 계획

| 종류 | 파일 | 검증 |
|---|---|---|
| 단위 | ChapterStatsWidget.test.tsx | 원문/수치/clamp·4상태·retry 우선순위 |
| 단위 | staging/schemas.test.ts | 콤마 정답1개와 max/min·객관 options shape/원문·메시지 변경 전 red |
| e2e | style-learning-staging.spec.ts·기존 promote/shared-ui | 학습 수정 payload·주관 answer객체1·staging hidden폼/dirty·이전/새 정답 PATCH·부분/전체 실패 입력 보존·실제 대기/reduced |
| 목 | handlers.ts 재사용 | 변경 없음. 기존 MSW mutation 응답 또는 테스트/browser 전용 지연/오류 사용 |
| UI/모션 | verify-ui·최신web-design-guidelines·review-animations |7화면×2폭+객관/주관·편집·4상태·잠금/이탈/정확 일치·pending/reduced·막대 중립/수치 즉시 |

## 10. 확인할 화면 (verify-ui)

| 경로 | 목 조건 | 볼 것 | 전 캡처 | 후 캡처 |
|---|---|---|---|---|
| 학습5라우트·문제513 | 기존 목·정상/편집 | 같은 순서/원문/폭·중립통계·1정답/4보기 | before/·after/shared/base의 대응 정상/변형 보존 | after/learning-staging/동일 |
| /chapters/1·/staging/labels | 해당 GET만 로딩/빈/오류 | 4상태 우선순위·원문/재시도 | source 수정 전 baseline-extra/learning-staging 보충 | after/learning-staging 상태 |
| /staging/labels/2026-04-25-update | 기존 목·객관/주관·dirty/guard/strict창 |288폭·숨김폼 값·반영 disabled/strict일치·원문 | 기존 before의 staging 정상/폼/미저장/strict 사용 | after/learning-staging 변형 |
| 동일 | browser PATCH만 보류·reduced 보통/선호 | 실제 pending/회전1200·reduced정적·대기 라벨 | 변경 전 보충, 요청은 전송 전 hold | after/learning-staging pending/reduced |

1280/1440×900, 긴 문제/편집 full 보충. source 전 필요한 변형만 추가, 기존PNG 덮어쓰기 없음. 셸/heading순서·위치/288폭/overflow 측정. localhost고포트·명명 세션·완료 후 종료해요.

## 11. 결정 필요

없음. H1·사람 확인2 안의 문구/시각/모션 표시만 이관해요. 새 경계/props/의존성이 필요하면 변경 전에 질문해요. 실제 promote는 실행하지 않아요.

## Deviation Log

| 날짜 | 계획 | 실제 | 이유 |
|---|---|---|---|
| 2026-11-14 | 계획 먼저 | 현재 T1 연속 진행 승인으로 코드 전에 이 계획 기록 | 방향 재승인 없이 범위 내 표시 이관 |
| 2026-11-14 | 정답 PATCH 뒤 저장 비활성 검사 | T0 분리 worktree에서도 저장 성공 후 버튼 활성/반영 비활성 재현. payload2개/성공/선택만 회귀 검사, dirty 결함은 별도 기록 | 현재 스타일 diff는 등록/resetField/저장 로직 변경0. 원본에서도 동일하므로 기능 수정으로 확장하지 않음 |
| 2026-11-14 | 문제 정상 경로512 | 기존 공용 캡처와 같은1001로 실측, 테스트512/513은 유지 | 같은 유형의 데이터 원문/ID를 맞춰 비교. hidden h3는 실측에서 제외 |

## 검증 결과

| 명령·점검 | 결과 |
|---|---|
| npm run check | exit0 — 타입/ESLint0오류·기존4경고/token-lint |
| npm run test | exit0 —17파일62개 통과·실패0. 새8개, 변경 전2실패/6통과 |
| npm run test:e2e | exit0 —117개 통과·실패0(기존110+학습/스테이징7) |
| npm run check:full | exit0 — 타입/ESLint/token-lint/빌드. 기존 Browserslist/chunk 경고 |
| verify-ui 점검표 | [REPORT §14](../experiments/style/REPORT.md)·[PNG62장](../experiments/style/after/learning-staging/manifest.json)·[실측14행](../experiments/style/after/learning-staging/layout-comparison.json)·[원문](../experiments/style/after/learning-staging/verification/) |

## 자기 점검

- [x] 명세에 없는 endpoint/필드/쿼리 없음
- [x] 상태4종 조건/동작 있음
- [x] 기존 문구 소유 위치·원문/조건 보존
- [x] feature 간 직접 import 추가 없음
- [x] 단위/e2e·목 재사용/오류 재현 계획 있음
- [x] 경로/목 조건/전후 화면 목록 있음

## 실제 UI·모션 점검

| 위치 | 점검·결과 | 처리 |
|---|---|---|
| ChapterStatsWidget.tsx:19 | 비조작 파랑→N600/중립track·원문/숫자 즉시 | 승인 대비쌍·값/clamp/순서 유지(V2·V9) |
| ProblemView.tsx:52·70 | 해설14/22·N600 | 읽는 원문/영역 유지·본문 대비5.85:1(V4·V10) |
| Staging*Form의 실제 pending | duration1.2s/name spin/반복infinite, reduced name none/animation0·대기 라벨 유지 | 실제 PATCH를 전송 전hold하여 확인. 요청/상태 조건 추가0(V8·M1·M5) |
| StagingDetailPage.tsx:88 | 빈번한 항목 색 보간 제거 | 선택/hover색/288폭·dirty/hidden 불변(M6·P5) |
| 스테이징 옵션 입력·StrictMatch | 기존 연결 label/접근 이름 부족 | 별도 동작 과제 보존, 스타일로 묵시 시맨틱 변경하지 않음 |
| 학습 편집 heading·DataTable | 기존 편집 시 제목/행 키보드 진입 과제 | 기존 골격/행동 보존·후속 과제 |
| 레이아웃14행 | 셸 x/폭·보이는 heading순서 같음·heading y변화0·overflow0·정상본문 animation0 | 같은 원문/ID·두 폭 비교 |
| 캡처 | 정상14·상태/대기16·편집/주관/완료/가드/strict24·full8=62장, 전 보충14장 | 원본 before/공용/샘플/운영 이미지 보존 |

### review-animations

| Before | After | Why |
|---|---|---|
| StagingDetailPage의 반복 항목 transition-colors | 색 보간 제거·즉시 선택 | 빈번한 이동은 즉시(M6·기준2) |
| Staging3폼 기본1초 회전·reduced 없음 | 실제 대기만 토큰1200ms linear transform·reduced정적 | 실제 상태 신호에 한정(M1·M4·M5·기준1/7/8) |

판정 **Approve** — 장식/본문 진입 없음, 실제 대기 시에만 회전하며 끝나면 unmount. reduced에서 이동0·라벨 유지. 반복1.2초는 UI 진입 시간 기준이 아니라 승인된 loading-cycle이며 실제 요청 대기 신호예요. 기존 공용 overlay는 재설계하지 않았어요. 최신 Web Interface Guidelines를2026-11-14 다시 받아 바뀐 파일에 적용했어요.

### 별도 기능 과제 — 정답 저장 뒤 dirty 잔류

스테이징 객관식 정답만 변경하면 이전/새 옵션 PATCH는 모두 성공하지만 저장 버튼이 활성·반영이 비활성으로 남아요. T0 fd83538의 분리 worktree에서 동일 입력·MSW로 재현한 검사1개 통과(exit0), [원문](../experiments/style/after/learning-staging/verification/t0-radio-dirty.log)·[검사 소스](../experiments/style/after/learning-staging/verification/t0-radio-dirty.spec.txt). 이 동작은 스타일 전부터 존재해요. 등록하지 않은 answerOptionId의 resetField가 원인 후보지만 확정하지 않았어요. 기능 수정/회귀 계획은 별도 승인 대상이며 이번 실험에서는 바꾸지 않았어요. 임시 T0 서버·worktree는 종료/정리했어요.
