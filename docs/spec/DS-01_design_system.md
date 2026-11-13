# Gravit 백오피스 — 디자인 시스템 (Claude Design 입력용)
 
> **이 문서의 역할**: Claude Design이 모든 화면에 일관되게 적용할 디자인 토큰과 컴포넌트 명명 규칙을 정의합니다. 함께 첨부할 문서: `DS-00_overview.md` (프로젝트 개요).
 
---
 
## 1. 컬러 토큰
 
### 1-1. Brand 컬러
 
| 토큰명 | 값 | 용도 | 사용 원칙 |
|---|---|---|---|
| `primary` | `#7738EE` | 액션 버튼, 활성 상태, 강조 요소 | **포인트 사용만** (큰 면적 금지, 텍스트 본문 금지) |
| `primary-hover` | `#6A2FD9` | Primary hover 상태 | |
| `primary-bg-subtle` | `#7738EE` 8% opacity | 활성 메뉴 배경, 포커스 영역 | |
| `primary-bg-badge` | `#7738EE` 12% opacity | ADMIN 뱃지 배경 | |
 
### 1-2. Neutral (Grayscale) 컬러
 
| 토큰명 | 값 | 용도 |
|---|---|---|
| `text-primary` | `#171717` | 본문 텍스트, 강조 텍스트 |
| `text-secondary` | `#525252` | 보조 텍스트, 라벨 |
| `text-muted` | `#737373` | 메타 정보, breadcrumb |
| `text-disabled` | `#A3A3A3` | 비활성 텍스트 |
| `border` | `#E5E7EB` | 카드/구분선 보더 |
| `bg-surface` | `#FFFFFF` | 카드 배경, 사이드바 배경, 헤더 배경 |
| `bg-page` | `#FAFAFA` | 페이지 전체 배경, 로그인 배경 |
| `bg-hover` | `#F5F5F5` | 메뉴 hover, 행 hover, disabled input 배경 |
 
### 1-3. Semantic 컬러 (의미별)
 
| 의미 | 토큰명 | 텍스트 | 배경 | 사용 케이스 |
|---|---|---|---|---|
| Success | `success-text` / `success-bg` | `#15803D` | `#DCFCE7` | 활성, 해결됨, 게시중, 반영 완료 |
| Warning | `warning-text` / `warning-bg` | `#C2410C` | `#FFEDD5` | 정지, 검수 대기 |
| Danger | `danger-text` / `danger-bg` | `#B91C1C` | `#FEE2E2` | 미해결, destructive 액션, 검증 에러 |
| Info | `info-text` / `info-bg` | `#1D4ED8` | `#DBEAFE` | 객관식 |
| Accent | `accent-text` / `accent-bg` | `#7E22CE` | `#F3E8FF` | 주관식 |
| Muted | `muted-text` / `muted-bg` | `#737373` | `#F5F5F5` | DRAFT, DELETED, ARCHIVED |
 
## 2. 타이포그래피 토큰
 
| 토큰명 | 크기 / 굵기 | 용도 |
|---|---|---|
| `display` | 32px / bold | 대시보드 카운트 위젯의 큰 숫자 |
| `h1` | 24px / bold | 페이지 타이틀 (예: 화면 상단의 "유저 관리") |
| `h2` | 20px / semibold | 섹션 타이틀 |
| `h3` | 16px / semibold | 카드 타이틀, 모달 타이틀 |
| `body` | 14px / regular | 본문, 테이블 셀, 폼 라벨 |
| `caption` | 12px / regular | 메타 정보, 링크, 에러 메시지 |
 
### 폰트 패밀리
 
```
font-sans:  시스템 폰트 + Pretendard
            (한글 본문에 Pretendard 우선 적용 권장)
font-mono:  Tailwind 기본 monospace
            (라벨명 표시 — YYYY-MM-DD-update 등)
```
 
## 3. 간격 / 레이아웃 토큰
 
| 토큰명 | 값 | 용도 |
|---|---|---|
| `sidebar-width` | 240px | 사이드바 폭 (고정) |
| `header-height` | 56px | 헤더 높이 (고정) |
| `content-max-width` | 1200px | 컨텐츠 영역 최대 폭 |
| `content-padding-x` | 32px | 컨텐츠 좌우 패딩 |
| `content-padding-y` | 24px | 컨텐츠 상단 패딩 |
| `card-padding` | 24px | 카드 내부 패딩 |
| `modal-width-default` | 400px | 일반 confirm 모달 폭 |
| `modal-width-wide` | 480px | 라벨명 입력 모달 폭 (스테이징 promote) |
| `login-card-width` | 400px | 로그인 카드 폭 |
| `card-gap` | 16px | 카드 사이 간격 |
| `menu-gap` | 4px | 사이드바 메뉴 항목 사이 여백 |
| `viewport-min-width` | 1280px | 전체 최소 폭 |
 
## 4. 모서리 / 보더 토큰
 
| 토큰명 | 값 | 용도 |
|---|---|---|
| `radius-card` | 8px | 카드 모서리 |
| `radius-button` | 6px | 버튼 모서리 (shadcn/ui 기본) |
| `radius-input` | 6px | 입력 필드 모서리 |
| `border-width` | 1px | 일반 보더 |
| `border-active-menu` | 3px | 활성 메뉴 좌측 보더 (`#7738EE`) |
| `border-changed-input` | 4px | 변경된 입력 필드 좌측 보더 (스테이징 폼, `#7738EE`) |
 
---
 
## 5. 컴포넌트 명명 규칙
 
> **중요**: 아래 컴포넌트 이름들은 Claude Design과 대화할 때 **이 이름으로 호출**해주세요. 일관된 어휘로 정확한 결과를 얻을 수 있습니다.
>
> 예시 사용법:
> - "이 화면에 **Status Badge**(success)를 추가해줘"
> - "**Confirm Modal**(destructive variant)을 사용해서 삭제 확인을 받아줘"
> - "**Page Header** 패턴을 적용해줘"
 
### 5-1. 레이아웃 컴포넌트
 
| 컴포넌트명 | 설명 |
|---|---|
| **Main Layout** | 사이드바 + 헤더 + 컨텐츠 영역의 전체 레이아웃 (로그인 외 모든 화면) |
| **Login Layout** | 사이드바 없는 독립 레이아웃 (로그인 화면 전용) |
| **Sidebar** | 좌측 240px 고정 네비게이션 |
| **Header** | 상단 56px 영역, breadcrumb 또는 페이지 타이틀 + 로그아웃 |
| **Content Area** | max-width 1200px, 32px 좌우 padding, 24px 상단 padding |
 
### 5-2. 페이지 패턴
 
| 패턴명 | 설명 |
|---|---|
| **Page Header** | 페이지 타이틀(h1) + 설명 텍스트(선택) + 우측 액션 버튼(선택) |
| **List Page** | 페이지 헤더 + 검색·필터 바(선택) + 테이블 + 페이지네이션 |
| **Detail Page** | 페이지 헤더 + 카드 단위 정보 영역 |
| **Form Page** | 페이지 헤더 + 입력 필드들 + 하단 우측 액션 버튼 |
 
### 5-3. 데이터 표시 컴포넌트
 
| 컴포넌트명 | 설명 |
|---|---|
| **Data Table** | 헤더 + 행으로 구성된 테이블. 페이지당 20행 고정. 행 hover 시 `bg-hover` 배경 + cursor pointer |
| **Pagination** | shadcn/ui Pagination 컴포넌트. 숫자 페이지네이션 + 이전/다음 버튼 |
| **Filter Bar** | 검색 input + 드롭다운 필터들로 구성된 가로 막대 |
| **Status Badge** | 상태 표시 뱃지. variant로 success/warning/danger/info/accent/muted 구분 |
| **Stat Card** | 대시보드 위젯용. 라벨(작은 텍스트) + 큰 숫자(display) + 링크 |
| **Info Card** | 흰 배경, 1px 보더, 8px radius, 24px padding의 기본 카드 |
 
### 5-4. 입력 컴포넌트
 
| 컴포넌트명 | 설명 |
|---|---|
| **Text Input** | shadcn/ui Input |
| **Textarea** | shadcn/ui Textarea |
| **Select Dropdown** | shadcn/ui Select |
| **Radio Group** | shadcn/ui RadioGroup (객관식 정답 선택 등) |
| **Checkbox** | shadcn/ui Checkbox (공지 pinned, 라벨명 입력 동의 등) |
| **Search Input** | 좌측에 검색 아이콘이 있는 Text Input + 우측 [검색] 버튼 |
 
### 5-5. 액션 컴포넌트
 
| 컴포넌트명 | Variant | 사용 케이스 |
|---|---|---|
| **Primary Button** | default (Primary 컬러) | 일반 액션 ([저장], [확인] 등) |
| **Outline Button** | outline | 보조 액션 ([취소], 보조 버튼) |
| **Ghost Button** | ghost | 헤더 [로그아웃], 인라인 [편집] 등 |
| **Destructive Button** | destructive (빨강) | 위험 액션 ([삭제], [반영], role 상승 등) |
 
### 5-6. 피드백 컴포넌트
 
| 컴포넌트명 | 설명 |
|---|---|
| **Confirm Modal** | shadcn/ui Dialog 기반. 폭 400px. 위험 액션은 destructive variant |
| **Strict Match Modal** | 폭 480px. 라벨명 정확 입력 후에만 [반영] 활성화 (스테이징 promote 전용) |
| **Toast (Success)** | 우상단, 초록 계열, 3초 자동 dismiss |
| **Toast (Error)** | 우상단, 빨강 계열, 3초 자동 dismiss |
| **Empty State** | 회색 아이콘(48px) + 제목 + 설명 텍스트 (테이블 빈 상태) |
| **Error State** | 회색 경고 아이콘(48px) + 메시지 + [다시 시도] 버튼 |
| **Loading Skeleton** | 회색 placeholder bar들 (테이블 행 모양) |
 
### 5-7. 특수 컴포넌트
 
| 컴포넌트명 | 설명 |
|---|---|
| **Breadcrumb** | 헤더 좌측. 14px, `text-muted` 색상, 마지막 항목만 `text-primary` 강조 |
| **Banner (Success)** | 페이지 상단 안내 배너. 배경 `success-bg`, 텍스트 `success-text` |
| **Progress Bar** | 가로 막대 + 우측 % 텍스트. Primary 컬러 |
 
---
 
## 6. 상태별 변형 규칙
 
각 컴포넌트는 다음 상태 변형을 지원합니다.
 
| 상태 | 적용 대상 | 시각 처리 |
|---|---|---|
| **Default** | 모든 컴포넌트 | 기본 스타일 |
| **Hover** | 클릭 가능한 모든 요소 | 배경 변화 (`bg-hover`) 또는 색상 강조 |
| **Active / Pressed** | 버튼, 메뉴 | Primary 컬러 강조 또는 약간 어두운 배경 |
| **Focus** | 입력 필드, 버튼 | shadcn/ui 기본 focus ring |
| **Disabled** | 모든 인터랙티브 요소 | 회색 처리, opacity 50%, cursor not-allowed |
| **Loading** | 버튼, 액션 | spinner + 텍스트, disabled 상태 |
| **Error** | 입력 필드 | `danger-text` 보더 + 하단 에러 메시지 |
| **Read-only** | 입력 필드 | 회색 배경(`bg-hover`), 회색 텍스트(`text-secondary`) |
 
---
 
## 7. 아이콘 사용 규칙
 
- **라이브러리**: `lucide-react`만 사용
- **기본 크기**: 16px (인라인) / 20px (메뉴) / 48px (Empty/Error 상태)
- **컬러**: 텍스트 컬러를 따름 (currentColor)
### 사이드바 메뉴 아이콘 매핑
 
| 메뉴 | 아이콘 |
|---|---|
| 대시보드 | `LayoutDashboard` |
| 유저 관리 | `Users` |
| 신고 관리 | `AlertTriangle` |
| 학습 컨텐츠 | `BookOpen` |
| 스테이징 | `FlaskConical` |
| 공지 관리 | `Megaphone` |
 
### 자주 사용되는 아이콘
 
| 용도 | 아이콘 |
|---|---|
| 검색 | `Search` |
| 로그아웃 | `LogOut` |
| 편집 | `Pencil` |
| 삭제 | `Trash2` |
| 추가 | `Plus` |
| 닫기 | `X` |
| 펼침/접힘 | `ChevronDown`, `ChevronUp` |
| 이전/다음 | `ChevronLeft`, `ChevronRight` |
| 고정 | `Pin` |
| 성공/완료 | `CheckCircle2` |
| 경고 | `AlertTriangle` |
| 정보 | `Info` |
| 외부 링크 | `ExternalLink` |
 
---
 
## 8. Claude Design 사용 시 디자인 시스템 호출 방식
 
위 컴포넌트 이름과 토큰 이름을 Claude Design과 대화할 때 그대로 사용해주세요. 예시:
 
> 좋은 예: "**List Page** 패턴으로 화면을 구성해줘. 상단에 **Page Header**(타이틀: '유저 관리')를 두고, 그 아래 **Filter Bar**(검색 input + 상태 드롭다운 + 역할 드롭다운), 그 아래 **Data Table**(컬럼: 이메일, 닉네임, handle, 역할, 상태, 가입일), 마지막에 **Pagination**을 배치해."
 
> 나쁜 예: "유저 목록 화면을 만들어줘"
 
---
 
**문서 작성일**: 2026-04-26  
**문서 버전**: 1.0