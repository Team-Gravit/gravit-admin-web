# 규칙 — UI·디자인 토큰 컨벤션

> 근거: **`DS-01`(컬러/타이포/간격/보더 토큰·컴포넌트 §1~7)** = 토큰 권위, **`DS-02`(16화면 시각 명세)**, `DS-03`(상호작용), `DS-00`(개요). 특정 시각 디테일이 명세에 없거나 모순일 때만 멈춰 질문(🙋🏻).

## 불변 (token-lint 가 강제 → [[hooks]])
- **데스크탑 1280px+ 단일 폭.** 반응형/모바일/태블릿 코드 금지. break point 없음.
- **라이트 모드 전용.** 다크 모드 코드 금지.
- raw hex·하드코딩 arbitrary 값(`#fff`, `[13px]`) 금지. 색/간격/타이포는 **토큰만** 사용.
- 토큰 정의는 `globals.css`(CSS 변수) + `tailwind.config.ts` 에만(=token-lint allow 대상). 그 외 파일에서 토큰 정의 금지.

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
