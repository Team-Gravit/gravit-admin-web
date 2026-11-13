# Gravit 백오피스 — 화면 명세 (Claude Design 입력용)
 
> **이 문서의 역할**: 16개 화면의 **시각적 구성**(레이아웃, 컴포넌트 배치, 데이터 표시 방식)만 다룹니다. 모달·토스트·검증 등의 상호작용은 `DS-03_interactions.md`를 참조하세요.
>
> **사용 방법**: 한 번에 한 화면씩 발췌하여 Claude Design에 입력하세요. 각 화면 섹션은 독립적으로 사용 가능합니다.
 
---
 
## 화면 목록
 
| # | 화면 ID | 경로 | 분류 | 복잡도 |
|---|---|---|---|---|
| 1 | `LOGIN` | `/login` | 로그인 | 낮음 |
| 2 | `DASHBOARD` | `/` | 대시보드 | 낮음 |
| 3 | `NOTICE_LIST` | `/notices` | 공지 목록 | 낮음 |
| 4 | `NOTICE_NEW` | `/notices/new` | 공지 작성 | 중간 |
| 5 | `NOTICE_DETAIL` | `/notices/:id` | 공지 상세/수정 | 중간 |
| 6 | `USER_LIST` | `/users` | 유저 목록 | 중간 |
| 7 | `USER_DETAIL` | `/users/:id` | 유저 상세 | 중간 |
| 8 | `REPORT_LIST` | `/reports` | 신고 목록 | 중간 |
| 9 | `REPORT_DETAIL` | `/reports/:id` | 신고 상세 | 중간 |
| 10 | `CHAPTER_LIST` | `/chapters` | 챕터 목록 | 낮음 |
| 11 | `CHAPTER_DETAIL` | `/chapters/:id` | 챕터 상세 | 중간 |
| 12 | `UNIT_DETAIL` | `/units/:id` | 유닛 상세 | 낮음 |
| 13 | `LESSON_DETAIL` | `/lessons/:id` | 레슨 상세 | 낮음 |
| 14 | `PROBLEM_DETAIL` | `/problems/:id` | 문제 상세 | 중간 |
| 15 | `STAGING_LIST` | `/staging/labels` | 스테이징 목록 | 낮음 |
| 16 | `STAGING_DETAIL` | `/staging/labels/:label` | 스테이징 상세 | **높음** |
 
---
 
## 1. LOGIN — `/login`
 
**레이아웃**: Login Layout (사이드바 없음)
 
**배경**: `bg-page` (`#FAFAFA`)
 
**중앙 카드**:
- 폭: 400px (`login-card-width`)
- 흰 배경, 1px border (`border`), 8px radius (`radius-card`), 32px padding
- 수직·수평 중앙 정렬
**카드 내용 (위→아래)**:
1. 로고 + "Gravit Admin" 텍스트 로고
2. h2: "백오피스 로그인"
3. **Outline Button** × 3 (위→아래, 12px 간격)
   - "Google로 로그인" + Google 로고 아이콘
   - "카카오로 로그인" + Kakao 로고 아이콘
   - "네이버로 로그인" + Naver 로고 아이콘
4. (조건부) 로그인 실패 시 카드 하단에 에러 메시지: "백오피스 접근 권한이 없습니다."
---
 
## 2. DASHBOARD — `/`
 
**레이아웃**: Main Layout
 
**Header**: 페이지 타이틀 "대시보드"
 
**Page Header**:
- 타이틀(h1): "대시보드"
- 설명(text-muted): "운영 현황을 한눈에 확인합니다."
**Stat Card × 3** (가로 3등분, 16px gap):
 
| # | 라벨 | 큰 숫자 (display) | 링크 | 아이콘 |
|---|---|---|---|---|
| 1 | "총 유저 수" | 12,345 (천 단위 콤마) | "유저 관리 →" | `Users` |
| 2 | "PENDING 라벨" | 8 | "스테이징 →" | `FlaskConical` |
| 3 | "미해결 신고" | 24 | "신고 관리 →" | `AlertTriangle` |
 
**Stat Card 사양**:
- 카드 padding 24px, 흰 배경, 1px 보더, 8px radius
- 라벨: 14px, `text-secondary`
- 큰 숫자: `display` (32px bold), `text-primary`
- 링크: 12px, Primary 컬러, hover 시 underline
- 카드 hover: 보더 색상이 Primary 50%로 변경, cursor pointer (카드 전체 클릭 가능)
---
 
## 3. NOTICE_LIST — `/notices`
 
**레이아웃**: Main Layout, List Page 패턴
 
**Page Header**:
- 타이틀(h1): "공지 관리"
- 설명: "공지를 등록하고 관리합니다."
- 우측 액션: **Primary Button** "+ 공지 작성"
**Data Table** (검색·필터 없음):
 
| 컬럼 | 폭 | 데이터 |
|---|---|---|
| 📌 (pinned) | 40px | `Pin` 아이콘 (pinned=true일 때만 표시) |
| 제목 | 가변 (flex) | 제목 (1줄 ellipsis) |
| 상태 | 120px | **Status Badge** (DRAFT=muted, PUBLISHED=success, ARCHIVED=muted) |
| 게시일 | 140px | YYYY-MM-DD (DRAFT는 "-") |
| 수정 | 80px | **Ghost Button** "수정" |
 
**Pagination**: 하단 중앙
 
---
 
## 4. NOTICE_NEW — `/notices/new`
 
**레이아웃**: Main Layout, Form Page 패턴
 
**Page Header**: 타이틀(h1) "공지 작성"
 
**입력 카드** (Info Card):
1. **Text Input** "제목 *"
2. **Text Input** (또는 짧은 Textarea) "요약 *"
3. **Textarea** "본문 * (마크다운 지원)" — 높이 충분히 확보 (최소 240px)
4. **Checkbox** "상단 고정 (pinned)"
**하단 우측 액션** (가로 정렬, 8px 간격):
- **Outline Button** "취소"
- **Outline Button** "임시저장"
- **Primary Button** "게시"
> 본문은 마크다운 textarea로 충분합니다. 별도 미리보기/툴바는 첫 디자인 단계에서 미정의.
 
---
 
## 5. NOTICE_DETAIL — `/notices/:id`
 
두 가지 모드 (기본 표시 / 편집).
 
### 5-1. 기본 표시 모드
 
**Page Header 영역**:
- 좌측: 공지 제목(h1) + **Status Badge** + `Pin` 아이콘(pinned=true일 때)
- 좌측 하단: "게시일: 2026-04-20 · 작성일: 2026-04-19" (text-muted, 12px)
- 우측 액션: **Ghost Button** "편집" + **Ghost Button** "삭제" (Trash2 아이콘 + 빨강 텍스트)
**Info Card** (요약 + 본문):
- 섹션 타이틀(h3): "요약"
- 요약 텍스트 (body)
- 섹션 타이틀(h3): "본문"
- 본문 (마크다운 렌더링)
### 5-2. 편집 모드 ([편집] 클릭 시)
 
`NOTICE_NEW`와 동일한 Form Page 패턴 + 추가 필드:
- **Select Dropdown** "상태 *" (현재 상태에 따라 옵션 제한)
- **Checkbox** "상단 고정"
- 하단 우측: **Outline Button** "취소" + **Primary Button** "저장"
---
 
## 6. USER_LIST — `/users`
 
**레이아웃**: Main Layout, List Page 패턴
 
**Page Header**:
- 타이틀(h1): "유저 관리"
- 설명: "유저의 상태와 권한을 관리합니다."
**Filter Bar**:
- **Search Input** (placeholder: "이메일/닉네임/handle 검색")
- **Select Dropdown** "상태" (옵션: 전체/ACTIVE/SUSPENDED/DELETED, 기본: 전체)
- **Select Dropdown** "역할" (옵션: 전체/ADMIN/USER, 기본: 전체)
**Data Table**:
 
| 컬럼 | 폭 | 데이터 | 비고 |
|---|---|---|---|
| 이메일 | 가변 (flex) | email | ellipsis |
| 닉네임 | 120px | nickname | ellipsis |
| handle | 120px | `@{handle}` | `@` prefix 표시 |
| 역할 | 80px | role | **Status Badge** (ADMIN=primary-bg-badge, USER=muted) |
| 상태 | 100px | status | **Status Badge** (ACTIVE=success, SUSPENDED=warning, DELETED=muted) |
| 가입일 | 120px | createdAt | YYYY-MM-DD |
 
**Pagination**: 하단 중앙
 
---
 
## 7. USER_DETAIL — `/users/:id`
 
**레이아웃**: Main Layout, Detail Page 패턴
 
**Page Header**: 타이틀(h1) "유저 상세"
 
**Info Card 1 — 프로필**:
- 좌측: 프로필 이미지 (80×80px, 원형 마스크)
- 우측 (세로 정렬):
  - 닉네임 (h3, 16px semibold)
  - `@handle` (text-muted)
  - 이메일 (text-muted)
  - 가입일 (text-muted)
  - 레벨 (예: "레벨: Lv.12", text-muted)
**Info Card 2 — 권한 및 상태**:
- 섹션 타이틀(h3): "권한 및 상태"
- 행 1: "역할" 라벨 + **Select Dropdown** (ADMIN/USER) + 설명 텍스트(예: "일반 사용자")
- 행 2: "상태" 라벨 + **Select Dropdown** (ACTIVE/SUSPENDED/DELETED) + 설명 텍스트(예: "정상 활동 중")
> 드롭다운 변경 시 모달이 뜹니다 (`DS-03` 참조).
 
---
 
## 8. REPORT_LIST — `/reports`
 
**레이아웃**: Main Layout, List Page 패턴
 
**Page Header**:
- 타이틀(h1): "신고 관리"
- 설명: "유저가 제출한 문제 신고를 처리합니다."
**Filter Bar**:
- **Select Dropdown** "유형" (전체/TYPO_ERROR/CONTENT_ERROR/ANSWER_ERROR/OTHER_ERROR, 기본: 전체)
- **Select Dropdown** "처리상태" (전체/미해결/해결됨, **기본: 미해결**)
**Data Table**:
 
| 컬럼 | 폭 | 데이터 | 비고 |
|---|---|---|---|
| ID | 80px | `#{reportId}` | `#` prefix |
| 유형 | 160px | reportType | 한글 라벨 (오타/내용 오류/정답 오류/기타) |
| 문제ID | 100px | `P-{problemId}` | 별도 링크 (행 클릭과 별도) |
| 상태 | 100px | isResolved | **Status Badge** (false=danger "미해결", true=success "해결됨") |
| 제출일 | 140px | submittedAt | YYYY-MM-DD HH:mm |
 
**Pagination**: 하단 중앙
 
---
 
## 9. REPORT_DETAIL — `/reports/:id`
 
**레이아웃**: Main Layout, Detail Page 패턴
 
**Page Header**:
- 타이틀(h1): "신고 #1024"
- 우측: **Status Badge** (미해결/해결됨)
**Info Card 1 — 신고 정보**:
- 섹션 타이틀(h3): "신고 정보"
- 행: "유형" + 유형 라벨 (예: "오타 (TYPO_ERROR)")
- 행: "문제 ID" + `P-512` + **Ghost Button** "문제 보기 →" (ExternalLink 아이콘은 사용 안 함, 같은 탭 이동)
- 행: "제출일" + 제출일시
**Info Card 2 — 신고 내용**:
- 섹션 타이틀(h3): "신고 내용"
- 인용문 형태로 content 전체 표시 (길이 제한 없음, 스크롤 처리)
**Info Card 3 — 처리 상태**:
- 섹션 타이틀(h3): "처리 상태"
- 행: "현재 상태" + **Select Dropdown** (미해결/해결됨)
---
 
## 10. CHAPTER_LIST — `/chapters`
 
**레이아웃**: Main Layout, List Page 패턴 (검색·필터 없음)
 
**Page Header**:
- 타이틀(h1): "학습 컨텐츠"
- 설명: "운영 중인 챕터/유닛/레슨/문제를 관리합니다."
**Data Table**:
 
| 컬럼 | 폭 | 데이터 |
|---|---|---|
| 제목 | 320px | title |
| 설명 | 가변 (flex) | description (1줄 ellipsis) |
 
**Pagination**: 하단 중앙
 
> 챕터 신규 생성 기능 없음. [+ 새로 만들기] 버튼 표시하지 마세요.
 
---
 
## 11. CHAPTER_DETAIL — `/chapters/:id`
 
**레이아웃**: Main Layout, Detail Page 패턴
 
**Breadcrumb (Header)**: `학습 컨텐츠 > {챕터 제목}`
 
**Page Header**:
- 좌측: 챕터 제목(h1) + 설명(text-muted) — 표시 모드일 때
- 우측 액션: **Ghost Button** "편집"
> 편집 모드 클릭 시 챕터 정보 카드만 input/textarea로 전환 (통계/유닛 목록은 그대로 유지).
 
**Info Card 1 — 풀이 현황**:
- 섹션 타이틀(h3): "풀이 현황"
- 미니 테이블:
| 컬럼 | 폭 | 데이터 |
|---|---|---|
| 유닛명 | flex | unitTitle (ellipsis) |
| 참여 인원 | 100px | participantCount (천 단위 콤마, 우측 정렬) |
| 진행률 | 240px | **Progress Bar** + `{value}%` 텍스트 |
 
> Progress Bar는 Primary 컬러, 0~100% 비례.
 
**Info Card 2 — 유닛 목록**:
- 섹션 타이틀(h3): "유닛 (총 N개)"
- **Data Table** (컬럼: 제목 320px, 설명 가변)
- **Pagination** (해당 카드 내부 하단)
---
 
## 12. UNIT_DETAIL — `/units/:id`
 
**레이아웃**: Main Layout, Detail Page 패턴
 
**Breadcrumb**: `학습 컨텐츠 > {챕터} > {유닛}`
 
**Page Header**:
- 좌측: 유닛 제목(h1) + 설명(text-muted)
- 우측: **Ghost Button** "편집"
**Info Card — 레슨 목록**:
- 섹션 타이틀(h3): "레슨 (총 N개)"
- **Data Table** (컬럼: 제목)
- **Pagination**
---
 
## 13. LESSON_DETAIL — `/lessons/:id`
 
**레이아웃**: Main Layout, Detail Page 패턴
 
**Breadcrumb**: `학습 컨텐츠 > {챕터} > {유닛} > {레슨}`
 
**Page Header**:
- 좌측: 레슨 제목(h1)
- 우측: **Ghost Button** "편집"
**Info Card — 문제 목록**:
- 섹션 타이틀(h3): "문제 (총 N개)"
- **Data Table**:
| 컬럼 | 폭 | 데이터 | 비고 |
|---|---|---|---|
| ID | 100px | `P-{id}` | `P-` prefix |
| 유형 | 100px | problemType | **Status Badge** (OBJECTIVE=info "객관식", SUBJECTIVE=accent "주관식") |
| 지시문 | flex | instruction | 1줄 ellipsis |
 
- **Pagination**
---
 
## 14. PROBLEM_DETAIL — `/problems/:id`
 
**레이아웃**: Main Layout, Detail Page 패턴
 
**Breadcrumb**: `학습 컨텐츠 > {챕터} > {유닛} > {레슨} > P-{id}`
 
**Page Header**:
- 좌측: `P-{id}` (h1)
- 우측: **Status Badge** (객관식/주관식) + **Ghost Button** "편집"
`problemType`에 따라 객관식/주관식 분기.
 
### 14-1. 객관식 — 표시 모드
 
**Info Card 1 — 문제**:
- 섹션 타이틀(h3): "문제"
- 항목: "지시문" + instruction
- 항목: "본문" + content
**Info Card 2 — 보기 (4개 고정)**:
- 섹션 타이틀(h3): "보기 (4개 고정)"
- 4개 옵션 리스트:
  - 형식: `① {content}` (16px)
  - 정답인 옵션: 우측에 `✓ 정답` 표시 (success-text)
  - 그 아래 `해설: {explanation}` (text-secondary, 14px)
### 14-2. 객관식 — 편집 모드
 
**Info Card 1**: 지시문/본문을 input/textarea로 전환
 
**Info Card 2 — 보기 (4개 고정)**:
- 4개 행:
  - 좌측: `①` + **Radio**(정답) + **Text Input**(content)
  - 그 아래: `해설:` + **Text Input**(explanation)
- (옵션 추가/삭제 불가)
**하단 우측**: **Outline Button** "취소" + **Primary Button** "저장"
 
### 14-3. 주관식 — 표시 모드
 
**Info Card 1**: (객관식과 동일 구조 — 지시문, 본문)
 
**Info Card 2 — 정답 (N개)**:
- 섹션 타이틀(h3): "정답 (N개)"
- N개 정답 리스트:
  - 형식: `• {content}` (16px)
  - 그 아래 `해설: {explanation}` (text-secondary, 14px)
### 14-4. 주관식 — 편집 모드
 
**Info Card 1**: 객관식과 동일
 
**Info Card 2 — 정답 (여러 개 허용)**:
- N개 행 각각:
  - 좌측: `•` + **Text Input**(content) + **Ghost Button** `X` 아이콘 (삭제)
  - 그 아래: `해설:` + **Text Input**(explanation)
- 하단: **Ghost Button** "+ 정답 추가"
**하단 우측**: **Outline Button** "취소" + **Primary Button** "저장"
 
---
 
## 15. STAGING_LIST — `/staging/labels`
 
**레이아웃**: Main Layout, List Page 패턴
 
**Page Header**:
- 타이틀(h1): "스테이징"
- 설명: "자동 생성된 컨텐츠를 검수하고 운영에 반영합니다."
**Filter Bar**:
- **Select Dropdown** "상태" (전체/PENDING/COMPLETED, **기본: PENDING**)
**Data Table**:
 
| 컬럼 | 폭 | 데이터 | 비고 |
|---|---|---|---|
| 라벨 | 180px | label | **monospace 폰트** (font-mono) |
| 유닛 | 80px | `U-{unitId}` | `U-` prefix |
| 설명 | 가변 (넓게) | description | 폭 우선 |
| 상태 | 100px | status | **Status Badge** (PENDING=warning "검수 대기", COMPLETED=success "반영 완료") |
| 생성일 | 120px | createdAt | YYYY-MM-DD |
 
**Pagination**: 하단 중앙
 
---
 
## 16. STAGING_DETAIL — `/staging/labels/:label` ⭐ 가장 복잡한 화면
 
**레이아웃**: Main Layout, **2단 분할 패턴** (좌측 항목 리스트 + 우측 편집 폼)
 
**Breadcrumb**: `스테이징 > {label}`
 
### 16-1. 헤더 영역 (좌우 영역 위 전체 폭)
 
```
┌──────────────────────────────────────────────────────────────────┐
│ 2026-04-25-update            [PENDING]      [반영 완료 처리]    │
│ U-12 · 배열 챕터 5번째 사이클 · 생성일 2026-04-25                │
└──────────────────────────────────────────────────────────────────┘
```
 
- 좌측: 라벨명 (h1, 24px bold, **monospace**)
- 좌측 옆: **Status Badge** (PENDING=warning, COMPLETED=success)
- 우측: **Destructive Button** "반영 완료 처리" (PENDING일 때만 표시, COMPLETED 시 숨김)
- 두 번째 줄: `U-{unitId} · {description} · 생성일 {createdAt}` (text-muted, 14px)
### 16-2. (조건부) 안내 배너 — COMPLETED 상태일 때만
 
헤더 바로 아래, 좌우 영역 위:
 
- **Banner (Success)**:
  - 배경 `success-bg`, 텍스트 `success-text`
  - `CheckCircle2` 16px 아이콘
  - 텍스트: "이 라벨은 prod에 반영 완료되었습니다. 더 이상 수정할 수 없습니다."
### 16-3. 좌측 항목 리스트 (폭 280px 고정)
 
```
┌─────────────────────┐
│ 레슨            ●   │  ← 미저장 변경 시 우측에 점
├─────────────────────┤
│ 문제 1   [객관식]   │  ← 활성 항목
├─────────────────────┤
│ 문제 2   [객관식] ● │
├─────────────────────┤
│ 문제 3   [주관식]   │
├─────────────────────┤
│ 문제 4   [객관식]   │
├─────────────────────┤
│ 문제 5   [주관식]   │
├─────────────────────┤
│ 문제 6   [객관식]   │
└─────────────────────┘
```
 
- 항목 7개 (레슨 1 + 문제 6)
- 항목 높이: 약 44px (좌우 12px padding, 상하 12px)
- 레슨 항목: 라벨 "레슨" (14px medium)
- 문제 항목: 라벨 "문제 N" + 우측 끝에 **Status Badge** (객관식/주관식)
- **활성 항목**: 좌측 3px 보더 (Primary), 배경 `primary-bg-subtle`, 텍스트 Primary
- 비활성 hover: 배경 `bg-hover`
- **미저장 변경 표시**: 항목 우측 끝에 4px 원형 점 (Primary 컬러)
- 항목 사이: 1px border-bottom (`border`)
- 초기 활성 항목: 첫 번째 (레슨)
### 16-4. 우측 편집 폼
 
활성 항목에 따라 3가지 폼 변형:
 
#### 16-4-1. 레슨 폼
 
- 섹션 타이틀(h3): "레슨"
- "ID: 901" (text-muted)
- "제목 *" + **Text Input**
- 하단 우측: **Primary Button** "저장" (변경 사항 없을 때 비활성)
#### 16-4-2. 객관식 문제 폼
 
- 섹션 타이틀(h3): "문제 N" + **Status Badge** "객관식"
- "ID: 1001" (text-muted)
- "지시문 *" + **Text Input**
- "본문 *" + **Textarea**
- 섹션 타이틀: "보기 (4개 고정)"
- 4개 옵션 행:
  - `①` + **Radio**(정답) + **Text Input**(보기 본문)
  - 그 아래: "해설:" + **Text Input**(해설)
- 하단 우측: **Primary Button** "저장" (변경 사항 없을 때 비활성)
#### 16-4-3. 주관식 문제 폼
 
- 섹션 타이틀(h3): "문제 N" + **Status Badge** "주관식"
- "ID: 1003" (text-muted)
- "지시문 *" + **Text Input**
- "본문 *" + **Textarea**
- 섹션 타이틀: "정답 (N개)"
- N개 정답 행:
  - `•` + **Text Input**(정답 본문)
  - 그 아래: "해설:" + **Text Input**(해설)
- (정답 추가/삭제 버튼 없음 — 자동 생성된 N개 수정만 가능)
- 하단 우측: **Primary Button** "저장" (변경 사항 없을 때 비활성)
### 16-5. 변경된 입력 필드 시각 표시
 
- 어떤 input이든 **변경된 상태**일 때 좌측 4px 보더 (Primary 컬러)
- 원래 값으로 되돌리면 보더 제거
### 16-6. COMPLETED 상태일 때
 
- 16-2의 Banner 표시
- 헤더 우측 [반영 완료 처리] 버튼 숨김
- 우측 폼의 모든 input/textarea/radio: **Read-only** 상태 (`bg-hover` 배경, `text-secondary` 텍스트)
- 우측 폼 하단 [저장] 버튼: **숨김**
- 좌측 리스트의 미저장 변경(●) 표시: **숨김**
- 좌측 리스트 항목 클릭/전환은 정상 동작
---
 
**문서 작성일**: 2026-04-26  
**문서 버전**: 1.0  
**다음 단계**: 시각 디자인 1차 완료 후 `DS-03_interactions.md`로 모달, 토스트, 검증 동작을 추가하세요.