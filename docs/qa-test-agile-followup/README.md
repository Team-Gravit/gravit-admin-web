# Test Agile 후속 QA 화면 개선 보고

2026-11-12(KST)에 main `0b6906d` 기준으로 구현했습니다. 서버 계약을 변경하지 않았으며, 실서버에 쓰기 요청을 보내지 않고 MSW 목과 Chromium으로 검증했습니다.

| 요청       | 반영 결과                                                                                                                                                                                   | 주요 파일                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| D-3        | 체크 셀 메뉴는 미검수·Pass·Fail만 제공합니다. API 요청 타입에서도 해당 없음을 제외했습니다.                                                                                                 | `CheckCellButton.tsx`, `api.ts`, `schemas.ts`                |
| D-5·F-2    | CLOSED는 6단계 모두 완료입니다. 완료는 초록 체크, 실패는 빨강 X, 현재는 보라 번호, 이후는 회색 점선 원입니다. 옆 실패 배지를 제거했습니다.                                                  | `StageStepper.tsx`                                           |
| F-1·F-5    | 연결·준비 단계·반영 제안·체크 셀·디자인 판정을 공통 아이콘으로 표시합니다. 탭 오른쪽 (i) 버튼에서 범례를 엽니다.                                                                            | `status.ts`, `QaStatusIcon.tsx`, 각 상태 표시 컴포넌트       |
| F-3        | `latestJob.lastError` 상단 배너를 제거했습니다. 실패 단계의 메시지는 해당 단계 아래에 표시합니다.                                                                                           | `SetupPanel.tsx`                                             |
| F-4·F-15   | 우상단 현재 단계 배지를 QA 종료 버튼으로 바꿨습니다. 모든 탭에서 디자인·1차·2차 전체 목록으로 종료 조건을 확인합니다. 비활성 사유는 버튼 아래 툴팁으로 표시하며 키보드 포커스도 지원합니다. | `SprintHeader.tsx`, `QaCloseAction.tsx`                      |
| F-6        | 디자인 검수·체크리스트 생성·1차 자동화 검수가 실행 중이면 해당 탭에 회전 표시와 안내를 제공합니다. 실행 중에는 빈 목록 안내를 표시하지 않습니다.                                            | `QaStageActivity.tsx`, `queries.ts`, 두 검수 패널            |
| O-1·O-2    | 저장소 라벨에서 release를 제거하고 서버의 ref를 그대로 표시합니다. ref가 null이면 생략합니다.                                                                                               | `labels.ts`, `ConnectionStatusCard.tsx`                      |
| F-7        | 진행도는 진입 시 0부터 650ms 동안 채워집니다. reduced motion이면 최종값을 즉시 표시합니다. 진행률 집계는 서버 값으로 유지합니다.                                                            | `ProgressGauges.tsx`, `usePrefersReducedMotion.ts`           |
| F-8·F-9    | 해당 없음은 자물쇠만 표시하고 접근성 이름·툴팁을 제공합니다. 같은 너비의 파트 열과 아이콘 중심을 맞추고 화살표는 중심 배치에 영향을 주지 않도록 배치했습니다.                               | `CheckCellButton.tsx`, `ChecklistPanel.tsx`                  |
| F-10       | 화면 묶음 머리의 배경 대비와 하단 경계를 강화했습니다.                                                                                                                                      | `FeatureGroupHeader.tsx`                                     |
| F-11·C1    | 디자인도 항목 / Web / APP / 항목 관리 표로 구성했습니다. 해당 플랫폼 열의 상태 메뉴는 미검수·Pass·Fail·해당 없음·변경 이력을 제공합니다.                                                    | `DesignReviewItem.tsx`, `DesignReviewPanel.tsx`              |
| C5·C6      | 디자인 제목·설명 PATCH와 버전 포함 DELETE를 구현했습니다. 수정 시 초기화를 확인하고, 삭제 시 되돌릴 수 없음을 안내합니다. 버전 충돌은 재조회 후 확인창을 닫습니다.                          | `DesignItemFormModal.tsx`, `api.ts`, `mutations.ts`          |
| F-12       | 두 이력 모달의 제목을 변경 이력으로 통일하고 폭을 768px로 확대했습니다. 상태·시각·출처는 한 줄이며 출처는 한 번 표시합니다. 수동 판정에는 운영자 정보를 덧붙입니다.                         | `CellHistoryModal.tsx`, `DesignHistoryModal.tsx`             |
| F-13·C2    | 셀·셀 이력에 `evidence: [{path, startLine, endLine}]`를 추가했습니다. 누락 시 빈 배열로 파싱합니다. UI는 reason을 그대로 표시하고 evidence는 표시하지 않습니다.                             | `schemas.ts`, 이력 모달                                      |
| F-14·C3·C4 | 항목 추가는 2차에만 표시하고 분류 입력을 제거했습니다. 생성 요청에는 MANUAL을 계속 보냅니다. AUTO 수정에만 수동(2차)으로 옮기기 선택지를 제공합니다.                                        | `ChecklistItemFormModal.tsx`, `ChecklistPanel.tsx`, `api.ts` |
| F-16       | 중앙 배치를 CSS `translate`로 유지하고 별도의 `transform`에서 fade·scale을 적용합니다. reduced motion이면 모달 애니메이션을 생략합니다.                                                     | 공용 `dialog.tsx`, `globals.css`                             |
| F-17       | 저장 중 회전 표시를 제거했습니다. 응답을 받기 전까지 현재 판정 아이콘을 옅게 유지하며 성공 시 새 판정, 실패 시 기존 판정과 오류 안내를 제공합니다.                                          | 체크 셀·디자인 행, `mutations.ts`                            |

범주별 아이콘은 다음과 같습니다. 단계의 PENDING은 대기이며, 반영 제안의 PENDING은 사람 조치 필요로 구분합니다.

| 범주           | 아이콘       | 상태                                  |
| -------------- | ------------ | ------------------------------------- |
| 성공           | CircleCheck  | 완료, 연결됨, APPLIED, Pass           |
| 실패           | CircleX      | 실패, Fail                            |
| 사람 조치 필요 | CircleAlert  | WAITING, 반영 PENDING                 |
| 진행 중        | LoaderCircle | RUNNING, QUEUED, 반영 APPROVED        |
| 대기·미검수    | CircleDashed | 준비 PENDING, UNCHECKED, 연결 확인 전 |
| 제외           | Lock         | 해당 없음, 거절, 취소, 건너뜀         |

| 검증               | 결과                                                                                                                       |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `npm run build`    | 통과했습니다.                                                                                                              |
| `npm run lint`     | 오류 0건으로 통과했습니다. 기존 `badge.tsx`, `button.tsx`, `useBreadcrumb.tsx`의 Fast Refresh 경고 총 4건은 남아 있습니다. |
| `npm run test:e2e` | Chromium 56개 모두 통과했습니다. 최종 실행은 34.4초였습니다.                                                               |
| 신·구 셀 계약      | evidence 포함·누락 응답, 셀·이력 파싱, reason만 표시하는 동작을 검증했습니다.                                              |
| C1·C5·C6           | 새 계약의 판정·내용 수정·삭제 및 옛 서버의 400·404를 목으로 검증했습니다. 실제 서버 배포 상태는 확인 필요입니다.           |
| C3·C4              | 생성 요청의 MANUAL 유지, 서버 목의 MANUAL 고정, AUTO→MANUAL 이동, 역방향·동일 분류 요청 거부를 검증했습니다.               |
| 판정 요청          | 셀·디자인 각각 지연 성공과 실패, 현재 아이콘 유지, 오류 안내를 검증했습니다.                                               |
| 버전 충돌          | 체크리스트 및 디자인 수정·삭제의 409 처리를 검증했습니다.                                                                  |
| 접근성·모달        | 키보드 툴팁·범례 열기/닫기·포커스 복원, 모달 등장 중 중앙 유지, Escape 닫기, reduced motion을 검증했습니다.                |
| 화면 캡처          | 변경 전 7장·변경 후 13장입니다. 변경 후 캡처 과정의 페이지 오류는 0건이었습니다.                                           |

일반 모션 설정에서 Design 값이 0%부터 33%까지 증가하는 프레임을 확인했습니다. reduced motion의 즉시 최종값 표시는 E2E로 확인했습니다.

공용 변경의 영향은 다음과 같습니다.

| 공용 대상       | 다른 화면 영향                                                                                                                   | 확인 범위                                                                                                                         |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| StatusBadge     | 기존 글자 배지를 유지합니다. QA만 전용 아이콘을 사용합니다.                                                                      | 사용자·문의·신고·공지·스테이징 배지는 변경하지 않았습니다.                                                                        |
| Dialog          | 공용 확인·미저장·등록·편집 모달의 등장 효과가 중앙 fade·scale로 바뀝니다.                                                        | QA 등록·이력·편집·확인, 스테이징 반영 확인, 사용자 역할 변경 흐름을 E2E로 확인했습니다. 그 밖의 개별 화면 수동 확인은 필요합니다. |
| `cn`의 폭 토큰  | 사용자 지정 max-width가 기본 폭을 올바르게 덮어쓰도록 등록했습니다. 기본 모달은 400px, wide는 480px, QA 이력은 768px입니다.      | QA 이력 768px과 스테이징 wide 480px을 확인했습니다.                                                                               |
| Tooltip·Popover | 기존 Radix 계열을 사용했습니다. 기존 Dialog·DropdownMenu와 내부 레이어 버전이 같은 Tooltip 1.2.8, Popover 1.1.15로 고정했습니다. | 상태 메뉴에서 이력 모달을 열고 닫은 후 재클릭하는 흐름과 범례 Escape 닫기를 확인했습니다.                                         |

실서버 C1·C5·C6의 운영 동작과 C2의 실제 evidence 응답은 **확인 필요**입니다. 제공된 F2 계약으로 목을 작성했으며, 서버가 배포된 뒤 운영에서 확인해야 합니다.

캡처는 Chromium, 1440×1100 뷰포트, reduced motion 설정으로 촬영한 정지 화면입니다. 변경 전은 구현 전 main 코드의 목이며, 변경 후 목에는 qa-baseline ref·구조화된 evidence·해당 없음 셀을 추가했으므로 일부 집계 수치도 다릅니다.

| 화면           | 변경 전                                                  | 변경 후                                                 |
| -------------- | -------------------------------------------------------- | ------------------------------------------------------- |
| 연결 현황      | ![변경 전 연결 현황](images/before-setup.png)            | ![변경 후 연결 현황](images/after-setup.png)            |
| 준비 실패      | ![변경 전 준비 실패](images/before-setup-failed.png)     | ![변경 후 준비 실패](images/after-setup-failed.png)     |
| 디자인 검수    | ![변경 전 디자인 검수](images/before-design.png)         | ![변경 후 디자인 검수](images/after-design.png)         |
| 1차 체크리스트 | ![변경 전 1차](images/before-checklist-1.png)            | ![변경 후 1차](images/after-checklist-1.png)            |
| 2차 체크리스트 | ![변경 전 2차](images/before-checklist-2.png)            | ![변경 후 2차](images/after-checklist-2.png)            |
| 셀 이력        | ![변경 전 셀 이력](images/before-cell-history.png)       | ![변경 후 셀 이력](images/after-cell-history.png)       |
| 디자인 이력    | ![변경 전 디자인 이력](images/before-design-history.png) | ![변경 후 디자인 이력](images/after-design-history.png) |

| 추가 확인 화면               | 캡처                                             |
| ---------------------------- | ------------------------------------------------ |
| 아이콘 범례                  | ![아이콘 범례](images/after-legend.png)          |
| 비활성 QA 종료의 키보드 툴팁 | ![종료 툴팁](images/after-close-tooltip.png)     |
| 디자인 항목 수정             | ![디자인 수정](images/after-design-edit.png)     |
| 실행 중인 디자인 검수        | ![실행 중 안내](images/after-running.png)        |
| 종료된 스프린트의 6단계 완료 | ![종료 단계](images/after-closed.png)            |
| 자동 판정 이력과 사유        | ![자동 판정 이력](images/after-auto-history.png) |

변경 후 캡처는 `VITE_USE_MOCK=true npm run dev -- --host 127.0.0.1`로 개발 서버를 실행한 다음 다른 터미널에서 `node docs/qa-test-agile-followup/capture.mjs`로 다시 만들 수 있습니다. 변경 전 캡처는 보존됩니다.
