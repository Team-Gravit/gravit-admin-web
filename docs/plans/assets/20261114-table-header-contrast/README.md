# 테이블 머리글 보정 — 구현·검증 결과

머리글을 페이지보다 진한 중립 면으로 분리하고 진한600 글자·아래1px 경계로 통일했어요(V1·V4·V10). 목록/하위 목록/풀이 현황/QA의13라우트에 적용했어요. 열/행/필터/클릭/판정/원문은 유지해요.

[유저 목록 전후 비교](compare-users-1440.png) · [실제 유저 화면](after/users-1440.png) · [QA 화면](after/qa-first-1280.png) · [승인 계획](../../PLAN-20261114-table-header-contrast.md)

| 확인 | 결과 |
|---|---|
| check |exit0·타입/ESLint0오류·6경고·token-lint 통과 |
| unit |22파일78개 통과·실패0·exit0 |
| 전체 목e2e |133개 통과·실패0·exit0 |
| check:full |exit0·타입/lint/token/빌드 |
| 화면 |13×2폭 정상26·전후38개 조건 측정·before18/after38 PNG·추가focus4·contact8/비교1 |
| 위계/대비 |정상26/26 새 머리 면 RGB222/224/228·foreground RGB32/40/51·600. 글자 대비11.2466:1·전체30쌍통과 |
| 위치 |모든 머리48px·열 이름/순서/x/y/폭·첫 데이터 행 rect 동일·셸38/38 동일·가로 넘침0 |
| hover/reduced/focus |6조건 머리 면 유지·포커스 표시·QA 셀/등록/문제이동 버튼 ring 잘림0. 등록·이동4보충조건도 통과 |
| 기존 파일 |작업 이전 미추적 파일731개 존재/크기/mtime 보존. 정리/삭제/스테이징0 |
| 경계 |변경 제품파일5개·모션/API/mock/라우트/props/문구/마크다운표 변경0·새 의존성0 |

[전 manifest](before/manifest.json) · [후 manifest](after/manifest.json) · [위치 비교](layout-comparison.json) · [시각 red/green](regression-evidence.json) · [대비](contrast.json) · [포커스](focus-evidence.json) · [명령/원문](verification/commands.json)

## 웹 인터페이스 점검

2026-11-14 [최신 가이드](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md)를 수신하고 바뀐3개 TSX를 점검했어요. [공식 shadcn Table 구성](https://ui.shadcn.com/docs/components/radix/table)을 확인하고 기존 네이티브 table/thead/th를 유지했어요.

| 위치 | 점검·처리 |
|---|---|
|src/shared/components/ui/table.tsx:21|thead/th 의미·접근 이름/원문·48높이·숫자tabular 유지. 새 전용 면과foreground의 정상 글자 대비11.25 확보 |
|src/shared/components/data-table/DataTable.tsx:98|overflow-hidden으로 카드12 모서리 안에 머리 면을 자름. 내부 overflow-auto 유지·포커스/원래 가로스크롤 구조 확인 |
|src/features/chapters/components/ChapterStatsWidget.tsx:73|같은 모서리 처리·데이터/진행 막대/조건 변화0 |
|기존 별도 과제|DataTable 행 키보드 진입·버튼 형태의 문제 이동 링크 시맨틱은 기존 별도 접근성 과제이며 이번 스타일에 섞지 않음 |
|모션|transition/animate/keyframe 변경0, review-animations 대상 없음. normal/reduced 머리 면 동일 |

ESLint 기존4경고와 보존한 미추적 `*.test 2.tsx`의2경고가 있어요. 기존 Browserslist/큰chunk 경고도 남아 있어요. 브라우저/고포트 서버는 검증 후 종료했어요. 2026-11-15 사용자가 커밋·푸시·main 반영을 승인했어요. 작업 브랜치가 main이므로 위 검증 결과와 동일한 코드를 main에 직접 기록하고 origin/main에 반영해요. 기존 미추적 파일731개는 보존하며 스테이징하지 않아요. 실제 커밋/원격 상태는 git log/status로 확인해요.
