# T1 최종 웹·모션 점검

2026-11-14 [최신 Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md)를 수신하고 바뀐 src TSX를 확인했어요. 코드/실제 캡처·기존/신규 단위/e2e를 함께 사용했으며 스크린리더 전체 감사/실제 backend E2E를 했다는 뜻은 아니에요.

| 점검 | 결과·처리 |
|---|---|
| 대비 V10 |승인29쌍29/29·정상글자 최소4.8389·비텍스트3.2881. 계산 [JSON](contrast.json), 실제 root/input/button/partial색은 묶음/최종 computed. 비활성opacity 면제와 정상 통과 구분 |
| 셸/영역 P5 |50화면 순서·셸 x/폭50동일(로그인N/A 포함), overflow0·h1 y0, QA 승인된 밀도 변화는 LAYOUT에 명시 |
| 원문 W11 |FE copy만, 닉네임/handle/ID/서버메시지·Markdown·history·답변모델 불변.7schema AST에서 min/max 메시지·message property만 제거한 구조가 HEAD와 동일 |
| 자연스러운 안내 W1·W6 |최종2컴포넌트의 을(를)3곳 보정. strict원문/입력비교·위험조건 불변·상태 PNG 재캡처 |
| 의미 HTML/focus |Link/Button·Radix 원래 의미/접근 이름 유지, StatCard focus ring 보충, 로그인 이미지 크기 명시·장식 alt빈값. 확인/이탈/키보드 회귀 통과 |
| 레이아웃 안정/모션 |아래 review-animations 표. 실제 대기 이외의 본문/숫자/차트/게이지 진입0·반복0 |

## review-animations — Approve (승인된 스타일 범위)

| 대상 | 최종 | 판단·증거 |
|---|---|---|
| 본문/표/숫자/QA게이지 |즉시0ms·RAF시각상태 제거|고빈도 읽기,50정상 main running animation0·샘플/e2e검증(M1·M6)|
| DAU/MAU/tooltip |isAnimationActive=false|정상/reduced 동일·집계/부분신호 유지|
| Ravvit완성답변/실제대기 |전체 즉시/정적 안내·로그|24ms/1600ms타이핑 및점반복0·콜백1회·스크롤회귀 통과|
| skeleton |정적·surface 안중립막대|실제 대기만,phase5·최종 loading 캡처|
| 버튼 |opacity feedback80ms/active.95|승인된 일회피드백,색/이동 연출 없음. pending테스트는80ms 종료 뒤 반복0 확인|
| 메뉴·팝오버 |120/90ms·scale.98+opacity·트리거origin|공용 WAAPI 현재프레임 retarget/키보드0, reduced opacity100·확대0. 기존 Select close즉시 유지|
| 중앙Dialog·backdrop |160/120ms·중앙origin·backdrop opacity|확인수명/포커스 유지·Escape/rapid재진입 회귀, reduced opacity100·확대0·키보드0|
| Sonner |160/120·opacity/scale·대기/queue/3초수명 유지|공용 증거·성공/오류색 확인. gesture중 transition0·reduced scale1|
| 실제 pending spinner |linear1200ms·reduced없음|진입모션이 아닌 실제 네트워크 대기 예외. 단계5B/C normal/reduced evidence, 새 timer로대기연장0|

과한 지연/width·height 애니메이션/새 ease-in/transition-all/타이핑 반복 소비0. 기존 Radix 수명/전역 CSS 구조는 승인 공용 구현을 그대로 사용했어요.

## 스타일 밖의 남은 과제 (별도 승인)

| 위치 | 내용·근거 |
|---|---|
| StagingObjectiveForm |정답만 변경·저장 뒤 dirty가 남는 기존 결함. T0에서도 재현했고 PATCH2개는 정상. [증거](../learning-staging/verification/t0-radio-dirty.log). 원인 미확정, 스타일에서 수정0 |
| DataTable |일반 행 키보드 진입/링크 시맨틱 보완. 기존 클릭동작 유지 |
| StrictMatchModal·문의답변·ChatComposer |연결된 label/접근 이름 보완. placeholder만으로 충분하다고 판정하지 않음 |
| MainLayout |skip link 추가 별도. 셸/탭 경로에 섞지 않음 |
| 로그인 |h2로 시작하는 의미구조/오류 aria-live는 별도 접근성 과제. 이미지 width/height만 보정 |
| ToolLogBlock |키보드 focus 표식/aria-expanded 보완 별도 |
| QA 상태선택 |선택 직후 초기 Escape 경합·전역 오류중복toast 제거는 기존 별도 동작 과제 |

기존 Browserslist 오래된DB·큰bundle·ESLint4경고는 남았어요. 폰트/이미지/라이브러리 신규 도입0, 배포/promote실서비스/원격쓰기0, 브라우저/고포트 서버 종료.
