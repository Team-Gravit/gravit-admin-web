# 규칙 — 확정 결정(Locked Decisions)

> spec 간 충돌·미확정 사항에 대해 **이미 내려진 결정**. 재논의 금지(바꾸려면 사용자 승인). 근거 spec 섹션을 함께 적는다. phase 파일들이 `D1~D4` 로 참조한다.

## D1 — 주관식 정답 = 단일 객체 (배열 아님, prod·staging·GET·PATCH 전부 동일)
- **백엔드 실체(이 결정이 단일 권위)**: 주관식 정답은 **항상 1개**. **단일 객체** `{ answerId: number, content: string, explanation: string }`.
  - `content` 는 콤마로 묶인 인정표기 1개의 **단일 텍스트**(예: `"데이터베이스,데이터 베이스,database"`). `List<String>` 분해 금지.
  - GET·PATCH, prod(`/problems`)·staging(`/staging`) **전부 동일한 단일 객체**. (`build-state.json.meta.subjective_model = "B-single-comma"`)
- 표시 모드: `content` 한 줄 그대로 표시 + 해설 1개. `(N개)` 표기 **없음**.
- 편집 모드: **Text Input 1개(content) + Textarea 1개(해설)**. `[+ 정답 추가]`/`X 삭제` 버튼 **없음**.
- PATCH body: prod `PATCH /problems/{id}/subjective` = `{ instruction?, content?, answer:{ answerId, content, explanation } }` · staging `PATCH /staging/answers/{answerId}` = 해당 정답의 `content`/`explanation` 만(단일).
- 적용: `PROBLEM_DETAIL` 주관식, `STAGING_DETAIL` 6-4 주관식 폼 + 그루핑 응답.
- 근거: **백엔드 DB/Admin 계약(단일 String content + explanation + answerId)** + `04 §2`. ⚠️ **`03 §7-12/§7-14/§8-2/§8-6` 의 `answers` 배열 표기는 실체와 어긋난 stale 기재** → spec/03 정정 대상(사람 처리). **`answers` 배열 / "1요소 배열로 보존" / GET↔PATCH 모델 불일치 = 전부 금지(우회 금지).** `DS-02/DS-03 의 "다중 정답 N개" 묘사도 무시**. (사용자 결정 2026-06-06)

## D2 — 주관식 정답 1개 고정 (추가/삭제 없음)
- 정답은 **1개 고정**. 운영자는 **내용만 수정**(추가·삭제 UI·API 없음).
- `content` 는 **콤마 표기 단일 텍스트**로 표시·편집, **해설 1개**.
- 근거: D1 단일 객체 모델(사용자 결정 2026-06-06). (구 "개수 고정 / `SUBJECTIVE_ANSWER_COUNT_FIXED`" 서술은 배열 모델 전제라 폐기 — 정답은 1개이며 개수 개념 자체가 없음.)

## D3 — 운영자 자기 자신 권한/상태 변경 허용
- 본인 계정의 role/status 변경 **허용**(차단하지 않음). 단 위험 경고를 시각적으로 노출.
- 주의: 본인 role 을 USER 로 바꾸면 즉시 백오피스 접근 권한 상실.
- 근거: `01 §6-3-2`(Q3).

## D4 — `GET /admin/me` (운영자 프로필) — 구현·배선됨
- `BACKEND_ADMIN_API_SPEC §4-0` 에 신설: `GET /api/v1/admin/me` → `{ adminId, nickname, email, profileImgNumber }`. User 엔티티 재사용(신규 테이블·마이그레이션 없음). 백엔드 핸드오프 = `PROMPT_admin_me.md`.
- 프론트: `protectedLoader`(부트스트랩)에서 store 비었을 때 1회 fetch → `store.setAdmin` → 사이드바 표시. fetch 실패는 **비차단**(/me 미배포·일시 실패 시 '운영자' 폴백, 진입 허용).
- 프로필 이미지: **닉네임 이니셜 아바타**. `profileImgNumber` 는 수신·저장만(실이미지 전환은 추후 — 백엔드 URL 서빙 또는 프리셋 번들 결정 시).
- 근거: `.claude/resource/phases/step-2-infra.md`; 사용자 결정 2026-06-07(이니셜 아바타).

## D5 — LOGIN 브랜드 예외 + 레이아웃은 Figma 우선
- **레이아웃·구성은 Figma 우선**(DS 명세가 추상적이므로). 단 DS-00 전역 invariant(라이트 모드·1280px 단일폭·반응형 금지)와 동작/데이터/계약(01/03/04)은 **고정**(Figma 무권한).
- LOGIN 은 유일한 브랜드/일러스트 화면. **이 화면 한정** 브랜드 토큰(kakao/naver/google)·일러스트·브랜드아이콘 에셋 허용 — "새 토큰 금지" 예외. 그 외 모든 화면은 DS 미니멀·토큰만 충실(브랜드 토큰·일러스트 사용 금지).
- 근거: 사용자 결정(2026-06-05). 적용·상세: `.claude/rules/ui-conventions.md` "Figma 사용 정책".

## D6 — 문제 본문(`problem.content`) = 마크다운 (공지와 동일 렌더러)
- 문제 **본문 `content`** 는 마크다운 텍스트로 취급한다(공지 본문과 동일). 표시·편집 모두 공용 `MarkdownViewer`/`MarkdownEditor`(작성/미리보기 토글) 사용.
- **마크다운 대상은 본문 `content` 만.** 지시문 `instruction`, 객관식 옵션 `option.content`, 주관식 정답 `answer.content`(콤마표기), 해설 `explanation` 은 **plain text 유지**(InfoRow·일반 입력).
- 렌더러 위치: `src/shared/components/markdown/`(공용). GFM·raw HTML 비허용(XSS 안전, react-markdown 기본). 새 의존성·새 토큰 없음.
- 명세 메모: `04 §123/§9-10` 의 "마크다운 = 공지 표시 전용" 서술은 이 결정으로 **확장**됨(문제 본문 포함). spec/ 문서 정정은 사용자(명세 주인) 몫.
- 근거: 사용자 결정(2026-06-15).

## D7 — 대시보드 활성 유저 추이 API (DAU/MAU) — 계약 확정 (spec/03 미기재, 이 항목이 권위)
- 사용자가 전달한 백엔드 계약(2026-09-06). **spec/03 §4 반영은 사람 몫**(PreToolUse 가 spec/ 쓰기 차단) — 반영 전까지 이 항목이 계약 SoT.
- **엔드포인트 2종** (Base `/api/v1/admin/dashboard`, Bearer + ROLE_ADMIN 아니면 403):
  - `GET /dashboard/active-users/daily?days={1~365}` (기본 30) → `{ points: [{ date: "yyyy-MM-dd", dau: number≥0 }] }`
  - `GET /dashboard/active-users/monthly?months={1~36}` (기본 12) → `{ points: [{ month: "yyyy-MM", mau: number≥0, inProgress: boolean }] }`
- **배열 보장**: 오래된→최신 순, 요청 기간만큼 항상 연속·완전(빈 날/달도 0으로 채워짐, 길이 = 요청 파라미터). 프론트에서 빈 구간 보간 금지(불필요).
- **`inProgress`**: 마지막 항목(이번 달)에서만 true = 부분 집계 신호. 차트에서 반드시 다른 스타일(옅은 색 등)로 구분, 지난 달과 직접 비교 UI 금지(예: 전월 대비 delta 미표시).
- **MAU 정의**: 달력 월 기준(rolling 30일 아님), 유저당 월 1 카운트. 배포 이전 날짜/월은 소급 불가로 0 또는 부분 집계.
- **에러**: 파라미터 범위 위반 시 400 `{ "error": "GLOBAL_4001", "message": [string...] }` — 표준 envelope `{code, message}` 와 **다름**. message 배열은 내부 표현 포함이라 화면 노출 부적합 → 파싱하지 않고 실패로만 처리. 프론트는 파라미터를 사용자 입력받지 않고 기본값(생략)으로만 호출하므로 발생 경로 없음.
- **프론트 구현**: DAU·MAU 는 독립 시리즈(시간 단위 상이) → 별도 차트 카드 2개, 한 차트 합침 금지. 기본 요청은 파라미터 생략(days=30·months=12). 진입 시 1회 호출·자동 갱신 없음(03 §4-1 대시보드 관례 준수).
- **시각**: 차트 시리즈 토큰 `--chart-dau`·`--chart-mau` 신설, **둘 다 브랜드 보라(`var(--primary)`)** — 서비스 아이덴티티 반영(사용자 결정 2026-09-06, 초기 초록안 대체). 카드 2개 분리·단일 시리즈라 구분색 불필요. 단 **두 시리즈를 한 차트에 합치게 되면 재검토 필수**: 보라+파랑은 CVD 탈락(protan ΔE 3.5), 보라+초록(#15803D)이 검증 통과(ΔE 28.1) 조합. MAU 바 호버 시 카테고리 밴드 배경 사각형 미표시(`cursor=false`). recharts(shadcn/ui Chart) 의존성 추가. 모두 사용자 승인(2026-09-06).

## D8 — RAVVIT(사내 조회 챗봇) 화면 — 계약·인증·경로 확정 (spec/ 미기재, 이 항목이 권위)
- 별도 배포된 **gravit-chatbot**(Python FastAPI, Notion·Jira MCP + Gemini)을 백오피스 17번째 화면으로 들인다. **디자인은 이식하지 않고 전면 리모델링** — 화면 명세는 루트 **`RAVVIT_SPEC.md`**(인테이크 산출물, 2026-09-09). 충돌 시 **이 D8 > RAVVIT_SPEC.md**.
- **코드 이식 없음.** 챗봇은 독립 HTTP 서비스로 남고 프론트는 API만 호출한다. Python 코드를 이 레포로 옮기지 않는다.

### D8-1 사이드바 (인테이크 오류 정정)
- `RAVVIT_SPEC.md §A-1` 의 "7개 메뉴 전체 표"는 **Claude Desktop 이 레포를 못 보고 쓴 기술이라 실물과 다르다**(문의 관리 누락, 아이콘·라벨·섹션 구조 상이). **기존 사이드바는 Figma(node 8720:4149) 기준으로 그대로 두고 Ravvit 만 삽입한다.**
- 삽입 위치 = **첫 섹션(heading 없음)의 `대시보드` 바로 아래.** 라벨 `Ravvit`, 아이콘 `Bot`. (결정 #1·#2 의 의도를 실제 구조에 매핑한 것)

### D8-2 API 계약 (Base = `VITE_RAVVIT_API_BASE`)
- `GET /health` → `{status, model, tools[], auth}`. **공개(무인증)**. 진입 시 1회 호출, 성공 판정에만 사용하고 값은 화면에 노출하지 않는다.
- `POST /chat` `{question, history}` → **SSE**(`text/event-stream`). 이벤트: `tool_log{message}` 0회 이상 → `answer{answer, history, usage}` 또는 `error{message}` 1회로 종료.
- **`history` 는 불투명(opaque) 값** — 읽기·가공·표시·영속 금지. 저장했다가 그대로 회신만 한다. 초기화 = `[]`.
- **답변 단위 스트리밍 아님** — `answer` 에 완성된 마크다운이 한 번에 온다. 프론트 타자기 연출 금지.
- `03 §2` 표준 envelope(`{code,message}`)·`/api/v1/admin` Base·페이지네이션 규약은 **이 서비스에 적용되지 않는다**(별도 서비스). Zod 파싱 의무는 유지 — SSE 이벤트 3종 전부 스키마로 파싱.

### D8-3 인증 = Gravit 관리자 토큰 introspection
- 챗봇 자체 공유계정(`GRAVITCHAT_AUTH_*`)·`gc_session` 쿠키 **폐기**. 프론트는 기존 관리자 `accessToken` 을 `Authorization: Bearer` 로 보낸다.
- 챗봇은 JWT 서명 검증을 하지 않는다. 받은 토큰을 `GET {GRAVIT_API_HOST}/api/v1/admin/me` 에 되던져 판정한다(서명 키 공유 0). 핸드오프 = `PROMPT_ravvit_auth.md`.
- **상태코드 매핑**: 200 통과 / **401** 토큰 만료·무효(→ 프론트가 reissue 후 1회 재시도) / **403** ADMIN 아님(종착, 재시도 금지) / **503** 인증 서버 장애(401 로 뭉개면 무의미한 재발급·강제 로그아웃 루프).
- 프론트 401 재시도는 **`shared/api/client.ts` 가 export 하는 단일 재발급 절차를 공유**한다. axios 인터셉터와 fetch 클라이언트가 각자 재발급하면 refresh Rotation 때문에 서로의 토큰을 무효화한다. **복제 금지.**

### D8-4 네트워크 경로
- `VITE_RAVVIT_API_BASE` 로 주입. 운영은 **Vercel rewrite 프록시**(`/ravvit-api/:path*` → `https://gravit-chatbot-sepia.vercel.app/api/:path*`), 로컬은 vite `server.proxy` 로 동일 경로. **rewrite 는 기존 SPA catch-all 보다 앞에 둔다**(먼저 매칭되는 규칙이 이긴다).
- Bearer 헤더 방식이라 쿠키가 없다 → CORS `allow_credentials` 불필요, 서드파티 쿠키 차단과 무관. 프록시는 preflight 제거·origin 관리 회피 목적이며 정합성 필수 조건은 아니다.

### D8-5 구현 제약
- **SSE 는 axios 로 불가**(브라우저 스트리밍 미지원) → `features/ravvit/api.ts` 의 fetch + `ReadableStream` 리더. `apiClient` 재사용하지 않는다.
- 대화 상태(메시지·`history`)는 **라우트 컴포넌트 밖 전역 스토어**(zustand). 메뉴 이동 후 복귀 시 유지되어야 하고, 진행 중 SSE 가 언마운트로 끊기면 안 된다.
- 브라우저 저장소 **미사용**(새로고침 시 초기화). 사내 문서 내용을 `localStorage` 에 남기지 않는다.
- 뷰포트 채움 레이아웃은 **`MainLayout` 의 라우트 조건부 분기**로 처리한다(`h-screen overflow-hidden` + `main` 내부 스크롤). 나머지 16화면의 마크업은 건드리지 않는다. `h-[calc(...)]` 류 arbitrary 값 금지(token-lint 차단).
- 신규 의존성 **0개**. 마크다운은 기존 `MarkdownViewer`(D6) 계열 재사용, 링크는 새 탭.
- 근거: 사용자 결정 2026-09-09.

### D8-6 실사용 피드백 반영 (2026-09-09 2차) — RAVVIT_SPEC 결정 #11·#23 **대체**
- **스크롤바가 본문을 침범하지 않는다.** 스크롤 컨테이너는 컨텐츠 폭 전체이고 읽기 컬럼(`max-w-3xl`)은 그 안에서 중앙 정렬한다. 스크롤바를 읽기 컬럼 안에 두면 스크롤 발생 시 본문 폭이 줄어 글이 재배치된다.
- **복사·다시 생성은 답변 하단 액션 행.** 본문 위에 겹치는 hover 버튼(#23)을 폐기한다. 재생성은 **마지막 봇 메시지에서만** — 중간 턴을 되돌리면 이후 맥락이 어긋난다.
- **재생성은 `history` 를 그 턴 이전 스냅샷으로 되돌린 뒤 재전송한다.** 현재 history 로 보내면 방금 받은 답변이 맥락에 섞여 '재생성'이 아니라 '이어서 답하기'가 된다. 실패 재시도와 같은 경로를 쓴다.
- **답변을 점진적으로 드러낸다(타이핑 연출).** 결정 #11("타자기 연출 없음")을 뒤집는다 — 한 번에 뚝 나오는 체감이 나쁘다는 실사용 판단. 서버는 여전히 완성 답변을 한 번에 주므로 이것은 **표시 연출이지 네트워크 스트리밍이 아니다.** 총 소요는 답변 길이와 무관하게 상한(≈0.9s)을 두고, 이미 드러낸 답변은 재렌더·재진입 시 다시 타이핑하지 않는다(`revealed` 플래그).
- 근거: 사용자 결정 2026-09-09(실사용 피드백).

### D8-7 실사용 피드백 2차 (2026-09-09 3차) — RAVVIT_SPEC 결정 #4·#14 **대체**
- **토큰 사용량 미표시.** 결정 #14("답변 하단 상시 표기")를 뒤집는다 — 대화 화면에서 시각적 소음. `usage` 는 계약대로 계속 수신·파싱하되 렌더하지 않는다(다시 켜려면 `BotMessageItem` 에 한 줄 복원).
- **답변 액션(복사·다시 생성)은 아이콘만.** 라벨 텍스트 없이 `aria-label`·`title` 로 접근성·툴팁 유지.
- **초기화 버튼은 아이콘 + `새 채팅` 텍스트.** 확인 모달 문구도 '새 채팅' 기준으로 통일.
- **Header breadcrumb 미설정.** 결정 #4 의 "Header 에 페이지 타이틀 표기" 전제를 폐기한다 — 본문 h1 도 breadcrumb 도 없는 **의도적 무제목 화면**. 사이드바 활성 표시로 현재 위치를 안다.
- **입력 박스**: 한 줄 텍스트(14/20px) + `py-1.5` = 32px 에 버튼도 32px(`h-8 w-8`)로 맞춰 `items-end` 정렬이 정확히 떨어지게 했다. 컨테이너 padding `p-1.5`, 라운드 `rounded-xl`.
  - ⚠️ `rounded-xl`(12px)은 DS-01 의 `radius-input`(6px)·`radius-card`(8px) 밖이다. **대화 입력 박스 한정 예외**(사용자 결정) — 다른 화면 입력에 전파 금지.
- **첫 화면(Empty)에서는 [새 채팅] 을 숨긴다** — 지울 대화가 없다. 줄 높이(`h-9`)는 유지해 레이아웃이 흔들리지 않게 한다.
- **[맨 아래로]는 아이콘만 + 원형 + 그림자**(`rounded-full` + `shadow-md`). 본문 위에 떠 있는 플로팅 버튼이라 라벨 없이 아이콘이 더 낫고, 그림자로 본문과 층을 분리한다.
- **상단 액션 줄은 컨텐츠 폭 전체 기준 우측 정렬**(읽기 컬럼 기준 아님). Header 의 로그아웃 버튼과 세로로 맞아떨어져 정렬 기준이 생긴다. 높이 `h-9` + `items-center` 로 세로 중앙.
- 근거: 사용자 결정 2026-09-09(실사용 피드백 2차·4차).

### D8-8 답변 렌더 = 문자 단위 타이핑 연출
- 답변을 한 번에 띄우지 않고 **문자 단위로 흘려** 보여준다. 총 소요는 답변 길이와 무관하게 상한(`TARGET_DURATION_MS`)을 두고, 이미 드러낸 답변은 재렌더·재진입 시 다시 타이핑하지 않는다(`revealed` 플래그).
- **블록(문단) 단위 + 페이드 인 방식은 시도했다가 기각**(2026-09-09 4차) — 덩어리로 툭툭 붙는 체감이 부자연스럽다는 실사용 판단. 그 대가로 코드 펜스가 타이핑되는 동안 ``` 가 잠깐 노출되는 깜빡임은 감수한다.
- 여전히 **표시 연출이지 네트워크 스트리밍이 아니다** — 서버는 완성 답변을 `answer` 이벤트로 한 번에 준다. 백엔드가 훗날 부분 응답을 흘리게 되면 이 훅은 걷어내고 실제 도착분을 그대로 렌더한다.
- 근거: 사용자 결정 2026-09-09(3차 도입 · 4차 방식 확정).

## 기타 확정값 (계약에서 고정 — 임의 변경 금지)
- 토큰: access **2h** / refresh **14d**, Rotation, refresh 는 Redis 화이트리스트 + body 전달. (`03 §3, §11`)
- 목록 페이지 크기 **20행 고정**(서버 고정, 클라 변경 불가). (`03 §2-4`, `04 §6-3`)
- 객관식: 옵션 정확히 4개, 정답 `isAnswer` 정확히 1개. 정답 변경 시 **이전 정답 옵션 + 새 정답 옵션 2개 모두 PATCH**. (`01 §6-7-6`, `03 §7-12`)
- 스테이징 1 라벨 = 레슨 1 + 문제 6. promote 는 라벨명 **strict match** 입력(대소문자·공백 포함). (`01 §6-7-8`, `03 §8`)
- 공지 상태 단방향: `DRAFT → PUBLISHED → ARCHIVED`(역방향·DRAFT 복귀 불가, ARCHIVED 종착). (`01 §8-5`, `03 §9-4`)
- datetime 전송 **ISO 8601 UTC**. (`03 §12`)

관련: [[source-of-truth]] · [[api-contract]]
