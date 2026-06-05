# 규칙 — UI·디자인 토큰 컨벤션

> 근거: **`DS-01`(컬러/타이포/간격/보더 토큰·컴포넌트 §1~7)** = 토큰 권위, **`DS-02`(16화면 시각 명세)**, `DS-03`(상호작용), `DS-00`(개요). 특정 시각 디테일이 명세에 없거나 모순일 때만 멈춰 질문(🙋🏻).

## 불변 (token-lint 가 강제 → [[hooks]])
- **데스크탑 1280px+ 단일 폭.** 반응형/모바일/태블릿 코드 금지. break point 없음.
- **라이트 모드 전용.** 다크 모드 코드 금지.
- raw hex·하드코딩 arbitrary 값(`#fff`, `[13px]`) 금지. 색/간격/타이포는 **토큰만** 사용.
- 토큰 정의는 `globals.css`(CSS 변수) + `tailwind.config.ts` 에만(=token-lint allow 대상). 그 외 파일에서 토큰 정의 금지.

## DS-01 ↔ Tailwind 클래스 명명 매핑 (명명 SoT)

> **값의 SoT** = `DS-01 §1~4`(디자인 값) + `src/shared/styles/globals.css`(CSS 변수 = 기술 베이스). **이 표는 명명 매핑만** 담는다(값 복붙 금지 — hex/HSL 은 위 두 곳에서만 본다). 표 ↔ 명세 충돌 시 **DS-01/globals.css 가 override**.
>
> ⚠️ **shadcn 충돌 주의 (가장 흔한 실수)**: Tailwind 클래스 `text-primary` 는 shadcn 브랜드 컬러 `primary`(#7738EE 보라)를 가리킨다 — DS-01 토큰 `text-primary`(본문 #171717)가 **아니다**. 본문 텍스트는 반드시 **`text-foreground`** 를 쓴다.

**브랜드 (DS-01 §1-1)** — Primary 는 포인트(액션·강조)만, 큰 면적 금지.

| DS-01 토큰명 | Tailwind 클래스 | CSS 변수 | 용도 |
|---|---|---|---|
| `primary` | `bg-primary` · `text-primary-foreground` · `ring-ring` | `--primary` | 액션·활성·강조 |
| `primary-hover` | `hover:bg-primary-hover` | `--primary-hover` | Primary hover |
| `primary-bg-subtle` | `bg-primary-subtle` | `--primary` /0.08 | 활성 메뉴 배경·포커스 영역 |
| `primary-bg-badge` | `bg-primary-badge` | `--primary` /0.12 | ADMIN 뱃지 배경 |

**중립 텍스트 (DS-01 §1-2)** — DS 토큰명과 Tailwind 클래스가 어긋나는 영역(충돌 회피 `fg` 네임스페이스).

| DS-01 토큰명 | Tailwind 클래스 | CSS 변수 | 용도 |
|---|---|---|---|
| `text-primary` | `text-foreground` (≡ `text-fg`) | `--foreground` | 본문·강조 텍스트 |
| `text-secondary` | `text-fg-secondary` | `--fg-secondary` | 보조 텍스트·라벨 |
| `text-muted` | `text-muted-foreground` (≡ `text-fg-muted`) | `--muted-foreground` | 메타 정보·breadcrumb |
| `text-disabled` | `text-fg-disabled` | `--fg-disabled` | 비활성 텍스트 |

**중립 표면 (DS-01 §1-2)**

| DS-01 토큰명 | Tailwind 클래스 | CSS 변수 | 용도 |
|---|---|---|---|
| `border` | `border-border` | `--border` | 카드·구분선 보더 |
| `bg-surface` | `bg-surface` (≡ `bg-background`/`bg-card`) | `--surface` | 카드·사이드바·헤더 배경 |
| `bg-page` | `bg-page` | `--page` | 페이지 전체·로그인 배경 |
| `bg-hover` | `bg-hover` (≡ `bg-muted`) | `--hover` | 메뉴·행 hover, disabled input 배경 |

**시맨틱 의미별 (DS-01 §1-3)** — text/bg 쌍. DS `accent`(주관식)·`muted`(DRAFT 등)는 shadcn `accent`/`muted` 와 구분 위해 **`-ds`** 접미.

| DS-01 토큰명 | Tailwind 클래스 | CSS 변수 | 용도 |
|---|---|---|---|
| `success-text` / `success-bg` | `text-success-text` / `bg-success-bg` | `--success-text` / `--success-bg` | 활성·해결됨·게시중·반영완료 |
| `warning-text` / `warning-bg` | `text-warning-text` / `bg-warning-bg` | `--warning-text` / `--warning-bg` | 정지·검수 대기 |
| `danger-text` / `danger-bg` | `text-danger-text` / `bg-danger-bg` (≡ `bg-destructive`) | `--danger-text` / `--danger-bg` | 미해결·destructive·검증 에러 |
| `info-text` / `info-bg` | `text-info-text` / `bg-info-bg` | `--info-text` / `--info-bg` | 객관식 |
| `accent-text` / `accent-bg` (주관식) | `text-accent-ds-text` / `bg-accent-ds-bg` | `--accent-ds-text` / `--accent-ds-bg` | 주관식 |
| `muted-text` / `muted-bg` (DRAFT 등) | `text-muted-ds-text` / `bg-muted-ds-bg` | `--muted-ds-text` / `--muted-ds-bg` | DRAFT·DELETED·ARCHIVED |

**레이아웃·타이포·보더 (DS-01 §2~4)** — `tailwind.config.ts` 에 직접 정의(CSS 변수 미경유, `—`).

| DS-01 토큰명 | Tailwind 클래스 | CSS 변수 | 용도 |
|---|---|---|---|
| `sidebar-width` | `w-sidebar` · `p-sidebar` | — | 사이드바 폭(240) |
| `header-height` | `h-header` | — | 헤더 높이(56) |
| `content-max-width` | `max-w-content` | — | 컨텐츠 최대폭(1200) |
| `viewport-min-width` | `min-w-viewport` | — | 전체 최소폭(1280) |
| `login-card-width` | `max-w-login-card` | — | 로그인 카드(400) |
| `modal-width-default` / `-wide` | `max-w-modal` / `max-w-modal-wide` | — | confirm(400) / promote(480) |
| `border-active-menu` | `border-l-3` | — | 활성 메뉴 좌측(3px) |
| `border-changed-input` | `border-l-4` | — | 변경 입력 좌측(4px, Tailwind 기본) |
| `radius-card` | `rounded-lg` | `--radius`(8px) | 카드 모서리 |
| `radius-button` / `radius-input` | `rounded-md` | `--radius` − 2px(6px) | 버튼·입력 모서리 |
| `display`·`h1`·`h2`·`h3`·`body`·`caption` | `text-display`·`text-h1`·`text-h2`·`text-h3`·`text-body`·`text-caption` | — | 타이포 스케일(DS-01 §2) |
| 폰트 | `font-sans`(Pretendard) / `font-mono` | — | 한글 본문 / 라벨명(YYYY-MM-DD-update) |

> 위 클래스의 **권위는 이 표**다. `tailwind.config.ts`/`globals.css` 는 값(기술 베이스)을, 이 표는 명명을 소유한다(플레이북 #4 — 파생 사실은 집 하나). Step 2 공용 컴포넌트는 이 표를 참조.

## Figma 사용 정책 (있을 때 / 없을 때 — fill, not invent)
화면 구현은 Figma URL 인테이크(선택)로 시작한다(implement-one-screen §0). **Figma 는 시각 한정** 참조다.

**시각 우선순위**: Figma 프레임(있으면, 가장 구체) → `DS-02`(화면 시각 명세) → `DS-03`(상호작용) → `DS-01` 토큰 + 기존 구현 화면 관례.

- **Figma 있을 때**: 레이아웃·구성·간격 의도의 1차 참조. 값(색·px·타이포)은 **DS-01 토큰으로 매핑**한다.
  - Figma 에만 있고 토큰에 없는 값 → **가장 가까운 토큰 사용. 새 토큰·raw 값 임의 추가 금지, 사용자 질문 금지.** (token-lint 가 raw 값 차단 → [[hooks]])
  - **레이아웃·구성은 Figma 우선**(DS 명세가 추상적). 단 DS-00 전역 invariant(라이트·1280px 단일폭·반응형 금지)와 동작/데이터/계약(01/03/04)은 **고정** — Figma 무권한.
  - **브랜드/일러스트 특수 화면 예외**([[decisions]] D5, 예: LOGIN): 사용자 승인 시 **해당 화면 한정** 브랜드 토큰(globals.css/tailwind.config)·일러스트·브랜드아이콘 에셋 허용. 그 외 일반 화면은 '토큰만' 규칙 충실(브랜드 토큰 사용 금지).
- **Figma 없을 때(또는 URL 미제공)**: 위 우선순위(DS-02 → DS-03 → DS-01+관례)로 **자체 완성. 중단·질문 안 함.**
- **공통(시각 한정)**: **동작·필드·엔드포인트·검증 규칙은 Figma 무권한 — 명세에 없으면 만들지 않는다**(→ [[source-of-truth]] 멈춤 규칙, [[antipatterns]]). Figma 사용 여부/자체 보완 항목은 **리뷰 패킷 §C 에 표시**(사후 검수용).
- 명세·DS·Figma 어디에도 시각 근거가 전혀 없고 추정이 과할 때(레이아웃 자체 불명확)만 보완하지 말고 멈춰 질문(🙋🏻).

## 컴포넌트 원칙
- **shadcn/ui 우선**. 커스텀은 shadcn/ui 확장 + 디자인 토큰 경유로만. shadcn 기본값(예 radius 6px) 따른다.
- 아이콘 `lucide-react`. 한글 폰트 Pretendard.
- Primary `#7738EE` 는 **액션·강조에만**(큰 면적 금지). 위험 액션은 destructive(빨강).

## 글로벌 레이아웃 (DS-00 §7)
- Sidebar 240px(우측 1px border, 활성 메뉴 좌측 3px Primary) · Header 56px(하단 1px) · Content max 1200px(좌우 32/상단 24 padding) · 페이지 배경 `#FAFAFA`. `/login` 은 사이드바 없는 독립 레이아웃.

## 공통 패턴 (01 §5, DS-03)
- 목록: 테이블 + (해당 화면만)검색/필터 + 페이지네이션. 4상태 = Empty/Loading(skeleton)/Error/Data 모두 구현.
- Confirm 모달 400px / **Strict-Match 모달 480px**(promote 전용, 라벨명 정확 일치 시 [반영] 활성). 닫기 = ESC/외부클릭/X.
- 토스트 `sonner`, 3초 자동 dismiss(라우팅 이동 후에도 유지).
- 인라인 편집 A 패턴(스테이징): 변경 필드 좌측 `border-l-4` Primary, 항목 단위 저장, 미저장 항목 ● 표시.
- Badge variant(DS-03 §1-2): **destructive** = 공지 DELETE · role→ADMIN · status→DELETED. 그 외 Primary.

관련: [[good-patterns]] · [[antipatterns]] · [[decisions]]
