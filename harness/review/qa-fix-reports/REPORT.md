# QA 수정사항 탭·Fail 사유·매뉴얼 구현 보고

2026-11-12 · 검토 브랜치 `feat/qa-fix-reports-reasons` · 최초 기준 `616c9b9` (`fe988d1` 포함) · 최종 반영 대상 `origin/main`, 기준 `99585ee`

**G3 추가 현황: qa-server D1·D6 반영**

| 추가 요구 | 보완 전 현황 | 현재 반영 |
|---|---|---|
| 기존 Fail의 명시적 사유 수정 메뉴 | Fail 상태 선택으로만 재진입 | 셀·디자인에 `Fail 사유 수정` 메뉴 추가 완료 |
| 현재 사유 선입력 | MANUAL Fail만 채움 | AUTO/MANUAL 구분 없이 채움 |
| 기존 Fail의 빈 사유 | 목에서 기존 사유를 지울 수 있었음 | 정상 무변경: 사유·버전·이력·출처 보존 |
| 같은 사유 전송 | 목에서 버전과 이력이 늘어남 | 정상 무변경 응답을 처리하며 버전·이력 보존 |
| trim 후 JS 길이 500자 | trim 없이 물리적 입력 제한 | 폼·API 모두 trim 후 JS string.length 검사. 글자 수 동일 기준, 초과 요청 차단 |
| 초과 오류 | 목 400 GLOBAL_4001 | 코드 유지. trim 후 초과를 검사하며 UI 오류의 aria-invalid·설명 연결·alert·danger 보더 추가 |

실제 qa-server D1·D6 실행 결과는 확인 필요이며, 위 무변경 조건은 제공된 계약에 맞춘 목 검증 결과입니다.

| 범위 | 결과 |
|---|---|
| 파트별 수정사항 | 2차 오른쪽 다섯 번째 탭과 `/qa/sprints/:sprintId/fix-reports`를 추가했습니다. 기존 상태별 기본 탭 이동은 유지했습니다. |
| G1 | Zod 검증 후 서버의 status·ready·unchecked·failCount·fileName을 사용합니다. 준비 전 빈 parts를 허용하고 준비 완료 시 고유 4파트를 검증합니다. 수를 프론트에서 다시 계산하지 않습니다. |
| 화면 분기 | 검수 전 단계명, 수동 검수의 남은 미검수, 실행 중 안내, 4개 파트 카드, 0건 비활성 이유, 구서버 404 일반 오류를 처리합니다. 실행 정보는 기존 상세 조회를 재사용합니다. |
| G2 | 기존 Bearer axios로 Blob을 받고 G1의 파일명으로 저장합니다. Content-Disposition의 파일명은 사용하지 않습니다. 실패 시 토스트와 G1 재조회를 실행합니다. object URL은 해제합니다. |
| 갱신 | 판정·항목 추가/수정/삭제 성공과 기존 작업 polling 갱신에 G1 무효화를 연결했습니다. |
| G3 | 디자인·1차·2차의 Fail 선택 시 공통 400px 사유 대화상자를 엽니다. 기존 Fail은 명시적인 수정 메뉴로 진입하고 현재 사유를 채웁니다. 선택 입력·trim 후 JS 500자 검증·취소·확인 후 요청을 지원합니다. 빈 값·동일 값은 정상 무변경이며 사유 삭제 기능은 없습니다. 다른 상태에는 reason을 보내지 않습니다. |
| 사유와 F-12 | 현재 1차 일반 사유의 실제 위치인 변경 이력 모달을 재사용합니다. 한 줄 메타 형식과 줄바꿈 사유·기존 자동 사유 이력을 유지합니다. 디자인 본문의 Figma 프레임 없음 표시도 유지합니다. |
| F-17 | 확인 전에는 요청하지 않습니다. 확인 후 기존 상태를 옅게 표시하며 성공 응답으로 새 색을 표시합니다. 저장 실패 시 기존 상태와 사유 입력을 유지합니다. |
| 목록 | 페이지 우상단에 QA 매뉴얼 외부 링크와 아이콘을 두고 URL을 상수 한 곳에 모았습니다. 새 탭·noopener noreferrer를 적용했습니다. 등록 버튼은 비어 있지 않은 표 카드 우상단, 빈 목록은 기존 안내 안에 있습니다. |
| 공용 영향 | DataTable에 선택 header 슬롯을 추가했습니다. 슬롯을 전달하지 않는 다른 9개 화면은 기존 출력 구조를 유지합니다. 공용 Dialog 닫기 아이콘에는 기본 툴팁을 추가했습니다. |
| 회귀 보완 | 기존 QA 상태 범례에서 툴팁→팝오버를 빠르게 연 뒤 첫 Escape가 닫기로 이어지지 않는 경합을 재현했습니다. QA 범례 내부의 Escape 처리를 명시했습니다. 새 탭이 직접 원인이라는 근거는 없습니다. |
| 하네스 | Step 13의 4개 항목을 기존 H1/H2 앞에 추가했습니다. H1/H2의 상태와 기존 사용자 작업은 보존했습니다. Figma 시안 없이 승인 구성안과 기존 DS 토큰/컴포넌트를 사용했습니다. |
| 커밋·푸시 | 사용자 승인 완료: `origin/main`에 일반 푸시합니다. 결과 해시는 Git 로그와 최종 응답으로 보고합니다. |

**검증 결과**

| 명령/확인 | 결과 |
|---|---|
| `npm run build` | PASS. Vite 청크 크기 및 Browserslist 데이터 안내가 있습니다. |
| `npm run lint` | PASS: 오류 0개, 기존 react-refresh 경고 4개 |
| `npm run test:e2e -- --workers=4` | D1·D6 보완 후 **83 PASS**, 42.1초 |
| 하네스 `gate-runner.sh --full` | D1·D6 보완 후 **OK**: 상태 무결성·타입·토큰·빌드 통과. 전체 스모크는 위 명령으로 별도 검증했습니다. 최초 구현의 `--with-smoke`도 80 PASS/OK였습니다. |
| 명세 리뷰 | PASS. G1/G2/G3와 하위 호환 처리의 정적 검토입니다. 실제 서버 검증은 포함하지 않습니다. |
| 디자인·접근성 리뷰 | PASS. 1280px 가로 넘침 없음, 카드 정렬, 400px Dialog, 자동 포커스와 복귀, 비활성 이유 툴팁을 확인했습니다. |
| 캡처 | 변경 전 6개·변경 후 21개. 목 모드에서 촬영했으며 페이지 오류가 없었습니다. |

| 회귀/신규 시나리오 | 확인 내용 |
|---|---|
| 탭/기본 진입 | 기존 모든 상태별 기본 탭과 다섯 번째 탭 노출 |
| 수정사항 상태 | 검수 전·수동 미검수·실행 중·준비 완료·0건·404 |
| 파일 | 4파트 GET, 인증 헤더 존재, G1 파일명, 잘못된 첨부 헤더에 의존하지 않음, UTF-8 한글과 줄바꿈 |
| 다운로드 오류 | 409·404 토스트 및 G1 재조회 |
| 사람 Fail | 디자인·1차·2차 확인 전 요청 없음, 취소/입력 초기화, 선택 입력, 500자, 초과 요청 거부, 같은 Fail의 사유 변경 |
| 이력/저장 | 수동 사유·기존 자동 사유·F-12 메타 형식, 비-Fail 요청의 reason 생략, 요청 중 이전 색과 옅은 색, 실패 복구 |
| 집계 갱신 | Fail 수 변경, 항목 수정의 ready 해제, 삭제 후 ready 복구 |
| 목록 | 일반/빈 목록의 매뉴얼 속성과 등록 버튼 위치·등록 진입 |
| 계약 | 목 생성기와 독립된 G1/G3 표본 검증. 준비 전 빈 parts, 음수·중복 파트·준비 완료 누락 파트 거부 |
| D1·D6 | 1차·2차·디자인의 기존 사유 수정, AUTO 사유 선입력, trim된 사유 전송, 빈 값·같은 값의 정상 무변경과 버전/이력/출처 보존, 새 사유 저장, UTF-16 이모지 경계와 400 GLOBAL_4001 |

**변경 전후 캡처**

| 화면 | 변경 전 | 변경 후 |
|---|---|---|
| 스프린트 목록 | ![목록 전](before/list.png) | ![목록 후](after/list.png) |
| 빈 목록 | ![빈 목록 전](before/empty.png) | ![빈 목록 후](after/empty.png) |
| 체크리스트 판정 | ![체크리스트 전](before/checklist.png) | ![사유 대화상자](after/checklist-reason.png) |
| 디자인 판정 | ![디자인 전](before/design.png) | ![디자인 사유 대화상자](after/design-reason.png) |
| 셀 변경 이력 | ![셀 이력 전](before/checklist-history.png) | ![셀 이력 후](after/checklist-history.png) |
| 디자인 변경 이력 | ![디자인 이력 전](before/design-history.png) | ![디자인 이력 후](after/design-history.png) |

| D1·D6 추가 화면 | 셀 | 디자인 |
|---|---|---|
| Fail 사유 수정 메뉴 | ![셀 사유 수정 메뉴](after/checklist-reason-menu.png) | ![디자인 사유 수정 메뉴](after/design-reason-menu.png) |
| 현재 사유 미리 채움 | ![셀 현재 사유](after/checklist-reason-edit.png) | ![디자인 현재 사유](after/design-reason-edit.png) |
| trim 후 500자 초과 안내 | ![셀 초과 오류](after/checklist-reason-limit.png) | ![디자인 초과 오류](after/design-reason-limit.png) |

| 신규 탭 상태 | 캡처 |
|---|---|
| 검수 전 | ![검수 전](after/fixes-before-review.png) |
| 수동 미검수 | ![미검수](after/fixes-unchecked.png) |
| 실행 중 | ![실행 중](after/fixes-running.png) |
| 준비 완료 | ![4파트](after/fixes-ready.png) |
| 준비 완료 1280px | ![1280px](after/fixes-ready-1280.png) |
| 수정할 항목 없음 | ![0건](after/fixes-empty.png) |
| 구서버 404 목 | ![404](after/fixes-legacy.png) |

**확인 필요 및 검증 한계**

| 항목 | 상태 |
|---|---|
| 실제 qa-server G1~G3 | **확인 필요**. 실제 서버의 변경 요청을 보내지 않았습니다. 제공된 계약과 MSW로 개발·검증했습니다. |
| 옛 서버 `3be66a1`의 unknown-field 처리 | **확인 필요**. reason을 무시하는 목에서 화면 유지와 판정 변경을 확인했지만 실제 Spring 설정 확인을 대체하지 않습니다. |
| TXT 본문 계약 예시 | **확인 필요**. `SESSION_G1_QA_SERVER_FIX_REPORT.md`와 예시 틀이 제공되지 않았습니다. 목 본문 첫 줄에 `임시 목 TXT — 서버 계약 예시 틀 확인 필요`를 명시했고, 전송·파일명·UTF-8 검증에만 사용했습니다. 예시 수신 후 목 본문 대조가 남아 있습니다. |
| 기준 해시 `99585ee` | 최종 fetch로 확인했습니다. 기존 기준 `616c9b9` 이후 README 변경 1건이며, 이를 보존하도록 `main`을 `99585ee`로 fast-forward한 뒤 QA 변경을 커밋합니다. |
| 사용자 작업/비밀 값 | 기존 architecture-reviewer.md 변경 및 미추적 `.env.development`, QA_SPEC.md, RAVVIT_SPEC.md를 수정하지 않았습니다. 비밀 값을 읽거나 보고하지 않았습니다. |

재현용 변경 후 캡처 스크립트: [capture.mjs](capture.mjs). `VITE_USE_MOCK=true`로 실행 중인 로컬 개발 서버에서 사용합니다.
