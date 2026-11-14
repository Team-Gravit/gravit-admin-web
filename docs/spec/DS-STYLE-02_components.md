# DS-STYLE-02 — 공용 컴포넌트

> T1 experiment/style-refresh 전용. [기초 토큰](DS-STYLE-01_foundations.md)·[D15](../conventions/decisions.md#d15--t1-스타일-개편-실험-2026-11-14-사용자-승인)·[단계3 계획](../plans/PLAN-20261114-style-shared-components.md)이 근거예요. 새 의존성·public props 변경 없이 기존 Radix 기반 공용 UI를 확장해요.

## 1. 역할·변형

| 컴포넌트 | 규칙 | 원칙 |
|---|---|---|
| Button default | 파랑 면·흰 글자, 영역의 주요 행동1개 | P4·V2·V10 |
| Button destructive | danger 단색·흰 글자. 삭제·반영·위험 행동만 | V3·V8·V10 |
| outline/secondary/ghost/link | 기존 의미 유지. outline은 input 경계, 보조 행동은 중립 면, 링크만 파랑 | P2·P4·V2 |
| Button 크기 | default40·sm32·lg48·icon40, control8, body/600. disabled0.48 | V4·V5·V8 |
| Input·Textarea·Select | 40px 기본 높이·body14/22·control8·input 경계·N600 placeholder. Textarea 최소80px | P5·V4·V10 |
| Checkbox·Radio | 24px 외곽·16px 체크 아이콘, checkbox8·radio 원형. 미선택 중립 경계/선택 파랑 | V5·V8·V10 |
| Table·DataTable | table-header는 흰 surface(D17). 표 전체를 페이지와 구분하고, 같은 흰 면인 머리/본문은 foreground/600 머리글·input 색 아래1px 경계로 구분. 머리48·한 줄 셀52 이상·여러 줄 자동 증가. 카드12 안에서 면 자름·그림자 없음. 기존 열·rowKey·정렬·클릭 조건 유지 | P8·V1·V4·V10 |
| 행 피드백 | 클릭 가능한 행만 옅은 파랑 hover, 정적 데이터에는 새 이동 신호를 넣지 않음 | V2·V8 |
| Pagination | 기존 페이지 계산·이전/다음·aria-current 유지, 선택 페이지만 파랑 | P5·V2 |
| StatusBadge·Badge | control8·caption/500·작은 면. 성공/완료·대기/주의·오류/위험만 의미 색 | V3·V8 |
| 역할·유형 분류 | shared badge 매핑을 중립 variant로 연결. 기존 variant 이름·enum·원문 라벨 보존 | P2·V2·V3 |
| Dialog | 400px 기본·480px strict-match·기존 max-height/스크롤, overlay16·floating shadow. 제목h3·설명body·gap16 | P6·V5·V6 |
| Dropdown·Select menu | overlay16·floating shadow·행32 이상, 기존 popper offset·키보드·선택 유지 | P5·V5·V6 |
| Popover·Tooltip | Popover16/Tooltip8, 공통 floating shadow·충분한 대비·기존 즉시 안내 유지 | P7·V6·V10 |
| Toast | 우상단72px·3초·기존 큐/전달props/제스처 유지. 중립 면·상태 아이콘만 의미 색·overlay16·floating shadow | V3·V6·V8 |
| Skeleton | 실제 로딩 조건에서만 surface 면/내부16 안의 정적인 회색 placeholder, 기존 rows 유지 | P9·V8·M1 |
| EmptyState | 기본 중립 아이콘20·간결한 body·기존 action/message/icon 주입 유지 | P4·V7·V8 |
| ErrorState | 오류 아이콘20·위험 신호·body 안내. onRetry가 있을 때만 재시도 행동 | W12·V7·V8 |
| FormField·FieldError | 간격8·기존 label/htmlFor/required/error/children 유지. 오류는 danger 글자 | P2·V1·V10 |
| Markdown | 기존 GFM·raw HTML 불허·chat 링크/내부 스크롤·작성/미리보기 전환 유지. prose는 새 의미 색·14/22 | P5·V4·V10 |
| MainLayout·Sidebar·Header | 셸 위치·폭·메뉴 순서 고정. 본문 진입 fade와 색 보간 제거. key=pathname remount 조건 유지 | P5·M1·M6 |

일반 카드/배지의 큰 장식 아이콘·그림자를 추가하지 않아요. 원형은 radio·상태 신호·기존 avatar처럼 뜻이 있는 모양에만 사용해요(V5·V7). 역할을 바꾸기 위해 variant 이름을 재해석하지 않고 각 사용처를 올바른 기존 variant로 연결해요(P2).

## 2. 입력·행동 상태

| 상태 | 표현·기존 동작 보존 | 근거 |
|---|---|---|
| 기본 | 정상 글자는 foreground/fg-secondary, 입력 경계input | V4·V10 |
| Hover | 정적 색·면 변화. 읽기 데이터는 불필요한 action 색 없음 | V2·M1 |
| Pressed | 즉시 색과80ms opacity 피드백, 이동/확대 없음 | M2·M5 |
| Focus | 기존2px ring+2px offset, 키보드 위치를 가리지 않음 | P5·V10 |
| Disabled | 실제 disabled/활성 조건 유지, opacity0.48. 비활성 이유 설명 자체는 정상 대비 | P7·V8 |
| Read-only | 기존 readonly 동작·값 유지, 중립 면·보조 글자 | P5·V8 |
| Invalid | 기존 aria-invalid 또는 전달 class에 따라 danger 경계·오류 안내 | V8·V10 |
| Loading | 기존 요청 중 disabled 유지, 실제 대기에서만 정적 skeleton | P9·V8 |

## 3. 데이터4상태

| 우선순위 | 조건 | 표현 | 원칙 |
|---|---|---|---|
| 1 로딩 | isLoading | 기존 개수의 정적 skeleton | P9·V8·M1 |
| 2 오류 | isError | 전달 errorMessage 우선, 없으면 공용 안내. onRetry 있을 때만 버튼 | W12·V8 |
| 3 빈 상태 | data.length=0 | 전달 message/action/icon 보존, 공용 기본 문구만 해요체 | P4·W1 |
| 4 정상 | 데이터 있음 | 기존 코드·ID·필드·열·상태·행동 원문 | P5·V8·어드민 예외 |

## 4. 모달·이탈 안전장치

| 대상 | 유지할 동작 | 바꾸는 표시 | 원칙 |
|---|---|---|---|
| ConfirmModal | open/onOpenChange/onConfirm·loading·variant·전달 label | 기본 취소→닫기, 기존 확인 기본값 유지 | P5·W8 |
| StrictMatchModal | 대소문자·공백 포함 value===label, close reset, loading, placeholder 없음 | 기본 제목/안내 해요체·닫기 | P5·W1·W8 |
| UnsavedChangesModal | onConfirm/onCancel·Esc/외부/X·dirty 보호 | 기본 안내 해요체·닫기 | P5·W1·W8 |
| Dialog primitive | Portal·focus trap/restore·ESC·외부 클릭·X·스크롤 | 토큰·짧은 모션 | P5·M1 |

확인 시 실제 promote·공유 서버 쓰기를 실행하지 않아요. 목 e2e 안에서만 기존 계약의 흐름을 검증해요. 공용 Modal 기본 label을 바꾸더라도 전달한 도메인 고유 문구와 원문은 덮어쓰지 않아요.

## 5. 모션

| 대상 | 보통 | reduced | 근거 |
|---|---|---|---|
| 본문·표 행·셀·정적 badge | 즉시 | 동일 | M1·M6 |
| 버튼 눌림 | opacity80ms·색/포커스 즉시 | 이동/확대 없이 동일 | M2·M5 |
| Dropdown·Select | 실제 Radix origin, scale.98→1/opacity120ms, 닫힘90ms | opacity100ms·scale1 | M3~M5 |
| Dialog | 중앙scale.98→1/opacity160ms, 닫힘120ms | opacity100ms·scale1 | M3~M5 |
| Backdrop | opacity160/120ms만 | opacity100ms | M1·M5 |
| Toast | 기존 고정 위치에서scale.98→1/opacity160ms, 닫힘120ms | opacity100ms·scale1 | M1~M5 |
| Popover·Tooltip·호버 범례 | 기존 즉시 표시 | 동일 | M1·M2 |
| Skeleton | pulse 없음 | 동일 | P9·M1 |

곡선은 foundations의 motion-ease예요. 조작 영역의 width/height/margin/padding/top/left·box-shadow를 보간하지 않아요. 위치에 필요한 기존 정적 transform과 연출 scale을 구분해요. 움직이는 hover 효과를 추가하지 않아요(M3~M5).

useOverlayMotion은 data-state와 reduced 선호를 읽어 WAAPI의 opacity/개별scale을 현재 프레임에서 새 목표로 이어가요. 기존 Radix focus·dismiss·state는 그대로이며 CSS Presence timer는 퇴장 완료 이벤트만 유지해요. 새 라이브러리나 전역 상태를 만들지 않아요. Sonner의 큐·제스처·위치 변수는 유지하고 CSS의 보간 속성만 제한해요.

## 6. 대비·검사

| 항목 | 기준·근거 |
|---|---|
| 정상 글자 | foundations §2-4 승인29쌍, 최소4.84:1·본문/보조4.5:1 이상(V10) |
| 입력 경계·미검수 아이콘 | 승인 쌍 최소3.29:1, 비텍스트3:1 이상(V10) |
| Disabled |0.48 opacity는 정상 본문 대비 통과로 주장하지 않음(V8·V10) |
| 실제 조합 | 브라우저 computed 색·합성 배경·중첩 상태를 추가 확인. 승인하지 않은 새 배경 쌍은 다시 계산(V10) |
| token-lint | UI 전체 제외 없음. 정의 파일 정확 일치만 allow, raw hex·literal px/rem/em arbitrary 금지(P2) |
| 공개 API | 기존 props·ref·변형 의미와 콜백 조건 보존(P2·P5) |

## 7. 단계별 적용 상태

단계3은 전역 토큰·공용 UI만 적용해요. feature 내부 문구/구조·QA 체크 셀/게이지·고유 차트 진입·로그인·Ravvit은 후속 단계에서 적용·검증해요. 상태·문구·모션 목록과 실제 결과는 [실험 REPORT](../experiments/style/REPORT.md)에 남겨요. 스타일 밖 접근성 동작 과제도 그 보고서에 분리해요.

### 모션 구현의 보존 경계

키보드로 시작한 overlay는 instant0ms로 표시해요(M2·M6). Select는 설치된 Radix가 닫을 때 즉시 unmount하므로 기존 즉시 닫힘을 보존해요. menu-exit90ms는 Presence를 제공하는 Dropdown 계열에 적용하며, Select의 상태/포커스 생명주기를 exit 연출을 위해 바꾸지 않아요(P5·M2).

## 8. QA 체크리스트 샘플 (단계4)

| 표시 | 적용·보존 | 근거 |
|---|---|---|
| QA 진행도 |4개 반원·서버 checked/total·percent·aria meter·영역 치수 유지, 중립 채움·최종 수치 즉시 | P9·V2·V9·M1·M6 |
| 항목 안 위계 | 제목body/600·기대 결과body/400·보조색. 반복 회색 상자/내부 padding 제거 | P8·V1·V4 |
| 관련 파트 | 기존 이름/순서의 중립 caption·구분점. 작은 외곽선 반복 제거 | P10·V1·V4 |
| 다음 미검수 | 기존 이동/접힘/포커스 동작 유지, default 파랑과 “다음 미검수로 이동” | P4·W7·V2 |
| 행 관리 | 같은 표 열의 Pencil/Trash2, aria-label 수정/삭제·title 유지. 위험 확인·잠금 불변 | P5·V7·V8 |
| Fail 사유 | 선택/원문/500자/버전/이력/잠금/restoreFocus 보존, 닫기·해요체 안내 | W1·W5·W8·P5 |

주 샘플은 /qa/sprints/2/checklist/1이에요. 같은 QA 공용 컴포넌트를 쓰는 2차/디자인 검수에도 표시가 전파되며, 검수 고유 로직은 그대로예요. 전체 feature 확산은 사람 확인2 뒤에 진행해요.

버튼 눌림의 opacity는0.95로 제한해 활성 흰 글자/파랑 대비를 유지해요(V10). 스타일 밖 접근성·남은 feature 문구는 REPORT의 별도 과제예요.

## 9. 일반 운영 화면 (단계5A)

| 표시 | 적용·보존 | 원칙 |
|---|---|---|
| 공지 고정핀 | 상단 고정은 비조작 데이터이므로 중립 보조색. 제목/원문/고정 여부 그대로 | V2·V4 |
| 목록 소개 | 제목을 반복하는4개 소개 삭제. 기존 header 최소64px로 필터/표의 대략 위치 유지 | W5·P10·P5 |
| 날짜·레벨 | 기존 포맷/값 그대로 tabular-nums. 표는 이미 공용 적용 상태 | V9 |
| 신고·문의 인용문 | 원문/줄바꿈·카드/내부 여백 유지, 장식 왼쪽선4→2px | V1·V4 |
| 확인·저장 행동 | 상태 변경/권한 부여·회수/공지·답변 저장·삭제 결과가 보이는 이름. 기존 위험 variant·잠금·콜백 유지 | P4·W7·V8 |
| 문구·검증 | 프론트 소유 문구를 해요체로. schema는 message만 변경하고 min/max/trim·response 조건 보존 | W1·W2·P5 |

[계획·문구 목록](../plans/PLAN-20261114-style-operations.md) · [검증/캡처](../experiments/style/after/operations/manifest.json). 입력 접근 이름·행 키보드 진입 등 기존 동작 과제는 별도 범위예요. 새 모션/토큰/의존성은 없어요.

## 10. 학습·스테이징 (단계5B)

| 표시 | 적용·보존 | 원칙 |
|---|---|---|
| 풀이 현황 | 비조작 막대 N600·track N50, 기존 percent/clamp·참여인원/원문/순서/치수 유지 | V2·V4·V9 |
| 문제 해설 | 본문14/22·보조색, 원문/정답 의미 유지 | V4·V10 |
| 스테이징 |288폭·hidden 독립폼·dirty/선택파랑·부분 성공 baseline·이탈/strict-match 그대로. 항목 색 보간 제거 | P5·M1·M6 |
| 저장 대기 | 기존 pending에서만1200ms linear transform 회전·저장하고 있어요…; reduced는 회전0개와 같은 라벨 | V8·M1·M4·M5 |
| 문구 | 프론트 고정 안내·빈/성공/검증·저장/편집 취소 해요체. schema message만 변경 | W1·W2·W7·P5 |

[계획](../plans/PLAN-20261114-style-learning-staging.md)·[증거](../experiments/style/after/learning-staging/manifest.json). T0에서도 재현한 객관식 정답 저장 뒤 dirty가 남는 동작은 별도 과제이며 스타일 범위에서 수정하지 않았어요.

## 11. QA 잔여 (단계5C)

| 표시 | 적용·보존 | 원칙 |
|---|---|---|
| 디자인 검수 | 샘플 제목/설명14/22·중립·관리icon/동일 접근 이름·다음미검수 행동 재사용 | P4·V1·V4·V7 |
| 진행 상태 | 목록 배지/실행아이콘 중립, 완료/실패/사람조치 의미색·기존 라벨 그대로 | V2·V3·V8 |
| 수치/이력 | 숫자 tabular·이력 사유body, 원문/순서/파일명·집계 유지 | V4·V9 |
| 문구 | QA copy·클라이언트fallback3종 해요체·닫기·등록/종료/준비 구체 행동. 서버 원문 그대로 | W1·W7·W8·P5 |
| 모션 | 반복 탭/셀 보간 삭제·실제대기1200/reduced정적. 새spinner/본문진입 없음 | M1·M4·M5·M6 |

[계획·문구 목록](../plans/PLAN-20261114-style-qa-remaining.md)·[42PNG/증거](../experiments/style/after/qa/manifest.json). 1/2차/게이지/파트/Fail 샘플은 재구현하지 않았어요. API·500자/빈 사유/version/서버 집계·권한·종료/재수집/다운로드 조건은 그대로예요.

## 12. 대시보드 단계5D

요약3개/독립 DAU·MAU2카드·기간/값/링크를 유지해요. 숫자는 tabular, 증감 데이터는 중립이에요. Area/Bar/Tooltip은 즉시 표시하고 부분 MAU는 불투명 N400+기존 집계 중 안내로 구분해요. summary 실제 대기는 기존160px 흰 카드 안의 정적 막대로 보여요(P5·V8·V9·M6).

## 13. 로그인 H2 단계5E

2026-11-14 H2 중립 전환은 당시 기록으로 보존하며, 현재는 2026-11-15 D18 승인에 따라 로그인만 개편 전 디자인을 사용해요. 왼쪽559×720 우주 일러스트·기존 제공자SVG/브랜드 면·카드8/버튼12·shadow-sm·원래 글자/오류 문구를 복원해요. 버튼56px/간격12·2열50%·전체폭1024·제공자 이름/순서/id·pending 잠금·인증은 유지해요(P5).

로그인 레이아웃의 login-theme 범위에서만 원래 색을 사용해요. 다른 화면은 T1/D17을 유지해요. 원본 네이버 흰 글자 조합의 대비 약2.8:1은 알려진 한계이며 AA 통과로 보고하지 않아요. 새 모션 없이 hover는 즉시 표시하고 기존 focus ring을 유지해요.

## 14. Ravvit H3 단계5F

완성 answer는 Markdown과 하단 액션을 즉시 표시해요. 실제 SSE pending에는 '답변을 만들고 있어요…'와 원문 도구로그를 보여주며 점반복/문자타이핑은 없어요(P9·M1·M5). 기존 표시 완료/스크롤 알림은 첫 표시1회로 유지해요. 읽기768·입력하단·무제목·대화유지/history불투명·중단/재생성·스크롤 고정조건은 D8 그대로예요. 서버 원문/추천질문은 유지하고 FE 안내만 해요체로 바꿔요(W11).

## 15. 최종 상태

단계5A~F·6 검증 결과는 [최종 증거](../experiments/style/after/final/README.md)에 있어요. 최종 조사 안내3곳을 보정했고 기존 public props/원문·확인/strict-match는 유지해요(W1·W6·P5). 옛 DS의 골격/계약은 삭제하지 않아요. 스타일 밖 접근성/기존 결함은 별도 계획으로 남겨요.
