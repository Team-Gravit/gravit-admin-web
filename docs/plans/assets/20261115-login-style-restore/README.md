# 로그인 개편 전 디자인 복원 — 검증 기록

2026-11-15 사용자 “고고!” 승인: [PLAN](../../PLAN-20261115-login-style-restore.md). 기준은 fd83538과 기존 T0 캡처입니다.

| 결과 | 증거 |
|---|---|
| 정상 화면1280/1440에서 원본과 픽셀 차이0 | [측정](regression-evidence.json), 원본 PNG와 복원 PNG를 같은 origin의 canvas에서 각 픽셀 RGB 비교 |
| 원본 / 변경 전 T1 / 복원 | [1280 비교](comparison-1280.png) · [1440 비교](comparison-1440.png) |
| 7조건×2폭 전후 | [전 manifest](before/manifest.json) · [후 manifest](after/manifest.json). 전14/후14 PNG |
| 정상/포커스/reduced/로딩 | [1280](states-1280-1.png) · [1440](states-1440-1.png) |
| 권한/실패 쿼리/GET 오류 | [1280](states-1280-2.png) · [1440](states-1440-2.png) |
| users 회귀2조건 | page/흰 table-header·열·표 치수 전후 동일, login-theme 없음 |
| check·단위·목e2e·인증·빌드 | [명령](verification/commands.json), check exit0·22파일78개·133개·17개·check:full exit0 |

원본/현재 정상 화면과 상태 모음을 직접 열어 비교했습니다. 외부 앱 서버5173은 사용하지 않고, 목 화면47173·전체 목e2e47174를 사용했습니다. e2e는 기존 config를 가져와 origin/서버 포트·reuseExistingServer=false·결과 저장 위치만 바꾼 /tmp 임시 config로 실행했습니다. 인증17개는 기존 로컬 가짜 백엔드/쿠키 검증이며 실제 제공자 로그인은 실행하지 않았습니다.

## UI 점검

| 점검 | 지적·처리 |
|---|---|
| 원본 시각 | 두 폭 모두 다른 픽셀0. 원본 HSL·SVG/일러스트·글자·카드8/버튼12·shadow-sm 복원 |
| 상태 | 전체16조건(로그인14·users2)에서 카드/열 치수 유지·가로 넘침0·대기 잠금/오류 복원·focus-visible |
| 디자인 시스템 | 색은 login-theme 안, login-h1/login-caption/login-provider는 정의 파일의 이름 있는 토큰. 다른 관리자 토큰 유지 |
| 웹 가이드 | [지적과 처리](web-review.md). 원래 제목/aria-live·원본 브랜드 대비 한계는 별도 과제로 기록 |
| 모션 | [review-animations](motion-review.md) Approve. 공용80ms 보간 상속 제거, 현재0s·보통/reduced animation0 |
| React·shadcn | 기존 자산/native button 복원은 승인 계획의 예외. 공용 Button/다른 컴포넌트 수정0·새 state/effect/의존성0 |
| 레드→그린 | 구현 전 제공자 로고0으로 새 기대2조건 실패(exit1), 구현 후 동일2조건 포함 전체133개 통과(exit0) |
| 개발 서버 | Tailwind TS 변경 직후 새 토큰이 누락된 첫 캡처를 확인해 서버 재시작 후 캡처를 갱신. 최종24/32·12px·원본 픽셀0 확인 |

원본 네이버 버튼의 약2.8:1 글자 대비는 알려진 한계입니다. AA 통과로 보고하지 않습니다. 기존 ESLint 경고6개·Browserslist·큰 chunk 경고도 유지됩니다. 구현 검증 시점에는 커밋/스테이징/푸시하지 않았습니다.

브라우저 종료exit0·수동47173 서버SIGINT130. 테스트 서버 종료를 확인했고 기존5173 서버는 보존했습니다. 기존 미추적761개(흰 헤더 증거/기존 복제 포함)의 크기·mtime 변경0을 확인했습니다.

2026-11-15 사용자 “커밋 푸시 머지까지 ㄱㄱ”로 main 커밋·푸시를 승인했습니다. [커밋 전 최종 검사](verification/commit-check-full.txt)는 exit0이며 기존 검증 이후 제품 코드 변경은 없습니다.
