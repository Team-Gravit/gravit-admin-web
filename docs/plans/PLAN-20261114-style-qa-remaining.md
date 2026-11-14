# PLAN-20261114-style-qa-remaining: T1 단계5C — QA 잔여 이관

| 항목 | 내용 |
|---|---|
| 상태 | 커밋됨 (2026-11-14) — 사용자 커밋·푸시 승인 |
| 요청 | 샘플/공용 적용을 재사용하고 QA의 고유 문구·표시·모션 잔여만 이관 |
| 범위 밖 | API/응답/판정/권한/version/polling/라우트/탭·500자/빈 사유·public props 의미·원문·새 의존성·기존 동작 접근성 과제·실서버 쓰기·커밋/푸시/머지 |

## 1. 목적

승인된 QA 샘플과 같은 읽기/조작 위계를 디자인 검수에 적용하고, 목록·연결/수정사항·등록/종료/이력/항목 창의 고정 문구를 정리해요(P4·P8·V2·V4·W1·W7). 게이지/파트/그룹/Fail 사유 샘플은 재구현하지 않아요(P5·P10). 실제 대기 회전만1200ms/reduced정적으로 통일해요(M1·M4·M5). 기존 DS/샘플을 디자인 입력으로 사용하며 새 Figma 입력은 필요하지 않아요.

## 2. 읽은 문서

| 문서 | 절 | 제약 |
|---|---|---|
| AGENTS·NEXT_SESSION_PROMPT·STAGE5·REPORT | 현재·§11~14 | 초기 dirty 보존·기존 샘플 재사용·전후/회귀 증거 |
| 00_INDEX·decisions | D9·D11·D12·D13·D15 | 최신 계약/5탭/원문·잠금·서버 집계·이력/빈 사유·공통 오류 |
| antipatterns·architecture·ui-conventions | 전체 | 새 의존성0·@/·기존 토큰·셸/영역 고정 |
| good-patterns·testing·01 §5·04 §9/10 | 폼/이탈·4상태·표/모달/Toast | 기존 검증/가드·3초 토스트·원문/동작 유지 |
| DS-01·DS-02·DS-03·DS-STYLE-01/02 | 명명·골격·공용/샘플 |14/22·중립 읽기·파랑 행동/선택·실제 상태·기존 모션 |
| api-contract·D9/D11~13 | QA 별도 계약 | qaClient는 fallback literal만 변경, 응답/503·401·403 분기/서버 message 보존 |
| QA 소스·pages·qaClient·mocks·기존 QA e2e | schemas/api/queries/mutations·패널/모달/상태·검사 | response schema/fields·MSW 본문·요청 body/상태 조건 변경0 |
| implement·write-test·verify-ui·web-design-guidelines·review-animations | 절차/모션 기준 | 전 캡처·두 폭·새 지침/모션·단위/전체 회귀 |

## 3. 바뀌는 화면·라우트

| 라우트 | 화면 | 변경 |
|---|---|---|
| /qa/sprints | 목록 | 반복 소개 삭제·min-h-16으로 위치 유지·3열/등록 위치 고정 |
| /qa/sprints/:id/setup | 연결 현황 | 고정 안내·수치·실제 대기 모션. 연결/명세/전후 원문·승인/거절/재수집/취소 그대로 |
| /qa/sprints/:id/design-review | 디자인 | 샘플의 제목/설명/관리 icon/다음 이동 재사용. 판정/가드/이력/포커스 불변 |
| /qa/sprints/:id/checklist/1·2 | 체크리스트 | 이미 적용된 샘플 유지, 항목/종료/이력 창과 common copy만 전파 |
| /qa/sprints/:id/fix-reports | 수정사항 | 고정 안내·수치 tabular·기존 원문 파일명/다운로드/권한/blob 그대로 |

## 4. 코드 변경 (스키마 → API → 훅 → 컴포넌트 → 페이지 → 라우트 순)

| 파일 | 단위 | 변경 |
|---|---|---|
| features/qa/copy.ts | 고정 copy | §7의 기존 키·신규 공용 literal 키. 샘플14키/원문/함수 의미 보존 |
| shared/api/qaClient.ts | fallback |3개 문자열만. Zod parse/HTTP 분기/재발급·서버 message 우선순위 불변 |
| schemas/api/queries/mutations·router·mocks | 계약/상태 | 변경 없음. schema가 참조하는 copy의 톤만 전파 |
| DesignReviewItem·DesignReviewPanel | 고유 표시 | 설명 body/중립·반복 상자 제거·제목600·관리Pencil/Trash2와 기존 aria 이름·같은열·다음 이동 default/공용copy |
| SprintCreateModal·CloseSprintModal·QaConfirmModal·DesignItemFormModal·ChecklistItemFormModal | 창 | 빠져나가기 닫기·안내·실제 대기/reduced. 등록/종료/시작 행동 이름만 명확하게, 나머지 구체 행동(수정/삭제/승인/거절)은 그대로 |
| QaStageActivity·QaStatusIcon·SetupPanel·ReflectionPanel | 모션/읽기 | 기존 실제 대기 회전1200/reduced none, 반복 탭/셀색 보간 삭제. raw ref/Markdown/message 보존 |
| CellHistoryModal·DesignHistoryModal·SetupJobSteps·FixReportsPanel·StageStepper | 읽기 | 사유/설명 body·수치 tabular, 기존 순서/집계/툴팁/aria 그대로 |
| QA_STATUS_CATEGORIES.running | 의미 신호 | 실행 상태의 작은 아이콘은 중립 데이터. 실제 성공/실패/사람조치 색 유지 |
| SprintStatusBadge | 목록 진행 상태 | CLOSED의 실제 완료 성공색은 유지, 비조작 진행 상태의 primary를 muted로 연결. 원문 상태/라벨/props 의미 그대로(V2·V8) |
| QaSprintListPage·SprintHeader | 골격 | 목록 소개만 삭제·min-height, 탭 보간 제거. 셸/제목/6단계/5탭 순서 유지 |
| QaConfirmModal.test.tsx·tests/e2e/qa*.ts | 회귀 | 실제 콜백/잠금/원문·문구 기대값 갱신. 전체 기존 QA 회귀 유지 |

## 5. API 계약 영향 (`docs/spec/03_gravit_admin_api_spec.md`, 별도 서비스는 해당 D 항목)

없음 — 별도 QA 계약 D9/D11~13의 필드/요청/응답/낙관 잠금·오류·판정·집계·polling·blob을 바꾸지 않아요. 서버 문자열/원문은 옮겨 쓰거나 해요체로 고치지 않아요. QA fallback만 알려진 뜻을 유지해요.

## 6. 상태 4종

| 상태 | 조건 | 화면 동작 |
|---|---|---|
| 로딩 | 기존 isLoading/pending/실행 단계 | 정적 skeleton·기존 activity 우선. 실제 대기 회전1200, reduced정적과 라벨 |
| 빈 | 기존 목록/features/history/reflections=[] | 같은 영역의 해요체 안내. 등록 가능 조건·DRAFT 잠금 유지 |
| 오류 | 기존HTTP·version/503 등 | 서버 message 우선·503 fixed fallback·retry/잠금/모달 유지·재조회 조건 불변 |
| 정상 | 기존 MSW | 동일 3열·5탭·6단계·4게이지·판정/이력/파트/집계·원문·권한 |

## 7. 문구

copy.ts/qaClient의 해당 기존 literal과 관련 프론트 안내만 아래처럼 바꿔요(W1·W2·W9·W12). 서버/목 본문은 보존해요.

| 현재 | 변경 | 근거 |
|---|---|---|
| 스프린트별 QA 현황을 확인합니다. | 스프린트별 QA 현황을 확인해요. | W1·W2·W12(오류만) |
| 등록된 스프린트가 없습니다. Notion 스프린트 페이지를 연결해 시작하세요. | 등록된 스프린트가 없어요. Notion 스프린트 페이지를 연결해 시작해 주세요. | W1·W2·W12(오류만) |
| Notion 스프린트 DB의 행 페이지 URL을 붙여 넣으세요. 페이지에 QA Integration이 연결돼 있어야 합니다. | Notion 스프린트 DB의 행 페이지 URL을 붙여 넣어 주세요. 페이지에 QA Integration을 연결해야 해요. | W1·W2·W12(오류만) |
| 변경 이력이 없습니다. | 변경 이력이 없어요. | W1·W2·W12(오류만) |
| 준비 작업을 시작하면 연결 상태를 확인합니다. | 준비 작업을 시작하면 연결 상태를 확인할 수 있어요. | W1·W2·W12(오류만) |
| 반영할 제안이 없습니다. | 반영할 제안이 없어요. | W1·W2·W12(오류만) |
| 화면을 떠나도 서버에서 계속 진행됩니다. | 화면을 떠나도 서버에서 계속 진행해요. | W1·W2·W12(오류만) |
| 판정 결과가 미검수로 초기화됩니다. | 판정 결과를 미검수로 초기화해요. | W1·W2·W12(오류만) |
| 대기·실패 상태의 반영 제안이 삭제되고 명세를 다시 수집합니다. | 대기·실패 상태의 반영 제안을 삭제하고 명세를 다시 수집해요. | W1·W2·W12(오류만) |
| 제안 이후 명세가 바뀌었습니다. 연결 현황에서 다시 수집해 주세요. | 제안 이후 명세가 바뀌었어요. 연결 현황에서 다시 수집해 주세요. | W1·W2·W12(오류만) |
| 디자인 검수와 1·2차 체크리스트의 모든 미검수를 처리해야 종료할 수 있습니다. | 디자인 검수와 1·2차 체크리스트의 모든 미검수를 처리하면 종료할 수 있어요. | W1·W2·W12(오류만) |
| Notion 스프린트 페이지 URL을 입력하세요. | Notion 스프린트 페이지 URL을 입력해 주세요. | W1·W2·W12(오류만) |
| URL 형식이 올바르지 않습니다. | URL 형식이 올바르지 않아요. | W1·W2·W12(오류만) |
| 행위를 입력하세요. | 행위를 입력해 주세요. | W1·W2·W12(오류만) |
| 설명을 입력하세요. | 설명을 입력해 주세요. | W1·W2·W12(오류만) |
| 파트를 1개 이상 선택하세요. | 파트를 1개 이상 선택해 주세요. | W1·W2·W12(오류만) |
| 단계 작업이 실행 중입니다. 작업이 끝나면 수정사항을 확인할 수 있습니다. | 단계 작업을 실행하고 있어요. 작업이 끝나면 수정사항을 확인할 수 있어요. | W1·W2·W12(오류만) |
| 파일을 내려받고 있습니다. 잠시 기다려 주세요. | 파일을 내려받고 있어요… | W1·W2·W12(오류만) |
| 내려받는 중 | 내려받고 있어요… | W1·W2·W12(오류만) |
| Notion 페이지를 찾을 수 없습니다. URL과 QA Integration 연결을 확인하세요. | Notion 페이지를 찾을 수 없어요. URL과 QA Integration 연결을 확인해 주세요. | W1·W2·W12(오류만) |
| 이미 등록된 스프린트입니다. | 이미 등록한 스프린트예요. | W1·W2·W12(오류만) |
| 다른 운영자가 먼저 변경했습니다. 최신 내용을 다시 불러왔습니다. | 다른 운영자가 먼저 변경했어요. 최신 내용을 다시 불러왔어요. | W1·W2·W12(오류만) |
| 검수가 완료되지 않아 파일을 내려받을 수 없습니다. 최신 상태를 다시 불러옵니다. | 검수를 마치면 파일을 내려받을 수 있어요. 최신 상태를 다시 불러와요. | W1·W2·W12(오류만) |
| 스프린트를 등록했습니다. | 스프린트를 등록했어요. | W1·W2·W12(오류만) |
| 준비 작업을 시작했습니다. | 준비 작업을 시작했어요. | W1·W2·W12(오류만) |
| 작업 취소를 요청했습니다. | 작업 취소를 요청했어요. | W1·W2·W12(오류만) |
| 항목을 추가했습니다. | 항목을 추가했어요. | W1·W2·W12(오류만) |
| 항목을 수정했습니다. | 항목을 수정했어요. | W1·W2·W12(오류만) |
| 항목을 삭제했습니다. | 항목을 삭제했어요. | W1·W2·W12(오류만) |
| 스프린트를 종료했습니다. | 스프린트를 종료했어요. | W1·W2·W12(오류만) |
| 인증 서버 응답이 없어 권한을 확인하지 못했습니다. 잠시 후 다시 시도하세요. | 인증 서버가 응답하지 않아 권한을 확인하지 못했어요. 잠시 뒤 다시 시도해 주세요. | W1·W2·W12(오류만) |
| QA 메뉴를 사용할 권한이 없습니다. | QA 메뉴를 사용할 권한이 없어요. | W1·W2·W12(오류만) |
| 요청을 처리하지 못했습니다. 잠시 후 다시 시도하세요. | 요청을 처리하지 못했어요. 잠시 뒤 다시 시도해 주세요. | W1·W2·W12(오류만) |
| 진행 중인 단계가 끝나면 작업을 멈춥니다. | 진행 중인 단계가 끝나면 작업을 멈춰요. | W1·W2·W12(오류만) |

| 위치 | 현재 → 변경 | 근거 |
|---|---|---|
| 모달 하단 | 취소 → 닫기 | W8·콜백/dirty 확인 그대로 |
| 등록 확인 | 등록 → 스프린트 등록하기 | W7 |
| 종료 확인 | 종료/다시 시도 → QA 종료하기/QA 종료 다시 시도하기 | W7 |
| 준비 시작 | 시작/다시 시도 → 준비 작업 시작하기/준비 작업 다시 시도하기 | W7 |
| 디자인 진행 | 디자인 검수 중입니다. → 디자인 검수를 진행하고 있어요… | W1·M1 |
| 디자인 다음 | 다음 미검수 → 다음 미검수로 이동(copy 기존 키) | W7 |
| 종료 안내 | Fail {N}건은 미해결로 남습니다. 종료 후에는 판정을 바꿀 수 없습니다. → Fail {N}건은 미해결로 남아요. 종료 후에는 판정을 바꿀 수 없어요. | W1·의미/집계 유지 |
| 삭제 경고 | 삭제한 항목은 되돌릴 수 없습니다. → 샘플 ITEM_DELETE_IRREVERSIBLE 재사용 | W1·P5 |
| 제출 검증 | 필수 항목을 확인해주세요. → 필수 항목을 확인해 주세요.(중앙 copy 키) | W1 |

## 8. 고칠 명세

| 파일 | 절 | 내용 |
|---|---|---|
| DS-STYLE-02·REPORT·STAGE5 | 단계5C | 디자인 잔여·문구/모션/4상태·실제 증거/남은 과제 |
| 이 계획 | Deviation Log·검증 | 차이·검사/캡처/최신지침·모션판정 |

## 9. 테스트 계획

| 종류 | 파일 | 확인 |
|---|---|---|
| 단위 | QaConfirmModal.test.tsx | 원문/확인·닫기 콜백·disabled/pending·기존 잠금 유지, 새 닫기 변경 전 red |
| e2e | 기존qa-flow-v2/qa-followup/qa-h2/qa-response-contract | 문구 기대만 갱신, 판정·버전/0사유/500자·원문/이력·요청없음/목 API·종료/재수집/다운로드 그대로 |
| e2e | style-qa.spec.ts | 디자인 다음 이동/기존 접근 이름·등록 pending/reduced·닫기/원문 보존 |
| 목 | qaHandlers·qaChecklist 재사용 | 변경0. 필요한 표시 지연/오류는 브라우저/테스트에서 기존 요청만 hold·계약 응답 재사용 |
| 전체/UI | check·test·전체e2e·check:full·verify-ui/최신web/모션 | 두 폭/4상태·하위 탭/모달/기존샘플·reduced·레이아웃/원문 검증 |

## 10. 확인할 화면 (verify-ui)

| 경로 | 목 조건 | 볼 것 | 전 캡처 | 후 캡처 |
|---|---|---|---|---|
| /qa/sprints·/qa/sprints/1/setup | 기존 정상·목록empty/503 |3열/위치·연결/명세/원문·4상태 | before/·after/shared 대응 PNG 보존 | after/qa/기본/상태 |
| /qa/sprints/9/design-review | 기존 완료/수동 판정 가능 항목 | 고유 제목/설명/다음이동/관리·동일열/잠금/이력 | before/qa-design-normal·sample 공유전파 | after/qa/디자인/관리/이력 |
| /qa/sprints/2/checklist/1·2 | 기존 동일 fixture | 샘플 재사용·항목창·판정·이력 | before/·after/sample 보존 | after/qa/동일 |
| /qa/sprints/9/fix-reports | 기존 준비완료/0건/다운로드 |4카드/원문 파일명/집계·상태 | before/·after/shared 대응 | after/qa/동일 |
| 등록/종료/항목/재수집 창 | 기존 목·실제 요청 보류·reduced | 의미/닫기·안전 조건·실제대기만·회전off | 필요한 pending만 source전 baseline-extra/qa 보충 | after/qa/모달/대기/reduced |
| /qa/sprints/4/design-review | 기존 실행 중 | activity/reduced·raw서버원문 | 기존before/샘플running 보존 | after/qa/activity |

1280/1440×900·긴 디자인/연결화면 full 보충. 최종 전체25화면은 단계6에서 별도 기록해요. 셸/본문/제목·6단계/탭/게이지/도구/그룹 순서·overflow 실측. 고포트localhost·명명 세션·완료 후 종료해요.

## 11. 결정 필요

없음 — 승인된 샘플/H1/T1의 표시/문구/모션만. newAPI/props의미/경계/의존성이 필요하면 변경 전에 질문해요. 기존 동작 결함을 섞지 않아요.

## Deviation Log

| 날짜 | 계획 | 실제 | 이유 |
|---|---|---|---|
| 2026-11-14 | 계획 먼저 | 현 T1 연속 진행 승인으로 이 계획을 코드 전에 기록 | 승인된 방향 재제안 없음 |
| 2026-11-14 | literal/e2e 이관 | 첫 전체116통과/4실패 후 부분 문자열2패턴(재수집1/활동3)을 갱신 | 서버 원문이 아니라 바뀐 프론트 copy의 부분 기대가 남았음 |
| 2026-11-14 | 비조작 상태 중립 | 화면 점검에서 목록 SprintStatusBadge의 primary 잔여를 발견, 적용 전 계획에 추가 후 muted로 연결 | V2·V8의 승인된 색 역할. enum·라벨·props/조건 의미 불변 |
| 2026-11-14 | 실측 비교 | 구 manifest의 meter-role 항목을 실제 heading에서 분리하고 1/2차는 샘플과도 비교 | 도구 선택자 차이를 UI 변화로 오판하지 않도록 원본 증거는 그대로 보존 |

## 검증 결과

| 명령·점검 | 결과 |
|---|---|
| npm run check | 최종 check:full 내부exit0·ESLint0오류/기존4경고·token-lint |
| npm run test | exit0 —18파일65개 통과·실패0. 새3개, red2실패/1통과 |
| npm run test:e2e | exit0 —120개 통과·실패0. 최종 배지 조정 뒤 전체 재실행 |
| npm run check:full | exit0 — 타입·ESLint·token-lint·빌드. 기존 Browserslist/chunk 경고 |
| verify-ui 점검표 | [REPORT §15](../experiments/style/REPORT.md)·[42PNG](../experiments/style/after/qa/manifest.json)·[실측12행](../experiments/style/after/qa/layout-comparison.json)·[원문](../experiments/style/after/qa/verification/) |

## 자기 점검

- [x] 명세에 없는 endpoint/필드/쿼리 없음
- [x] 상태4종 조건/동작 있음
- [x] QA copy 소유/서버 원문 경계 보존
- [x] feature 직접 import 추가 없음
- [x] 단위/e2e·목 재사용/표시 hold 범위 있음
- [x] 경로/목 조건/전후 화면 목록 있음

## 실제 UI·모션 점검

| 위치 | 점검·결과 | 처리 |
|---|---|---|
| DesignReviewItem.tsx | 설명14/22·N600·반복 상자 제거·관리icon의 기존 수정/삭제 aria이름·title/aria-hidden | 샘플 위계 적용(V1·V4·V7), callback/열/잠금/원문 유지 |
| DesignReviewPanel.tsx | 다음 이동 default파랑·공용copy | 기존 대상/접힘/포커스 흐름을 e2e 검증(P4·W7) |
| SprintStatusBadge.tsx·status.ts | 비조작 진행 배지/아이콘 중립·완료/실패/조치 필요 의미색 유지 | 최종 목록 원본 직접 확인. 상태/검색 원문 보존(V2·V8) |
| QaConfirm/Create/Close·항목/이력 창 | 닫기/구체 행동·raw입력/사유·busy/locked·500자/빈 사유 | unit65/e2e120으로 기능·원문·잠금 확인. 초기 Escape 경합은 별도 기존 과제 |
| qaClient.ts:23 | fallback3문구만 변경 | serverMessage/503고정/401공유 재발급/403종착/parse/재시도 로직 diff0 |
| tab/cell·실제 pending | 잦은 색/opacity 보간 제거·기존 회전만1.2초·reduced name none/animation0 | 실제 요청은 MSW전용 hold·라벨 유지·새 indicator0 |
| 기존 접근성 | DataTable행 진입·skip link·입력/일부 아이콘·heading계층 등 | 승인된 스타일 경계 밖의 동작/시맨틱 후보로 보존 |
| 레이아웃 |12행 모두 셸 x/폭·heading순서 같음·h1 y0·overflow0. 목록 표+2px, 디자인 내부행밀도 개선 | 1/2차 샘플 비교 y차이0~0.5px(기록 반올림), 기존 공유 단계의 행 밀도 차이는 샘플 적용분 |
| 캡처 | 정상12·pending/reduced/activity10·상태/이력/폼/종료16·full4=42. 전pending/activity6장 보충 | before/shared/sample/운영/학습 원본 보존 |

### review-animations

| Before | After | Why |
|---|---|---|
| 탭 transition-colors·표셀 transition-opacity | 삭제·상태/선택 즉시 | 자주 읽는 이동·판정에 불필요 보간 제거(M1·M6) |
| 실제 대기 spinner 기본1초·일부reduced없음 | 기존 조건에서1200ms linear transform·reduced정적 | 상태 신호만·같은 토큰·이동 off(M1·M4·M5) |

판정 **Approve** — 본문/차트/게이지 진입 없음, 실제 대기 외 신규회전0·reduced 회전0, 요청 종료 시 기존조건대로 즉시제거. 반복1.2초는 승인 loading-cycle, UI 진입300ms 기준과 구분해요. 공용overlay/메뉴 수명·툴팁/포커스·hover범례 조건은 바꾸지 않았어요. 최신 Web Interface Guidelines를2026-11-14 다시 받아 변경 파일에 적용했어요.
