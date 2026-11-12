## gravit-admin-web

Gravit 서비스의 학습 콘텐츠와 운영 데이터를 관리하는 **관리자 웹 클라이언트**입니다.
콘텐츠 편집과 스테이징 반영, 유저·신고·문의·공지 관리, 운영 챗봇 Ravvit, 스프린트별 QA 검수를 한곳에서 제공합니다.

<br>

### 기술 스택

<img src="https://skillicons.dev/icons?i=react,ts,vite,tailwind&perline=6" alt="React, TypeScript, Vite, Tailwind CSS" />

TanStack Query · Zustand · React Hook Form + Zod · axios · React Router · Radix UI · Recharts · MSW · Playwright

<br>

### 시작하기

실행 전에 루트의 `.env.development`에 연결할 서버의 환경변수를 설정합니다.
`VITE_API_HOST`, `VITE_OAUTH_DEST`, `VITE_RAVVIT_API_BASE`는 필수이며, `VITE_QA_API_BASE`의 기본값은 `/qa-api`입니다.

```bash
npm install
npm run dev
```

개발 중 목 데이터를 사용하려면 `VITE_USE_MOCK=true`로 실행합니다. 목 모드에서도 위 필수 환경변수는 필요합니다.

```bash
VITE_USE_MOCK=true npm run dev
```

```bash
npm run build               # 타입 검사 + 프로덕션 빌드
npm run lint                # ESLint 검사
npm run test:e2e:install     # Chromium 설치 — 최초 1회
npm run test:e2e             # MSW 기반 스모크 56건
npm run test:auth            # OAuth·쿠키 기반 세션 검증
```

<br>

### 구조

```text
src/
├── app/                     부트스트랩 — 라우터, 프로바이더, MSW 초기화
├── pages/                   라우트별 얇은 페이지
├── features/
│   ├── auth/                OAuth 로그인, 권한·세션 관리
│   ├── dashboard/           운영 통계와 차트
│   ├── chapters/            챕터 조회
│   ├── units/               유닛 조회·편집
│   ├── lessons/             레슨 조회·편집
│   ├── problems/            문제 조회·편집
│   ├── staging/             초안 편집과 반영 관리
│   ├── users/               유저 조회, 상태·역할 변경
│   ├── reports/             신고 조회·처리
│   ├── inquiries/           문의 조회·답변
│   ├── notices/             공지 작성·수정·삭제
│   ├── ravvit/              운영 챗봇 — 대화, 응답·도구 실행 이력
│   └── qa/                  스프린트별 QA 도메인
│       ├── api.ts           QA API 호출과 응답 파싱
│       ├── schemas.ts       스프린트·검수 항목·셀·이력 스키마
│       ├── queries.ts       조회와 준비 작업 폴링
│       ├── mutations.ts     판정·항목 수정·삭제·QA 종료
│       └── components/      연결 현황, 디자인 검수, 1·2차 체크리스트
├── shared/                  도메인 무관 공용 — API 클라이언트, UI, 훅, 전역 CSS
├── mocks/                   MSW 핸들러와 인메모리 시드 데이터
└── env.ts                   환경변수 검증

.claude/                     개발 명세·규칙·검증 게이트·스모크
tests/auth/                  OAuth·쿠키 기반 세션 테스트
docs/qa-test-agile-followup/  QA 화면 개선 보고서와 변경 전·후 캡처
```
