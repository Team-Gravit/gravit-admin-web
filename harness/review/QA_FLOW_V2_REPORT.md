# QA 흐름 v2 구현 결과

## §A. 범위

- 기준: D11, 사용자 W1~W14 + P1~P10 및 2026-11-11 승인 조정.
- 목록 3열(필터·실패·행별 상세 요청 없음), 상세 6단계/4탭, 연결/승인, 디자인, 1·2차 검수, 항목 관리/이력/종료.
- 새 하네스 6개 항목 모두 COMPLETED. 기존 H1/H2는 TODO 그대로이며 다음 재개 지점은 fix:H1-CN_FONT_SIZE.

## §B. 변경 사항

- 커밋·푸시: 사용자 승인(2026-11-11). 이 보고서의 검증 기준 HEAD는 `8b33c683add47a3fbf2be86960c5419d3b96c6e0`이며, 실제 생성 커밋과 원격 반영 결과는 최종 응답으로 보고합니다.
- index.html은 사용자 승인에 따라 HEAD 원본으로 복원했으며 최종 diff는 없습니다.
- architecture-reviewer.md, .env.development, QA_SPEC.md, RAVVIT_SPEC.md와 rewrite/proxy 파일은 작업 전 해시와 동일합니다.

### 추가 (20개)

- `.claude/resource/phases/step-12-qa-flow-v2.md`
- `.claude/resource/smoke/qa-flow-v2.spec.ts`
- `harness/review/QA_FLOW_V2_REPORT.md`
- `harness/review/step-12:QA_FLOW_V2-CHECKLIST.json`
- `harness/review/step-12:QA_FLOW_V2-CONTRACT.json`
- `harness/review/step-12:QA_FLOW_V2-DESIGN.json`
- `harness/review/step-12:QA_FLOW_V2-LIST.json`
- `harness/review/step-12:QA_FLOW_V2-SETUP.json`
- `harness/review/step-12:QA_FLOW_V2-VERIFY.json`
- `src/features/qa/components/ConnectionStatusCard.tsx`
- `src/features/qa/components/DesignHistoryModal.tsx`
- `src/features/qa/components/DesignReviewItem.tsx`
- `src/features/qa/components/DesignReviewPanel.tsx`
- `src/features/qa/components/FeatureGroupHeader.tsx`
- `src/features/qa/components/ProgressGauges.tsx`
- `src/features/qa/components/QaConfirmModal.tsx`
- `src/features/qa/components/ReflectionPanel.tsx`
- `src/features/qa/components/SprintStatusBadge.tsx`
- `src/features/qa/useNextUnchecked.ts`
- `src/pages/qa/QaDesignReviewPage.tsx`

### 수정 (29개)

- `.claude/build-state.json`
- `.claude/rules/decisions.md`
- `src/app/router.tsx`
- `src/features/qa/api.ts`
- `src/features/qa/components/CellHistoryModal.tsx`
- `src/features/qa/components/CheckCellButton.tsx`
- `src/features/qa/components/ChecklistItemFormModal.tsx`
- `src/features/qa/components/ChecklistPanel.tsx`
- `src/features/qa/components/CloseSprintModal.tsx`
- `src/features/qa/components/PartChips.tsx`
- `src/features/qa/components/QaChip.tsx`
- `src/features/qa/components/SetupJobSteps.tsx`
- `src/features/qa/components/SetupPanel.tsx`
- `src/features/qa/components/SprintHeader.tsx`
- `src/features/qa/components/StageStepper.tsx`
- `src/features/qa/copy.ts`
- `src/features/qa/errorView.ts`
- `src/features/qa/labels.ts`
- `src/features/qa/mutations.ts`
- `src/features/qa/queries.ts`
- `src/features/qa/schemas.ts`
- `src/features/qa/screens.ts`
- `src/mocks/qaChecklist.ts`
- `src/mocks/qaHandlers.ts`
- `src/pages/qa/QaChecklistPage.tsx`
- `src/pages/qa/QaSprintIndexPage.tsx`
- `src/pages/qa/QaSprintLayout.tsx`
- `src/pages/qa/QaSprintListPage.tsx`
- `src/shared/constants/routes.ts`

### 삭제 (11개)

- `src/features/qa/components/BaselineCard.tsx`
- `src/features/qa/components/ClassificationBadges.tsx`
- `src/features/qa/components/ConfirmChecklistModal.tsx`
- `src/features/qa/components/NextActionBanner.tsx`
- `src/features/qa/components/PartProgressBars.tsx`
- `src/features/qa/components/ReviewFeatureGroup.tsx`
- `src/features/qa/components/ReviewItemRow.tsx`
- `src/features/qa/components/ReviewPanel.tsx`
- `src/features/qa/components/SprintStageBadge.tsx`
- `src/features/qa/links.ts`
- `src/pages/qa/QaReviewPage.tsx`

## §C. 명세 준수

| 기준 | 구현 |
|---|---|
| W1~W4 | 목록 3열, 설명 헤더, 6단계, 4탭 및 상태별 index 진입. review/기존 checklist 경로 삭제. |
| W5~W7·P2·P5·P6 | 연결 5대상, 단계별 시도·메시지(DONE 포함), 전후 Markdown 좌우 비교, 실패 사유/재승인/거절, 확인 후 재수집. |
| W8~W12·P9 | 화면 번호/이름/변경/서버 완료율, 작은 배경 설명, 관련 파트, 범례·거절 토글 제거, 다음 미검수, Design/Web/APP/Server 반원형 게이지. |
| W13~W14·P8·P10 | 즉시 확정 항목 CRUD, 수정 전 초기화 확인, 실행 중 버튼 및 확인창 잠금, AUTO 수동 변경/이력 사유 보존. |
| P1·P7 | 기존 JobResponse 유지, 시작 응답 jobId 조회, 체크리스트 round 필수 및 캐시 분리. |
| P3·P4 | Figma 프레임 없음 일반 항목+사유, 디자인/1차/2차 전체 미검수 종료 조건, SPRINT_5022 메시지/미종료/재시도. |

- Figma 시안 미제공: 승인 와이어프레임·기존 백오피스 패턴·DS-01 토큰으로 구현. 신규 의존성 없음.
- 공통 컴포넌트 동작과 인증 재발급 로직은 변경하지 않았습니다. QA 전용 확인창만 추가했습니다.

## §D. 게이트

| 검사 | 결과 |
|---|---|
| npm run lint | PASS: 0 errors, 기존 react-refresh 경고 4개 |
| npm run build / 최종 하네스 typecheck + build | PASS |
| npm run test:e2e / 최종 smoke | PASS: 최종 30개(새 QA 27개 + 기존 3개) |
| gate-runner.sh --with-smoke | OK: state / typecheck / token-lint / build / smoke |
| git diff --check / 보호 파일·기존 checklist 비교 | PASS |
| 독립 spec / DS 리뷰 | 최초 지적 보완 후 둘 다 PASS |

- 초기 폼 e2e 2건은 필수 *가 붙은 레이블 선택자 문제로 실패했고 보정 후 통과했습니다. 이후 전체 28건 통과, 파이프라인 2건 추가 후 최종 전체 30건 통과했습니다.
- 1차 리뷰 지적(동적 목 KST 시각, 삭제 충돌 복구, 빈 meter 속성, pending 표시, 확인창 동적 잠금)을 보완하고 재리뷰 PASS를 받았습니다.
- 빌드의 기존 Browserslist 데이터/큰 chunk 안내는 비차단입니다. 범위 밖 번들 구조·공통 lint 경고는 변경하지 않았습니다.

## §E. 동작 확인

- 로딩/빈 목록/미생성 목록/503 조회 오류/정상 데이터를 확인했습니다.
- 등록 URL 검증, 4개 탭 및 기본 진입, 승인 실패 후 새 version으로 재승인, 거절/재수집/명세 변경 충돌을 확인했습니다.
- round 분리, 자동 판정 수동 변경·해당 없음·원래 사유 이력, 접힌 그룹 펼침·다음 미검수 포커스·파트 필터를 확인했습니다.
- 수정 전 초기화 확인과 셀/이력 초기화, 추가/삭제/삭제 충돌, 미저장 폼 닫기 보호, 준비 중 관리 버튼 잠금을 확인했습니다.
- 준비 시작 응답 jobId/3초 polling, 다른 탭에서 완료 반영(선택한 탭 유지), 실패 단계 재시도와 취소를 확인했습니다.
- 종료는 2차 탭에서만 제공되며 디자인 미검수도 차단합니다. 종료 기록 실패 시 모달 유지/재시도 및 종료 뒤 읽기 전용·이력 조회를 확인했습니다.
- Playwright 1280px/1440px 시각 확인: 가로 overflow 없음, JavaScript pageerror 없음. 독립 DS 리뷰어도 화면 이미지를 확인했습니다.

## §F. 남은 일

- 구현한 MSW 계약에서 알려진 차이는 없습니다. 실제 QA 서버 변경 요청은 보내지 않았습니다.
- 서버 배포 후 실제 nullable/enum/round·cell ID 분리, Job/WAITING, 반영 실패 영속화/재승인/충돌, AUTO 이력, 항목 수정 초기화, 종료 기준점 실패와 401/403/503 인증 흐름을 통합 확인해야 합니다.
- 각 항목 리뷰: `harness/review/step-12:QA_FLOW_V2-{CONTRACT,LIST,SETUP,DESIGN,CHECKLIST,VERIFY}.json`.
- 사용자 승인에 따라 QA 변경만 커밋하고 origin/main에 푸시합니다. 보호 대상 작업 전 변경은 커밋에 포함하지 않습니다.
