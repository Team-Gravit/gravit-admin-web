# PLAN-20261114-style-qa-sample: T1 단계4 — QA 1차 체크리스트 샘플

| 항목 | 내용 |
|---|---|
| 상태 | 커밋됨 (2026-11-14) — 사용자 커밋·푸시 승인 |
| 요청 | T1의 승인된 전체 흐름 중 단계4. 공용 UI 적용 결과에 QA 상세 샘플을 더해 전후·감사 대응을 보여준 뒤 사람 확인2에서 정지 |
| 범위 밖 | 단계5 전체 화면 확산·로그인/Ravvit 구현·개별 도메인 전면 문구 변경·레이아웃/라우트/API/Zod/권한/데이터 흐름·기존 props 의미·새 의존성·커밋/푸시/머지 |

## 1. 목적

정보가 많은 /qa/sprints/2/checklist/1에서 읽기 데이터와 조작의 역할을 분명하게 해요(P4·P8·V2). 기존 영역 순서·게이지4개·파트 필터·다음 미검수·접힘 그룹·표 열·판정 메뉴·수정/삭제 흐름은 유지해요. 구성 요소 안의 글자·회색·여백·표현만 바꿔요.

사용자는 단계3 계획 승인 뒤 연속 진행을 두 번 지시했어요. 단계별 계획을 먼저 기록하는 조건은 유지하며, 단계4 계획 승인만 다시 묻지 않고 사람 확인2 결과 제시까지 수행해요. 사람 확인2는 이 연속 진행으로 생략하지 않아요. 참고 화면·값은 기존 before와 승인된 DS-STYLE-01/02예요. 새 Figma 입력·새 의존성은 없어요.

## 2. 읽은 문서

| 문서 | 절 | 제약 |
|---|---|---|
| 사용자 T1·AGENTS.md | 전체·QA 지도 | 페이지 골격·공개 props·코드 원문 유지, 단계4 결과 뒤 정지 |
| docs/spec/00_INDEX.md·docs/conventions/decisions.md | D9·D11~D15 | 최신 QA 계약·잠금/Fail/이력/종료·문구 톤만 대체 |
| docs/conventions/antipatterns.md·architecture.md | 전체 | 계약 추측·feature 직접 import·의존성 추가 금지 |
| docs/conventions/ui-conventions.md | 토큰/이름·T1 | 새 토큰만, 라이트1280px+, 셸240/56·본문max1200·padding32/24 유지 |
| docs/conventions/good-patterns.md·testing.md | 폼·오류·이탈·테스트 | 활성/오류/이탈 조건·원문 보존, 대상 옆 unit·MSW e2e |
| docs/spec/DS-00_overview.md·DS-01_design_system.md·DS-02_screens.md·DS-03_interactions.md | 골격·컴포넌트·상태·상호작용 | 기존 영역·필드·흐름 유지, 시각 값만 새 DS |
| docs/spec/01_gravit_admin_wireframe_spec.md·04_gravit_admin_frontend_spec.md | 공통 표/모달/폼·횡단 정책 | 기존 동작·3초 Toast·가드 보존 |
| docs/spec/DS-STYLE-01_foundations.md·DS-STYLE-02_components.md | 전체 | 중립 데이터·의미 상태·주요 행동1개·W 문구·즉시 데이터/정적 로딩 |
| docs/experiments/style/REPORT.md | QA 감사·단계3 | before110장·공용 적용79장, 원칙별 대응·동작 접근성 과제 분리 |
| .agents/skills/style-designer/SKILL.md·implement/SKILL.md·write-test/SKILL.md·verify-ui/SKILL.md | 전체 | P/W/V/M 이유, source 전 캡처·unit/e2e·최신 UI/모션 점검 |
| QA 소스·목·테스트 | schemas/api/queries/mutations·체크리스트/게이지/모달·qaHandlers·e2e | 서버 checked/total을 그대로 사용, 1/2차 분류·잠금·Fail사유500자·이력·버전·필터/이동 유지 |

## 3. 바뀌는 화면·라우트

| 라우트 | 화면 | 변경 |
|---|---|---|
| /qa/sprints/2/checklist/1 | 주 샘플 | 중립 게이지·읽기 위계·파트 보조 정보·행 관리 아이콘·관련 안내 |
| /qa/sprints/:id/checklist/2 | 같은 ChecklistPanel | 공통 표시 수정이 자동 적용됨. 2차 추가/수정/삭제·part/classification 조건 유지 |
| /qa/sprints/:id/design-review | ProgressGauges/PartChips/FeatureGroupHeader/FailReasonModal 재사용 | 같은 공용 QA 표시만 자동 적용. 디자인 고유 항목/판정/기능은 고치지 않음 |
| 기타 QA 탭 | 공통 copy 키 사용처만 | 변경한 기존 키의 톤만 전파, 탭별 고유 구조·문구는 단계5 |

위 재사용 전파는 공용 표시 변경의 범위예요. 이번 샘플을 근거로 다른 feature·화면을 확산하지 않아요. 추가 라우트·탭·화면은 없어요.

## 4. 코드 변경 (스키마 → API → 훅 → 컴포넌트 → 페이지 → 라우트 순)

스키마·API·쿼리/뮤테이션·페이지·라우터·상태 조건은 변경하지 않아요.

| 파일 | 단위 | 변경·근거 |
|---|---|---|
| src/shared/components/states/LoadingSkeleton.tsx | 로딩 시각 보정 | 페이지/막대가 같은 N50여서 invisible인 문제를 최종 캡처에서 발견. 기존 wrapper에 흰 면·card12·내부16 적용, 막대/개수/요청 조건 유지(P9·V1·V8) |
| src/features/qa/components/ProgressGauges.tsx | 표시 | 650ms RAF/시각 entrance state 제거, checked/total·percent를 즉시 표시. 반원 위치/반지름·4카드·aria meter·전체/해당없음 규칙 그대로. 채움색은 fg-secondary, 트랙은 기존 border(N50)(P9·V2·V9·M1·M6) |
| src/features/qa/components/ChecklistPanel.tsx | 항목 내부·행동 강조 | 제목body/600·기대 결과body/400·fg-secondary, 기대 결과의 반복 배경/내부 padding 제거. 다음 미검수를 default 주요 행동·명확한 이동 문구로. 수정/삭제는 기존 col 안에 작은 Pencil/Trash2 아이콘과 같은 aria-label/보충 title. colgroup·row key·ref·포커스 이동·disabled·callback 그대로(P4·P8·P10·V1·V4·V7) |
| src/features/qa/components/PartChips.tsx | 보조 정보 | 기존 순서·파트 이름을 작은 중립 텍스트와 구분점으로 표시, 파트별 반복 외곽선 제거. parts 필터/정렬·원문 유지(V1·V2·V4·P10) |
| src/features/qa/components/FeatureGroupHeader.tsx | 내부 위계 | screenName600·screenId/변경/완료율 보조 강조, 완료율tabular-nums. 기존 접힘/버튼/영역 위치 그대로(P8·V4·V9) |
| src/features/qa/components/FailReasonModal.tsx | 닫기·비활성 시각 | 빠져나가기 취소→닫기, aria-disabled 시각을 opacity-disabled로. pending/locked/submit/restoreFocus/이탈/500자 검증은 보존(W8·P5·V8) |
| src/features/qa/copy.ts | 관련 고정 문구 | §7의 기존 키만 해요체, 활동/다음 이동/삭제 안내의 기존 literal도 중앙 copy로 이동. 서버 메시지·schema error·코드 원문 미변경(W1·W5·W7·W9·W12) |
| tests/e2e/qa-flow-v2.spec.ts·qa-followup.spec.ts·qa-h2.spec.ts | 기대값 | 바뀐 기존 문구/Fail modal 닫기 기대값만 갱신, 상태/요청/이력 검증 유지 |
| ProgressGauges.test.tsx·FailReasonModal.test.tsx | 표시·행동 계약 | §9의 의미 있는 단위 테스트 |

체크 셀의 메뉴/툴팁/판정/잠금 로직은 그대로 사용해요. QaChip/QaStatusIcon·StageStepper·SprintHeader·QA 오류 클라이언트의 전면 이관은 이번 범위가 아니에요.

## 5. API 계약 영향 (docs/spec/03_gravit_admin_api_spec.md, 별도 서비스는 해당 D 항목)

없음 — D11~D13의 checked/total·NOT_APPLICABLE 제외·version·Fail reason·이력·동작 조건은 그대로예요. 목 응답 모양/값·API 코드·schema·권한도 바꾸지 않아요. 실제 쓰기는 하지 않고 MSW만 사용해요.

## 6. 상태 4종

| 상태 | 조건 | 화면 동작 |
|---|---|---|
| 로딩 | 기존 checklist isLoading | 기존 위치의 정적 LoadingSkeleton. 실제 작업 중이면 기존 activity 우선, 문구만 해요체·… |
| 빈 상태 | 기존 features 없음 또는 파트 필터 결과 없음 | 기존 EmptyState·선택 파트·상태 조건 유지, 관련 안내만 해요체 |
| 오류 | 기존 checklist 오류 | 기존 qaErrorView의 message/retryable·버튼 유지. 오류 원인이나 응답을 새로 추측하지 않음 |
| 정상 | 기존 MSW sprint2 | 같은 4게이지·필터·그룹·행/상태·수정/삭제/이력. 미검수 이동·Fail 사유·접힘/포커스·버전 조건 보존 |

## 7. 문구

| 키/위치 | 지금 → 변경 | 근거 |
|---|---|---|
| CELL_BEFORE_MANUAL_REVIEW | 1차 검수가 끝난 뒤 변경할 수 있습니다. → 1차 검수가 끝나면 변경할 수 있어요. | W1·W9 |
| FAIL_REASON_HINT | 사유는 선택 사항입니다. 수정할 내용을 남겨 주세요. → 수정할 내용을 남겨 주세요. | W5, label의 사유(선택) 유지 |
| FAIL_REASON_EDIT_HINT | 현재 사유를 수정해 주세요. 비워 두면 기존 사유가 유지됩니다. → 사유를 수정해 주세요. 비워 두면 기존 사유를 유지해요. | W1·W2·W5 |
| FAIL_REASON_PENDING | 판정을 저장하고 있습니다. 잠시 기다려 주세요. → 판정을 저장하고 있어요… | W1·W5 |
| FAIL_REASON_LOCKED | 지금은 판정을 변경할 수 없습니다. → 지금은 판정을 바꿀 수 없어요. | W1, 조건 동일 |
| FAIL_REASON_LIMIT | 사유는 500자까지 입력할 수 있습니다. → 사유는 500자까지 입력할 수 있어요. | W1, 숫자/검증 동일 |
| EMPTY_ITEMS | 아직 생성된 항목이 없습니다. → 아직 생성된 항목이 없어요. | W1 |
| EMPTY_FILTERED | 선택한 파트의 항목이 없습니다. → 선택한 파트의 항목이 없어요. | W1 |
| CLOSED | 종료된 스프린트입니다. 결과와 이력을 확인할 수 있습니다. → 종료된 스프린트예요. 결과와 이력을 확인할 수 있어요. | W1 |
| RUNNING | 준비 작업이 실행 중입니다. 항목 추가·수정·삭제는 작업이 끝난 뒤 가능합니다. → 준비 작업을 실행하고 있어요. 작업이 끝나면 항목을 추가·수정·삭제할 수 있어요. | W1·W2·W9 |
| CHECKLIST_GENERATING 신규키 | 체크리스트를 생성 중입니다. → 체크리스트를 만들고 있어요… | W1·W11 |
| AUTO_REVIEW_RUNNING 신규키 | 1차 자동화 검수 중입니다. → 1차 자동화 검수를 진행하고 있어요… | W1 |
| NEXT_UNCHECKED 신규키 | 다음 미검수 → 다음 미검수로 이동 | W7·원문 상태 유지 |
| ITEM_DELETE_IRREVERSIBLE 신규키 | 삭제한 항목은 되돌릴 수 없습니다. → 삭제한 항목은 되돌릴 수 없어요. | W1·의미 유지 |
| FailReasonModal 닫기 | 취소 → 닫기 | W8 |

그 밖의 feature copy·서버 오류·목 본문·운영자 작성 사유/기대 결과/행위·ID/상태 원문은 그대로예요.

## 8. 고칠 명세

| 파일 | 절 | 내용 |
|---|---|---|
| docs/spec/DS-STYLE-02_components.md | QA 샘플 추가 | 즉시 중립 게이지·같은 레이아웃/계약·항목 내부 위계/보조 파트·행 관리·샘플 적용 상태 |
| docs/conventions/decisions.md | D15 추가 기록 | 단계4 범위와 공유 QA 컴포넌트 전파·사람 확인2 정지 |
| docs/experiments/style/REPORT.md | 단계4 | 전후·감사6행 대응·문구/모션·4상태·레이아웃·남은 과제·사람 확인2 |
| 이 계획서 | 검증·Deviation Log | 승인 근거·실제 명령/통과 수·캡처/대비·점검표 |

## 9. 테스트 계획

| 종류 | 파일 | 검증 |
|---|---|---|
| 단위(Vitest) | src/features/qa/components/ProgressGauges.test.tsx 신규 | 서버 supplied checked/total·반올림 percent가 첫 render부터 보이는지, 0 total·부분 데이터의 대상 없음·4 meter 역할 유지. 기존650ms 연출에서는 즉시 수치 기대가 실패하는 red 확인 |
| 단위(Vitest) | src/features/qa/components/ChecklistPanel.test.tsx 신규 | 정상 원문/새 이동 버튼·빈 안내/disabled·로딩/오류 우선순위·재시도 callback, 목 fixture 재사용 |
| 단위(Vitest) | src/features/qa/components/FailReasonModal.test.tsx 신규 | 새 안내/닫기·원문 사유 보존·빈 사유 제출 가능·pending이면 닫기/제출 콜백 차단·editing 안내 |
| 단위 | 기존 전체 | CheckCellButton·schemas·기존 shared 포함 전체 실행. class 문자열 테스트 없음 |
| e2e | 기존 qa-flow-v2/qa-followup/qa-h2 및 shared 포함 전부 | 변경 문구만 갱신. 다음 이동·접힘/포커스·행 관리·Fail/이력·권한/잠금·재수집·종료·버전 흐름 보존 |
| 목 핸들러 | src/mocks/qaHandlers.ts 재사용 | 변경 없음. 지연/오류는 실제 checklist GET을 브라우저에서만 hold/계약 오류로 재현 |
| UI/모션 | verify-ui·web-design-guidelines·review-animations | 전후2폭·긴 정상 화면·4상태·모달/메뉴·reduced·즉시 수치·중립색·본문 대비·셸/영역 순서 유지 |

npm run check → npm run test → npm run test:e2e를 확인하고 check:full도 수행해요. 실패는 원인별로 고치고 새 결과로 보고해요.

## 10. 확인할 화면 (verify-ui)

before110장과 단계3 after/shared/의 중간 상태를 보존해요. 결과는 after/sample/에 저장해요. 모든 행은 MSW 세션 true이며 각1280/1440×900, 긴 정상 화면은 full 추가예요.

| 경로 | 목 조건 | 볼 것 | 전 캡처 | 후 캡처 |
|---|---|---|---|---|
| /qa/sprints/2/checklist/1 | 기존 정상 | 4게이지·필터/이동·표/상태·행 관리·영역 순서 | before/qa-first-normal-{폭}.png 및 full, after/shared/base/qa-first-normal-{폭}.png | after/sample/qa-first-normal-{폭}.png·full |
| 동일 | 기존 Fail 창/범례/판정 메뉴 | 의미 상태·닫기·중복 문구 감소·포커스 | before/qa-fail-dialog·qa-legend 및 shared/qa-menu | after/sample/qa-{fail-dialog,legend,menu}-{폭}.png |
| /qa/sprints/7/checklist/1 | DRAFT·기존 빈 checklist | 빈 상태 안내·잠금 보존 | 구현 전 해당 상태 보충 | after/sample/qa-first-empty-{폭}.png |
| /qa/sprints/2/checklist/1 | 해당 GET만 보류/오류 응답 | 실제 로딩·오류·재시도, 헤더/탭 보존 | 구현 전 해당 상태 보충 | after/sample/qa-first-{loading,error}-{폭}.png |
| /qa/sprints/3/checklist/1 | AUTO_REVIEW 기존 목 | 작업 중 안내·잠금·메뉴 없음 | 기존 목·구현 전 보충 | after/sample/qa-first-running-{폭}.png |
| /qa/sprints/2/checklist/2·/qa/sprints/9/design-review | 기존 목 | 공유 스타일 전파만·기능 회귀 없음 | before 및 shared 대응 캡처 | after/sample/qa-{second,design}-normal-{폭}.png |
| /qa/sprints/2/checklist/1 | reduced-motion: reduce | 최종 수치 즉시·메뉴/모달 무이동 | 기존 before | after/sample/reduced-qa-first-1440.png |

같은 화면의 loading/error/empty before 보충은 source 수정 전에 baseline-extra/sample/에 저장해요. 영역 실측·API request/response source·캡처 경로를 manifest에 기록해요. 셸240/56·본문max1200·padding32/24·탭/게이지/도구막대/그룹 순서를 비교해요. API 쓰기는 MSW만, 실제 promote/종료/공유 서버 쓰기 없음. 이름 있는 agent-browser 세션·고포트 localhost strictPort 사용, 종료 시 서버/브라우저 닫기.

## 11. 결정 필요

없음 — 승인된 T1·H1~H3·연속 진행 범위 안의 표시 변경이에요. 샘플 결과를 보여주는 **사람 확인2에서는 반드시 멈추며 단계5 적용·커밋·푸시를 시작하지 않아요.**

## Deviation Log

| 날짜 | 계획 | 실제 | 이유 |
|---|---|---|---|
| 2026-11-14 | 브라우저에서 checklist GET만 지연/오류 재현 | 스프린트 목록에서 XHR를 기록한 뒤 진입, hold 또는 목 없는 id999999로 치환해 기존404 | SprintHeader가 양쪽 checklist를 미리 조회하므로 상세 진입 뒤 가로채면 캐시가 이미 채워짐. 동일 계약·브라우저 전용·제품 API/목 미변경 |
| 2026-11-14 | 기존 e2e 문구 기대값 갱신 | 종료 안내/사유 유지의 부분 문자열 기대도 갱신 | 전체 문장 외의 부분 기대2곳이 첫 실행에서 남아 있었음 |
| 2026-11-14 | 기존 즉시 Escape 검사 | textbox 포커스와 진입 연출 종료를 확인한 뒤 Escape | T0에서도 확인한 초기 Escape 경합이 전체 실행에서1회 발생. dismiss 동작은 바꾸지 않고 실제 입력 준비를 기다림 |
| 2026-11-14 | 정적 skeleton의 기존 토큰 재사용 | LoadingSkeleton wrapper에 surface·card12·padding16 추가 | 최종 4상태 캡처에서 페이지와 막대가 같은 N50여서 로딩이 보이지 않음을 확인. 승인 토큰만으로 가시성 복구, 로딩 개수/조건 불변 |

## 검증 결과

| 명령·점검 | 결과 |
|---|---|
| npm run check | check:full 내부 exit0 — 타입·린트0오류/기존4경고·token-lint |
| npm run test | exit0 —12파일40개 통과·실패0 |
| npm run test:e2e | exit0 —101개 통과·실패0 |
| npm run check:full | exit0 — 타입·린트·token-lint·빌드, 기존 Browserslist/chunk 경고 |
| verify-ui·web-design-guidelines·review-animations | [REPORT §12](../experiments/style/REPORT.md) —23화면/2비교·4상태·실측·reduced·UI/모션 표 |

## 자기 점검

- [x] 명세에 없는 엔드포인트·필드·쿼리 없음
- [x] 상태4종 각각 화면 동작이 적혀 있음
- [x] 문구는 QA copy.ts 소유·원문/계약 의미 보존
- [x] features 간 직접 import 없이 구현 가능
- [x] 테스트 계획에 unit·e2e·목 재사용/재현 범위가 있음
- [x] 확인할 화면 목록·두 폭·전후 캡처가 있음
- [x] 사람 확인2 정지·새 의존성0·공개 props 의미/골격/데이터 흐름 고정

## 실제 캡처·사람 확인2

[1440px 비교](../experiments/style/after/sample/compare-1440.png) · [1280px 비교](../experiments/style/after/sample/compare-1280.png) · [23개 화면 manifest](../experiments/style/after/sample/manifest.json) · [보충 before8장](../experiments/style/baseline-extra/sample/manifest.json) · [실측](../experiments/style/after/sample/layout-comparison.json) · [reduced](../experiments/style/after/sample/reduced-qa-first-1440.png) · [UI 증거](../experiments/style/after/sample/ui-evidence.json) · [명령 원문](../experiments/style/after/sample/verification/)

사람 확인2 결과 제시 시점에는 정지했어요. 2026-11-14 사용자 “QA 샘플 방향을 승인합니다(사람 확인2)”와 후속 “이어서 고고!”로 단계5 진행을 승인받았어요. 단계4의 원래 검증·캡처는 보존하며, 새 변경의 증거로 재사용하지 않아요. 커밋·푸시는 별도 확인 대상이에요.
