---
name: verify-ui
description: 화면을 바꾼 작업의 테스트 단계. 목 모드 dev 서버를 띄워 계획서 "확인할 화면"을 agent-browser 로 전후 캡처하고, web-design-guidelines 로 바뀐 파일을 점검하며, 모션이 바뀌었으면 review-animations 를 돌려 점검표를 계획서에 붙인다.
---

# verify-ui — 화면 전후 캡처와 UI 점검

`write-test` 뒤에 실행합니다. 단, **전 캡처**는 `implement` 가 코드를 고치기 전에 이 스킬의 1~3단계를 먼저 실행해 찍어 둡니다.

## 1. 목 모드 dev 서버

```bash
lsof -nP -iTCP -sTCP:LISTEN            # 점유 포트 확인
VITE_USE_MOCK=true npx vite --host 127.0.0.1 --port 47173 --strictPort   # 백그라운드로
```

포트가 점유돼 있으면 47000번대의 다른 포트를 고릅니다. 확인이 끝나면 서버를 반드시 종료합니다.

## 2. 브라우저 세션

`agent-browser` 첫 사용이면 `agent-browser skills get core` 를 먼저 읽습니다.

```bash
S=$(agent-browser session id --scope worktree --prefix ui)   # 이후 모든 명령에 --session "$S"
agent-browser --session "$S" set viewport 1440 900           # 1280px 이상 데스크톱
agent-browser --session "$S" open http://127.0.0.1:47173/login
agent-browser --session "$S" eval "localStorage.setItem('gravit_admin_session','true'); 'ok'"   # 목 로그인
```

## 3. 캡처

계획서 "확인할 화면"의 행마다:

```bash
agent-browser --session "$S" open http://127.0.0.1:47173/{경로}
agent-browser --session "$S" wait --text "{화면에 반드시 보이는 문구}"
agent-browser --session "$S" screenshot docs/plans/assets/{YYYYMMDD}-{slug}/{before|after}-{화면}.png
```

- 메뉴·모달·툴팁처럼 조작이 필요한 상태는 `snapshot -i` 로 ref 를 얻어 `click` 한 뒤 다시 캡처합니다.
- 로딩·빈·오류 상태도 계획서에 있으면 목 데이터 조건(스프린트 번호 등)을 바꿔 캡처합니다.
- 끝나면 `agent-browser --session "$S" close`, dev 서버 종료.

## 4. 점검

| 점검 | 방법 |
|---|---|
| 전후 비교 | 캡처를 열어 계획서 3·6·7절(화면·상태·문구)과 대조. 의도하지 않은 변화(간격·색·잘림)를 찾습니다 |
| 디자인 시스템 | `docs/conventions/ui-conventions.md` — 토큰 명명, Primary 는 액션·강조에만, 1280px 단일 폭, 4상태 |
| 웹 인터페이스 가이드라인 | `web-design-guidelines` 를 바뀐 `src/**/*.tsx` 에 실행(네트워크 필요). 결과의 `file:line` 지적을 표로 옮깁니다 |
| 모션 | `transition`·`animate-`·`@keyframes`·`data-[state=` 가 바뀌었을 때만 `review-animations` 를 실행합니다 |

지적 사항은 고칠지, 이유를 들어 넘길지 행마다 정합니다. 고치면 `implement` 의 Deviation Log 에 적고 `npm run check` 를 다시 돌립니다.

## 5. 계획서에 첨부

계획서 "확인할 화면" 표의 전·후 캡처 칸에 상대 경로 링크를 넣고, "검증 결과"의 verify-ui 칸에 점검표(점검·지적·처리)를 붙입니다.

## 완료

`verification-before-completion` 을 따릅니다. 캡처 파일이 실제로 있는지 `ls docs/plans/assets/{YYYYMMDD}-{slug}/` 로 확인하고, 캡처를 직접 열어 본 뒤 보고합니다.
