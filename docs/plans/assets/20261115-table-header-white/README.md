# 테이블 헤더 흰색 보정 — 검증 기록

2026-11-15 사용자 승인 계획: [PLAN](../../PLAN-20261115-table-header-white.md).

공용 `--table-header`만 기존 흰 `surface`에 연결했어요. 페이지는 기존 옅은 회색, 머리글은 foreground/600, 아래선은 input/1px예요. 새 모션·API·동작·의존성 변경은 없어요.

| 증거 | 확인 |
|---|---|
| [1280 전후](comparison-1280.png) · [1440 전후](comparison-1440.png) | 유저·챕터 풀이 현황/유닛·QA 1차. 좌 변경 전, 우 변경 후. 두 이미지를 직접 열어 색·배치·잘림을 확인했어요 |
| [변경 전](before/manifest.json) · [변경 후](after/manifest.json) | 전6/후26조건. 정상 화면6장+QA 포커스2장씩, 총16장 |
| [측정 결과](regression-evidence.json) | 13라우트×2폭 모두 흰 머리. 대표6조건의 셸/표/행/열/문구/글자 치수 일치. hover 고정·전체 가로 넘침0 |
| [QA 포커스1440](after/qa-first-focus-1440.png) | 판정 버튼의 focus-visible·링 유지, 직접 열어 확인 |
| [명령 결과](verification/commands.json) | check exit0, 단위22파일78개, e2e133개, check:full exit0 |

흰 머리 위 foreground 대비14.86:1, 머리48px·글자600·아래선1px/input을 computed 값으로 확인했어요. 로딩·빈 상태·오류·클릭·판정은 기존 단위/e2e로 검증했고 표시만 복사하는 새 테스트는 추가하지 않았어요.

## UI 점검

| 점검 | 결과·처리 |
|---|---|
| 토큰·표면 | 기존 surface 참조, 페이지/본문/색 역할 이름 유지 |
| 배치·원문 | 대표6조건 전후 일치, 13라우트26조건 흰 헤더 전파 |
| 포커스 | QA 버튼2조건의 focus-visible·box-shadow 전후 일치 |
| 웹 가이드 | [최신 원문](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md)을 2026-11-15 조회. `src/shared/styles/globals.css:29` — 변경 범위 지적0. TSX 변경0, 기존 시맨틱·포커스 규칙 유지 |
| 모션 | 변경0으로 review-animations 대상 없음 |
| 기존 과제 | DataTable 행 키보드 진입·입력 접근 이름·skip link 등은 직전 계획의 별도 과제로 보존 |
| 환경 | VITE_USE_MOCK=true·127.0.0.1:47173. 브라우저/수동 서버 종료, e2e5173 자동 서버 종료 확인 |
| 보존 | 기존 미추적 복제731개 크기/mtime 변경0. 기존 계획·캡처 보존 |

기존 ESLint 경고6개(미추적 복제2개 포함)·Browserslist·큰 chunk 경고가 남아 있어요. 구현 검증 시점에는 커밋·스테이징·푸시를 실행하지 않았어요.

2026-11-15 사용자 “커밋 푸시 머지까지 ㄱㄱ”로 main 커밋·푸시를 승인했습니다. [커밋 전 최종 검사](verification/commit-check-full.txt)는 exit0이며 기존 검증 이후 제품 코드 변경은 없습니다.
