# PLAN-20261115-table-header-white: 테이블 헤더를 흰 면으로 조정

| 항목 | 내용 |
|---|---|
| 상태 | 커밋됨 (2026-11-15) — 사용자 커밋·푸시·main 반영 승인 |
| 요청 | 2026-11-15: 표 머리 행을 흰색으로 바꾸고 뒤의 페이지 배경과 구분하는 방향 검토 |
| Git 승인 | 2026-11-15 사용자 “커밋 푸시 머지까지 ㄱㄱ” — main에 두 변경을 나누어 커밋·푸시 |
| 범위 | 공용 table-header 역할의 색을 흰 surface로 연결 |
| 범위 밖 | 본문 행/페이지 색·글자/아래선/치수·표 동작·API·마크다운 표·커밋/푸시 |

## 1. 목적

표 전체를 흰 카드로 묶고 페이지의 옅은 회색과 구분해요(V1·V4). 헤더/본문은 같은 흰 면이고, 머리글의 진한600 글자와 아래1px 구분선으로 속성 행을 식별해요. 직전 수정의 진한 회색 띠만 걷어내는 보정이에요.

변경 전 코드에서 페이지는 `#F4F6F8`, 본문 카드는 `#FFFFFF`, 헤더는 `#DEE0E4`예요. 흰 헤더는 기존 surface 토큰을 재사용하고 새 색은 만들지 않아요(P2·P5). 기존 T1/직전 실제 캡처가 디자인 입력이며 새 Figma 인테이크는 하지 않아요.

## 2. 읽은 문서

| 문서 | 절 | 제약 |
|---|---|---|
| AGENTS·write-plan·00_INDEX·antipatterns | 승인/관할/시각 | 코드 변경 전 승인·토큰 재사용·기존 파일 보존 |
| decisions D15·D16 | T1·표 머리 보정 | 최신 사용자 main 반영 승인·머리 색만 재조정, 원문/동작 보존 |
| ui-conventions·DS-01·DS-STYLE-01/02 | 색/명명/표 | existing surface/page·header48·foreground/600·input 경계 유지 |
| PLAN-20261114-table-header-contrast 및 검증 결과 | 구현/회귀 | 기존 글자/아래선/모서리/내부 overflow 유지 |
| globals.css·table.tsx·DataTable·ChapterStatsWidget·tailwind | 실제 렌더 | 기존 의미 alias를 유지하고 글로벌 역할 값1곳만 조정 |
| testing·DataTable/ChapterStatsWidget 테스트·shared-ui/QA e2e | 검증 | 기존 목/상태·클릭/판정/포커스 회귀 |

## 3. 바뀌는 화면·라우트

| 경로 | 화면 | 변경 |
|---|---|---|
| /notices·/users·/reports·/inquiries·/chapters·/staging/labels·/qa/sprints | 목록7개 | 헤더 회색 → 흰색 |
| /chapters/:id·/units/:id·/lessons/:id | 풀이 현황/하위 목록 | 같은 흰 헤더 |
| /qa/sprints/:id/design-review·/checklist/1·/checklist/2 | QA3개 | 같은 흰 헤더 |

공용 역할을 쓰는13개 라우트에 전파돼요.

## 4. 코드 변경 (스키마 → API → 훅 → 컴포넌트 → 페이지 → 라우트 순)

| 파일 | 단위 | 변경 |
|---|---|---|
| src/shared/styles/globals.css | 역할 값 | `--table-header: var(--surface)`로 연결. 기존 bg-table-header 이름과 HSL 형식 사용처 유지 |
| API/훅/컴포넌트/페이지/라우트/목·tailwind | 기존 구현 | 변경0. foreground/600·input 아래1px·48높이·모서리/overflow/열 배치 유지 |

## 5. API 계약 영향

없음 — 전역 표면 역할 값1곳의 표시 변경이에요.

## 6. 상태 4종

| 상태 | 커밋됨 (2026-11-15) — 사용자 커밋·푸시·main 반영 승인 |
|---|---|---|
| 로딩 | 기존 isLoading | 기존 정적 skeleton, 헤더 추가0 |
| 빈 상태 | 기존 빈 데이터 | 기존 안내/행동, 헤더 추가0 |
| 오류 | 기존 isError | 기존 오류/재시도 |
| 정상 | 기존 데이터 있음 | 흰 헤더+흰 본문, 진한 글자/아래선 유지. 페이지는 기존 옅은 회색 |

## 7. 문구

변경 없음 — 컬럼명/원문/접근 이름을 유지해요(W11).

## 8. 고칠 명세

| 파일 | 절 | 내용 |
|---|---|---|
| docs/spec/DS-STYLE-01_foundations.md | §2 표 머리 역할/대비 | table-header=neutral-0, foreground/white 대비14.86:1. 직전 회색 합성 설명을 현재 규칙으로 갱신 |
| docs/spec/DS-STYLE-02_components.md | Table/DataTable | 흰 머리 면·본문과는 글자/선으로 구분 명시 |
| docs/conventions/decisions.md | 새 D17 | 승인 후 D16의 머리 면만 흰색으로 대체. 기존 치수/행동 규칙 유지 |

기존 계획·전후 PNG는 당시 기록으로 보존해요.

## 9. 테스트 계획

| 종류 | 대상 | 확인 |
|---|---|---|
| 단위 | 기존 DataTable·ChapterStatsWidget·QA | npm run test,4상태·원문/클릭/판정 의미 유지 |
| e2e | 기존 전체 목e2e | npm run test:e2e, 새 CSS 구현을 복사하는 테스트 추가0 |
| 목 | 기존 handlers | 변경0·실서버 요청0 |
| UI/게이트 | 두 폭 전후/computed·check:full | 머리white·페이지회색·foreground/600/아래선/배치 유지·대비14.86·hover 고정 |

## 10. 확인할 화면 (verify-ui)

| 경로 | 목 조건 | 확인 | 전 | 후 |
|---|---|---|---|---|
| /users | 기존 정상 | 페이지/흰 표 구분·헤더 아래선·열/행 위치 | [1280](assets/20261115-table-header-white/before/users-1280.png) · [1440](assets/20261115-table-header-white/before/users-1440.png) | [1280](assets/20261115-table-header-white/after/users-1280.png) · [1440](assets/20261115-table-header-white/after/users-1440.png) |
| /chapters/1 | 기존 정상 | 풀이 현황·유닛 목록 모두 흰 헤더 | [1280](assets/20261115-table-header-white/before/chapter-detail-1280.png) · [1440](assets/20261115-table-header-white/before/chapter-detail-1440.png) | [1280](assets/20261115-table-header-white/after/chapter-detail-1280.png) · [1440](assets/20261115-table-header-white/after/chapter-detail-1440.png) |
| /qa/sprints/2/checklist/1 | 기존 정상 | 그룹 머리/속성/판정 구분·포커스 | [1280](assets/20261115-table-header-white/before/qa-first-1280.png) · [1440](assets/20261115-table-header-white/before/qa-first-1440.png) | [1280](assets/20261115-table-header-white/after/qa-first-1280.png) · [1440](assets/20261115-table-header-white/after/qa-first-1440.png) |

각1280/1440×900. 기존13라우트 전파는 공용 변수 연결과 computed 사용처로 확인해요. 이전4상태 로직 불변을 기존 회귀로 검증하고 새 모션은 만들지 않아요. 목 고포트/명명 agent-browser·끝난 뒤 종료·최신 web-design-guidelines 점검.

## 11. 결정 필요

2026-11-15 사용자 “ㄱㄱ”로 승인했어요. 본문도 흰색이므로 헤더와 본문 구분은 현재 진한 글자·아래선으로 유지해요. 추가 결정은 없어요.

## Deviation Log

| 날짜 | 계획 | 실제 | 이유 |
|---|---|---|---|
|2026-11-15|계획 먼저|초안 작성 후 사용자 “ㄱㄱ” 승인으로 구현|색 방향 확인/승인 관문|
|2026-11-15|승인 범위|색 변수1곳·계획된 명세3개만 변경. 기능/목/테스트 코드 추가0|계획 이탈 없음. 기존 동작 테스트와 computed 전후 비교 재사용|

## 검증 결과

| 점검 | 결과 |
|---|---|
| 변경 전 색 값 | globals.css에서 page #F4F6F8·surface #FFFFFF·table-header #DEE0E4 확인 |
| 변경 후 색 값 | table-header를 surface(#FFFFFF)에 연결. page #F4F6F8 유지, 26조건 computed 확인 |
| 계획서 | 필수 절/파일 확인 |
| npm run check | exit0 — 타입·ESLint 오류0/기존 경고6·token-lint OK |
| npm run test | exit0 — 22파일78개 통과·실패0. [로그](assets/20261115-table-header-white/verification/test.txt) |
| npm run test:e2e | exit0 — 전체 목133개 통과·실패0. [로그](assets/20261115-table-header-white/verification/e2e.txt) |
| npm run check:full | exit0 — 타입·ESLint 오류0/기존 경고6·token-lint·빌드. 기존 Browserslist/큰 chunk 경고 유지. [로그](assets/20261115-table-header-white/verification/check-full.txt) |
| verify-ui | 전6/후26조건·전후 PNG16장·비교2장 직접 열람. 대표6조건 배치/치수/원문 일치·13라우트×2폭 흰 머리·hover/포커스 유지·overflow0. [측정](assets/20261115-table-header-white/regression-evidence.json)·[점검표](assets/20261115-table-header-white/README.md#ui-점검) |
| 토큰 대비 | foreground/흰 머리14.86:1, 기존 input/1px 아래선·48높이 유지 |
| 실행 종료·보존 | agent-browser 종료exit0·수동 서버SIGINT130·e2e 서버종료. 기존 미추적731개 크기/mtime 변경0·커밋/스테이징/푸시0 |

| 커밋 전 최종 게이트 | npm run check:full exit0·오류0/기존 경고6·token-lint·빌드. [로그](assets/20261115-table-header-white/verification/commit-check-full.txt). 마지막 단위/e2e/인증 검증 이후 코드 변경 없음 |

## 자기 점검

- [x] 명세 밖 API/필드/쿼리 없음
- [x]4상태 동작 기록
- [x]문구/원문 변경 없음
- [x]feature 직접 import 없음
- [x]단위/e2e·목 변경 여부 계획 있음
- [x]경로/목 조건/전후 화면 계획 있음
