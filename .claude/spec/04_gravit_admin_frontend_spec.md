# Gravit 백오피스 프론트엔드 통합 명세서
 
> 본 문서는 Gravit 백오피스 프론트엔드를 **Claude Code 등 프론트엔드 AI가 단독으로 구현 가능한 수준**으로 통합 정리한 명세서입니다. 와이어프레임/API/디자인 시스템 문서의 결정 사항을 모두 통합하고, 추가로 결정된 프론트엔드 아키텍처 사항을 포함합니다.
 
**문서 작성일**: 2026-04-26
**문서 버전**: 1.0
 
---
 
## 목차
 
1. [개요 및 사전 컨텍스트](#1-개요-및-사전-컨텍스트)
2. [문서 정합성 노트 (중요)](#2-문서-정합성-노트-중요)
3. [기술 스택](#3-기술-스택)
4. [디렉토리 구조 및 코드 컨벤션](#4-디렉토리-구조-및-코드-컨벤션)
5. [환경 변수 및 환경 분리](#5-환경-변수-및-환경-분리)
6. [API 클라이언트 레이어](#6-api-클라이언트-레이어)
7. [인증 흐름](#7-인증-흐름)
8. [라우팅 구조](#8-라우팅-구조)
9. [횡단 정책 (Cross-cutting)](#9-횡단-정책-cross-cutting)
10. [추가 명세 (와이어프레임/디자인 시스템 보강)](#10-추가-명세-와이어프레임디자인-시스템-보강)
11. [단계별 구현 가이드 (Step 1 ~ Step 7)](#11-단계별-구현-가이드-step-1--step-7)
12. [Claude Code 핸드오프 프롬프트 템플릿](#12-claude-code-핸드오프-프롬프트-템플릿)
13. [백엔드 추가 요청 사항 (프론트엔드 관점)](#13-백엔드-추가-요청-사항-프론트엔드-관점)
14. [참고 문서 및 변경 이력](#14-참고-문서-및-변경-이력)
---
 
## 1. 개요 및 사전 컨텍스트
 
### 1-1. 프로젝트 개요
 
| 항목 | 내용 |
|---|---|
| 서비스 | Gravit (CS 학습 서비스) 백오피스 |
| 사용자 | 내부 운영자 수십 명 |
| 사용 환경 | 사무실 데스크탑, 업무 시간 중 |
| 타겟 디바이스 | **데스크탑 전용, 최소 1280px (반응형 미지원)** |
| 화면 수 | 16개 |
| 디자인 톤 | 미니멀 & 정보 중심 (Linear, Vercel Dashboard 계열) |
| 컬러 모드 | 라이트 모드 전용 |
| 언어 | 한국어 |
 
### 1-2. 본 명세서의 위치
 
```
01_gravit_admin_wireframe_spec.md  ← 와이어프레임 + 동작 (v1.2)
03_gravit_admin_api_spec.md        ← API 명세 (v1.1)
DS-00 ~ DS-04                      ← 디자인 시스템 입력 자료
                  ↓
04_gravit_admin_frontend_spec.md   ← 본 문서 (프론트엔드 통합 명세)
                  ↓
        Claude Code (구현)
```
 
본 명세서는 위 문서들에서 결정된 사항을 **프론트엔드 구현 관점에서 통합**하고, 프론트엔드 아키텍처(기술 스택, 폴더 구조, 인증, 라우팅, 횡단 정책 등) 결정 사항을 추가합니다.
 
### 1-3. 구현 AI에 대한 작업 원칙
 
본 문서를 입력받아 코드를 생성하는 AI(Claude Code 등)는 다음 원칙을 준수해야 합니다.
 
1. **사실 기반**: 본 명세서와 첨부 문서를 정확히 따르고, 임의로 해석/추측하지 않습니다.
2. **명세 부재 시**: 코드를 작성하지 말고 질문합니다. 환각 금지.
3. **디자인 시스템 준수**: `DS-01`의 토큰과 컴포넌트 이름을 그대로 사용합니다.
4. **shadcn/ui 우선**: 기본 컴포넌트만 사용하고, 커스텀은 디자인 시스템 토큰을 통해서만 적용합니다.
5. **데스크탑 전용**: 1280px+ 단일 폭만 고려합니다. 반응형/모바일 코드 작성 금지.
6. **타입 안전성**: `any` 사용 금지. 모든 API 응답은 타입 정의 후 사용합니다.
7. **임의 엔드포인트 생성 금지**: 명세에 없는 API/필드를 만들지 않습니다.
---
 
## 2. 문서 정합성 노트 (중요)
 
본 통합 명세서 작성 시점에 식별된 첨부 문서 간 충돌은 다음과 같이 처리합니다.
 
### 2-1. 주관식 정답 모델 (중요)
 
| 문서 | 모델 |
|---|---|
| `01_wireframe` v1.2 | **단일 Answer 객체 + 콤마 구분 content** (예: `"0, 영, zero"`) |
| `03_api` v1.1 | **단일 Answer 객체 + 콤마 구분 content** |
| `DS-02_screens` v1.0 | (구) 다중 정답 + 추가/삭제 UI |
| `DS-03_interactions` v1.0 | (구) 다중 정답 + 추가/삭제 동작 |
 
**결정**: **단일 Answer 객체 + 콤마 구분 content** 기준으로 구현합니다.
 
**영향 받는 화면 및 동작**:
 
- `PROBLEM_DETAIL` 주관식 표시 모드: 정답 영역에 단일 문자열을 표시 (콤마 구분된 그대로 한 줄로). UI상 `(N개)` 표기 제거.
- `PROBLEM_DETAIL` 주관식 편집 모드: **단일 Text Input** 1개 + 단일 Textarea(해설) 1개. `[+ 정답 추가]` / `X 삭제` 버튼 제거.
- `STAGING_DETAIL` 주관식 폼: 동일하게 단일 입력. (이미 `DS-02` 16-4-3에 "정답 추가/삭제 버튼 없음"으로 명시되어 있으나, 표시는 `(N개)`가 아닌 단일 정답으로 명시).
- API 호출: `PATCH /problems/{problemId}/subjective`는 `{ answer: { content?, explanation? } }` 단일 객체 부분 업데이트.
### 2-2. 검색·필터 적용 범위
 
`01_wireframe` 2장 결정에 따라 다음과 같이 구현합니다.
 
| 화면 | 검색 | 필터 |
|---|---|---|
| USER_LIST | O (email/nickname/handle) | O (status, role) |
| REPORT_LIST | X | O (reportType, isResolved 기본값=미해결) |
| STAGING_LIST | X | O (status 기본값=PENDING) |
| 그 외 List | X | X (페이지네이션만) |
 
### 2-3. 페이지당 행 수
 
모든 List 화면은 **20행 고정** (서버 측 고정, 클라이언트 변경 불가).
 
---
 
## 3. 기술 스택
 
### 3-1. 핵심 스택
 
| 영역 | 선택 | 버전 (권장) | 비고 |
|---|---|---|---|
| 빌드 도구 | Vite | 5.x | React + TypeScript 템플릿 |
| 언어 | TypeScript | 5.x | strict 모드 |
| UI 프레임워크 | React | 18.x | |
| 라우팅 | React Router | v7 (data router) | `useBlocker`, `loader`, `handle` 활용 |
| 서버 상태 | TanStack Query | v5 | 캐싱·invalidation·재시도 |
| 클라이언트 전역 상태 | Zustand | 4.x | 인증 정보 + UI 전역 상태 |
| 폼 / 검증 | React Hook Form + Zod | RHF 7.x + Zod 3.x | `zodResolver` |
| HTTP 클라이언트 | axios | 1.x | 인터셉터 |
| 토스트 | sonner | 1.x | shadcn/ui 공식 권장 |
| 마크다운 렌더링 | react-markdown + remark-gfm | 9.x + 4.x | 공지 표시 전용 |
| 날짜 처리 | date-fns | 3.x | 한국어 로케일 |
 
### 3-2. UI / 스타일링
 
| 영역 | 선택 |
|---|---|
| CSS | Tailwind CSS v3 |
| UI 컴포넌트 | shadcn/ui (CSS Variables 방식) |
| 아이콘 | lucide-react |
| 클래스명 유틸 | clsx + tailwind-merge (`cn` 헬퍼) |
| 폰트 | 시스템 폰트 + Pretendard (한글) |
 
### 3-3. OAuth SDK
 
| Provider | 라이브러리 | 비고 |
|---|---|---|
| Google | `@react-oauth/google` | npm 공식 React 래퍼 |
| Kakao | Kakao JavaScript SDK | CDN 스크립트 + `@types/kakao-js-sdk` 타입 정의 |
| Naver | Naver JavaScript SDK | CDN 스크립트 (npm 공식 래퍼 부재) |
 
> Kakao/Naver는 React 친화적인 npm 패키지가 부재하여 CDN 스크립트 로딩 방식이 사실상 표준입니다. `index.html`의 `<head>`에 스크립트 태그를 추가하거나, 동적으로 스크립트를 로드하는 헬퍼를 작성합니다.
 
### 3-4. 코드 품질 도구
 
| 도구 | 설정 |
|---|---|
| ESLint | Vite 기본 + `eslint-plugin-react-hooks` + `@tanstack/eslint-plugin-query` |
| Prettier | 기본 설정 |
| TypeScript | strict 모드, `noUncheckedIndexedAccess` 권장 |
 
### 3-5. 테스트
 
- **단위 테스트 / 컴포넌트 테스트**: 도입하지 않습니다.
- **E2E 테스트**: 본 명세 범위 밖. 안정화 이후 Playwright 등으로 핵심 위험 시나리오(스테이징 promote, 유저 권한 변경) 한정 도입을 추후 검토합니다.
### 3-6. 미사용 라이브러리 명시
 
다음 라이브러리는 본 프로젝트에 도입하지 않습니다.
- CSS-in-JS (emotion, styled-components 등) — Tailwind + shadcn/ui와 패턴 충돌
- 별도 폼 라이브러리 (Formik 등) — RHF로 통일
- Redux Toolkit — 본 규모에 과함
- SWR — TanStack Query로 통일
- moment.js, dayjs — date-fns로 통일
---
 
## 4. 디렉토리 구조 및 코드 컨벤션
 
### 4-1. 전체 디렉토리 구조
 
```
gravit-admin/
├── public/
├── src/
│   ├── app/                          # 앱 진입점 / 라우터 / 프로바이더
│   │   ├── main.tsx                  # 앱 부트스트랩 (createRoot)
│   │   ├── router.tsx                # React Router 라우트 정의
│   │   └── providers.tsx             # QueryClient, Toaster, Zustand 등
│   │
│   ├── pages/                        # 라우트별 페이지 컴포넌트 (얇게 유지)
│   │   ├── login/
│   │   │   └── LoginPage.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx
│   │   ├── users/
│   │   │   ├── UserListPage.tsx
│   │   │   └── UserDetailPage.tsx
│   │   ├── reports/
│   │   │   ├── ReportListPage.tsx
│   │   │   └── ReportDetailPage.tsx
│   │   ├── chapters/
│   │   │   ├── ChapterListPage.tsx
│   │   │   └── ChapterDetailPage.tsx
│   │   ├── units/
│   │   │   └── UnitDetailPage.tsx
│   │   ├── lessons/
│   │   │   └── LessonDetailPage.tsx
│   │   ├── problems/
│   │   │   └── ProblemDetailPage.tsx
│   │   ├── staging/
│   │   │   ├── StagingListPage.tsx
│   │   │   └── StagingDetailPage.tsx
│   │   └── notices/
│   │       ├── NoticeListPage.tsx
│   │       ├── NoticeNewPage.tsx
│   │       └── NoticeDetailPage.tsx
│   │
│   ├── features/                     # 도메인별 비즈니스 로직
│   │   ├── auth/
│   │   │   ├── api.ts                # OAuth/login/reissue API 호출
│   │   │   ├── hooks.ts              # useLogin, useLogout, useCurrentAdmin
│   │   │   ├── store.ts              # Zustand 인증 store
│   │   │   ├── schemas.ts            # Zod (필요 시)
│   │   │   ├── types.ts              # Admin, AuthState 등
│   │   │   └── components/
│   │   │       └── OAuthButtons.tsx
│   │   ├── dashboard/
│   │   │   ├── api.ts
│   │   │   ├── queries.ts
│   │   │   └── types.ts
│   │   ├── users/
│   │   │   ├── api.ts
│   │   │   ├── queries.ts
│   │   │   ├── mutations.ts
│   │   │   ├── schemas.ts
│   │   │   ├── types.ts
│   │   │   └── components/
│   │   │       ├── UserStatusBadge.tsx
│   │   │       ├── UserRoleBadge.tsx
│   │   │       └── UserStatusChangeModal.tsx
│   │   ├── reports/
│   │   │   ├── api.ts
│   │   │   ├── queries.ts
│   │   │   ├── mutations.ts
│   │   │   ├── types.ts
│   │   │   └── components/
│   │   │       └── ReportTypeBadge.tsx
│   │   ├── chapters/
│   │   │   ├── api.ts
│   │   │   ├── queries.ts
│   │   │   ├── mutations.ts
│   │   │   ├── schemas.ts
│   │   │   ├── types.ts
│   │   │   └── components/
│   │   │       └── ChapterStatsTable.tsx
│   │   ├── units/
│   │   ├── lessons/
│   │   ├── problems/
│   │   │   ├── api.ts
│   │   │   ├── queries.ts
│   │   │   ├── mutations.ts
│   │   │   ├── schemas.ts
│   │   │   ├── types.ts
│   │   │   └── components/
│   │   │       ├── ObjectiveProblemForm.tsx
│   │   │       └── SubjectiveProblemForm.tsx
│   │   ├── staging/
│   │   │   ├── api.ts
│   │   │   ├── queries.ts
│   │   │   ├── mutations.ts
│   │   │   ├── schemas.ts
│   │   │   ├── types.ts
│   │   │   ├── hooks.ts              # useStagingDirtyTracker 등
│   │   │   └── components/
│   │   │       ├── StagingDetailHeader.tsx
│   │   │       ├── StagingItemList.tsx
│   │   │       ├── StagingItemListItem.tsx
│   │   │       ├── StagingLessonForm.tsx
│   │   │       ├── StagingObjectiveForm.tsx
│   │   │       ├── StagingSubjectiveForm.tsx
│   │   │       ├── StagingPromoteModal.tsx
│   │   │       └── StagingCompletedBanner.tsx
│   │   └── notices/
│   │       ├── api.ts
│   │       ├── queries.ts
│   │       ├── mutations.ts
│   │       ├── schemas.ts
│   │       ├── types.ts
│   │       └── components/
│   │           ├── NoticeStatusBadge.tsx
│   │           └── NoticeMarkdownViewer.tsx
│   │
│   ├── shared/                       # 도메인 무관 공용 코드
│   │   ├── api/
│   │   │   ├── client.ts             # axios 인스턴스 + 인터셉터
│   │   │   ├── tokenManager.ts       # access(메모리)/refresh(localStorage)
│   │   │   ├── reissueQueue.ts       # 단일 비행 큐
│   │   │   ├── errorHandler.ts       # 에러 → 토스트 매핑
│   │   │   └── types.ts              # PaginatedResponse, ErrorResponse 등
│   │   ├── components/
│   │   │   ├── ui/                   # shadcn/ui CLI로 자동 생성 (수정 자제)
│   │   │   ├── layout/
│   │   │   │   ├── MainLayout.tsx
│   │   │   │   ├── LoginLayout.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── Breadcrumb.tsx
│   │   │   ├── data-table/
│   │   │   │   ├── DataTable.tsx
│   │   │   │   └── PaginationControl.tsx
│   │   │   ├── status-badge/
│   │   │   │   └── StatusBadge.tsx
│   │   │   ├── modals/
│   │   │   │   ├── ConfirmModal.tsx
│   │   │   │   ├── StrictMatchModal.tsx
│   │   │   │   └── UnsavedChangesModal.tsx
│   │   │   ├── states/
│   │   │   │   ├── EmptyState.tsx
│   │   │   │   ├── ErrorState.tsx
│   │   │   │   └── LoadingSkeleton.tsx
│   │   │   └── form/
│   │   │       ├── FormField.tsx     # label + input + error
│   │   │       └── FieldError.tsx
│   │   ├── hooks/
│   │   │   ├── useDebounce.ts
│   │   │   ├── useUnsavedChangesGuard.ts
│   │   │   └── useBreadcrumb.ts
│   │   ├── lib/
│   │   │   ├── cn.ts
│   │   │   ├── formatDate.ts
│   │   │   ├── formatNumber.ts
│   │   │   └── markdown.ts
│   │   ├── constants/
│   │   │   ├── routes.ts             # ROUTES 객체
│   │   │   ├── labels.ts             # enum 한글 매핑
│   │   │   ├── badgeVariants.ts      # status → variant 매핑
│   │   │   └── fieldLimits.ts        # 글자 수 제한
│   │   └── styles/
│   │       └── globals.css           # Tailwind + shadcn/ui CSS Variables
│   │
│   ├── env.ts                        # 환경 변수 타입 안전 접근 (Zod 검증)
│   └── vite-env.d.ts
│
├── .env.development
├── .env.production
├── .env.local                        # gitignore
├── .eslintrc.cjs
├── .prettierrc
├── components.json                   # shadcn/ui 설정
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```
 
### 4-2. 폴더 책임
 
| 폴더 | 책임 | 의존 방향 |
|---|---|---|
| `app/` | 앱 부트스트랩, 라우터, 프로바이더 | `pages` + `shared` 참조 |
| `pages/` | 라우트별 페이지 (얇은 컴포넌트) | `features` + `shared` 참조 |
| `features/{domain}/` | 도메인 비즈니스 로직 (API, 훅, 도메인 컴포넌트) | `shared`만 참조. **다른 features 참조 금지** |
| `shared/` | 도메인 무관 공용 코드 | 외부 라이브러리만 참조 |
 
### 4-3. 파일 명명 규칙
 
| 종류 | 규칙 | 예시 |
|---|---|---|
| React 컴포넌트 파일 | PascalCase + `.tsx` | `UserListPage.tsx`, `StatusBadge.tsx` |
| 훅 파일 | camelCase, `use` 접두사 + `.ts` | `useDebounce.ts` |
| 일반 함수/유틸 파일 | camelCase + `.ts` | `formatDate.ts`, `tokenManager.ts` |
| 타입 파일 | `types.ts` 또는 `*.types.ts` | `user.types.ts` |
| 스키마 파일 (Zod) | `schemas.ts` 또는 `*.schemas.ts` | `notice.schemas.ts` |
| API 호출 모음 | `api.ts` | `features/users/api.ts` |
| 상수 (값) | UPPER_SNAKE_CASE | `MAX_TITLE_LENGTH` |
| 상수 (객체) | camelCase | `userStatusLabels` |
 
### 4-4. import 경로 컨벤션
 
**절대 경로 alias** `@/`만 사용 (src 루트).
 
```typescript
// O
import { UserStatusBadge } from '@/features/users/components/UserStatusBadge';
import { cn } from '@/shared/lib/cn';
 
// X
import { UserStatusBadge } from '../../features/users/components/UserStatusBadge';
```
 
`tsconfig.json` + `vite.config.ts`에 alias 설정 필수.
 
### 4-5. 컴포넌트 분리 기준
 
| 시점 | 기준 |
|---|---|
| 분할 필요 | 단일 파일 300줄 초과 |
| 공용화 필요 | 동일 마크업이 2회 이상 반복 |
| `shared/components/` 이동 | 도메인 무관한 UI |
| `features/{domain}/components/` 유지 | 특정 도메인에서만 쓰일 때 |
 
---
 
## 5. 환경 변수 및 환경 분리
 
### 5-1. 환경 분리 (2환경)
 
| 환경 | 파일 | 용도 |
|---|---|---|
| 개발 | `.env.development` | 로컬 개발 + 개발 서버 |
| 운영 | `.env.production` | 운영 빌드 |
| 로컬 오버라이드 | `.env.local` | 개인 개발자별 오버라이드 (gitignore) |
 
> 별도 staging 인프라 환경은 없습니다. (와이어프레임 상 "staging"은 비즈니스 도메인의 LLM 자동생성 컨텐츠 검수 단계를 의미하며, 인프라 환경과 무관합니다.)
 
### 5-2. 환경 변수 목록
 
| 키 | 타입 | 필수 | 예시 / 설명 |
|---|---|---|---|
| `VITE_API_HOST` | string (URL) | Y | `https://api.gravit.com` |
| `VITE_GOOGLE_CLIENT_ID` | string | Y | Google OAuth 클라이언트 ID |
| `VITE_KAKAO_JAVASCRIPT_KEY` | string | Y | Kakao JavaScript SDK 키 |
| `VITE_NAVER_CLIENT_ID` | string | Y | Naver OAuth 클라이언트 ID |
| `VITE_NAVER_CALLBACK_URL` | string (URL) | Y | Naver 콜백 URL (팝업 방식) |
 
### 5-3. 타입 안전 환경 변수 래퍼
 
`src/env.ts`에서 Zod 스키마로 검증 후 export. 누락 시 앱 시작 시점에 명확한 에러로 실패하게 합니다.
 
```typescript
// src/env.ts (의사 코드)
import { z } from 'zod';
 
const envSchema = z.object({
  VITE_API_HOST: z.string().url(),
  VITE_GOOGLE_CLIENT_ID: z.string().min(1),
  VITE_KAKAO_JAVASCRIPT_KEY: z.string().min(1),
  VITE_NAVER_CLIENT_ID: z.string().min(1),
  VITE_NAVER_CALLBACK_URL: z.string().url(),
});
 
const parsed = envSchema.safeParse(import.meta.env);
if (!parsed.success) {
  console.error('환경 변수 검증 실패:', parsed.error.flatten().fieldErrors);
  throw new Error('환경 변수가 올바르지 않습니다. .env 파일을 확인해주세요.');
}
 
export const env = parsed.data;
```
 
코드에서는 `import.meta.env` 직접 접근 금지. 항상 `import { env } from '@/env'` 사용.
 
---
 
## 6. API 클라이언트 레이어
 
### 6-1. 기본 사양
 
| 항목 | 값 |
|---|---|
| 라이브러리 | axios |
| Base URL | `${env.VITE_API_HOST}/api/v1/admin` (단, `/auth/reissue`만 예외) |
| 인증 헤더 | `Authorization: Bearer {accessToken}` |
| Content-Type | `application/json` |
| 타임아웃 | 30,000ms (스테이징 promote 등 무거운 요청 고려) |
 
### 6-2. 두 개의 axios 인스턴스
 
`reissue` 엔드포인트는 base path 예외(`/api/v1`)이며 인증 헤더가 불필요하므로 인스턴스를 분리합니다.
 
```typescript
// shared/api/client.ts (의사 코드)
import axios from 'axios';
import { env } from '@/env';
 
// (1) 인증 API 전용 — 인터셉터 없음
export const authApiClient = axios.create({
  baseURL: `${env.VITE_API_HOST}/api/v1`,
  timeout: 30000,
});
 
// (2) 백오피스 API 전용 — 인증/reissue 인터셉터 적용
export const apiClient = axios.create({
  baseURL: `${env.VITE_API_HOST}/api/v1/admin`,
  timeout: 30000,
});
```
 
### 6-3. Request 인터셉터
 
```typescript
apiClient.interceptors.request.use((config) => {
  const accessToken = tokenManager.getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});
```
 
### 6-4. Response 인터셉터 (단일 비행 큐)
 
401 발생 시 reissue를 단 1번만 호출하고, 그동안 도착하는 다른 401 요청은 큐에서 대기합니다.
 
```typescript
// shared/api/reissueQueue.ts (의사 코드)
let isReissuing = false;
let waiters: Array<(token: string | null) => void> = [];
 
function subscribeReissue(): Promise<string | null> {
  return new Promise((resolve) => waiters.push(resolve));
}
 
function publishReissue(token: string | null) {
  waiters.forEach((resolve) => resolve(token));
  waiters = [];
}
 
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
 
    // 401만 reissue 시도. 403/404/409/500 등은 그대로 throw
    if (status !== 401 || original._retry) {
      return Promise.reject(error);
    }
 
    original._retry = true;
 
    // 이미 reissue 진행 중 → 큐에 대기
    if (isReissuing) {
      const newToken = await subscribeReissue();
      if (!newToken) return Promise.reject(error);
      original.headers.Authorization = `Bearer ${newToken}`;
      return apiClient.request(original);
    }
 
    // reissue 시작
    isReissuing = true;
    try {
      const refreshToken = tokenManager.getRefreshToken();
      if (!refreshToken) throw new Error('NO_REFRESH_TOKEN');
 
      const { data } = await authApiClient.post('/auth/reissue', { refreshToken });
      tokenManager.setAccessToken(data.accessToken);
      publishReissue(data.accessToken);
 
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return apiClient.request(original);
    } catch (reissueError) {
      publishReissue(null);
      tokenManager.clear();
      // 로그인 페이지로 이동 + 토스트
      window.location.href = '/login';
      toast.error('다시 로그인해주세요.');
      return Promise.reject(reissueError);
    } finally {
      isReissuing = false;
    }
  }
);
```
 
### 6-5. 토큰 저장 (tokenManager)
 
```typescript
// shared/api/tokenManager.ts (의사 코드)
const ACCESS_TOKEN_KEY_MEMORY = Symbol('accessToken');
const REFRESH_TOKEN_KEY_LS = 'gravit_admin_refresh_token';
 
let accessTokenInMemory: string | null = null;
 
export const tokenManager = {
  getAccessToken: () => accessTokenInMemory,
  setAccessToken: (token: string) => { accessTokenInMemory = token; },
 
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY_LS),
  setRefreshToken: (token: string) => localStorage.setItem(REFRESH_TOKEN_KEY_LS, token),
 
  setTokens: (access: string, refresh: string) => {
    accessTokenInMemory = access;
    localStorage.setItem(REFRESH_TOKEN_KEY_LS, refresh);
  },
 
  clear: () => {
    accessTokenInMemory = null;
    localStorage.removeItem(REFRESH_TOKEN_KEY_LS);
  },
};
```
 
> ⚠️ **보안 트레이드오프**: refreshToken을 localStorage에 두면 XSS 시 노출 가능합니다. 내부 운영자 대상 + 본 명세 시점의 인증 방식(Bearer 토큰) 한계 내에서 UX와의 절충안입니다. 향후 외부 노출 또는 감사 요구 강화 시 백엔드와 함께 httpOnly 쿠키 방식으로 재설계를 권장합니다.
 
### 6-6. 에러 → 토스트 매핑 (errorHandler)
 
#### 매핑 우선순위
 
```
1순위: 백엔드 응답의 message 필드 → 그대로 토스트 표시
2순위: HTTP 상태 코드별 기본 메시지
3순위: 네트워크 에러 → "네트워크 연결을 확인해주세요."
```
 
#### HTTP 상태별 기본 메시지
 
| 상태 | 메시지 | 비고 |
|---|---|---|
| 400 | "요청을 처리할 수 없습니다. 입력값을 확인해주세요." | |
| 401 | (토스트 없음) | 인터셉터가 reissue 처리. reissue 실패 시 "다시 로그인해주세요." + `/login` 이동 |
| 403 | "권한이 없습니다." | |
| 404 | "요청한 항목을 찾을 수 없습니다." | |
| 409 | "상태 전이가 허용되지 않습니다." | 공지 ARCHIVED→PUBLISHED 등 |
| 500/502/503 | "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." | |
| 네트워크 에러 | "네트워크 연결을 확인해주세요." | |
 
#### 헬퍼 함수
 
```typescript
// shared/api/errorHandler.ts (의사 코드)
import { AxiosError } from 'axios';
 
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    // 1순위: 백엔드 message
    const message = error.response?.data?.message;
    if (typeof message === 'string' && message.length > 0) return message;
 
    // 2순위: HTTP 상태 코드별 기본
    const status = error.response?.status;
    return DEFAULT_MESSAGES[status ?? 0] ?? '처리에 실패했습니다. 다시 시도해주세요.';
  }
  return '처리에 실패했습니다. 다시 시도해주세요.';
}
 
export function showErrorToast(error: unknown) {
  toast.error(getErrorMessage(error));
}
```
 
#### TanStack Query 글로벌 에러 처리
 
```typescript
// app/providers.tsx (의사 코드)
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
 
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      // 401은 인터셉터가 이미 처리 → 토스트 생략
      if (isAxiosError(error) && error.response?.status === 401) return;
      showErrorToast(error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      if (isAxiosError(error) && error.response?.status === 401) return;
      showErrorToast(error);
    },
  }),
  defaultOptions: {
    queries: {
      retry: 1,                    // 일시적 오류만 1회 재시도
      staleTime: 30_000,           // 30초간 fresh
      refetchOnWindowFocus: false, // 백오피스 특성상 자동 refetch 비활성
    },
    mutations: {
      retry: 0,
    },
  },
});
```
 
### 6-7. 공통 응답 타입
 
```typescript
// shared/api/types.ts
export interface PaginatedResponse<T> {
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  content: T[];
}
 
export interface ErrorResponse {
  error: string;
  message: string;
}
```
 
---
 
## 7. 인증 흐름
 
### 7-1. OAuth 클라이언트 흐름 (팝업 방식)
 
```
┌──────────────────────────────────────────────────────────────────┐
│ 1. 운영자가 /login 진입 → [Google/Kakao/Naver로 로그인] 클릭     │
├──────────────────────────────────────────────────────────────────┤
│ 2. 각 provider OAuth 팝업 오픈                                   │
│    - Google: @react-oauth/google의 useGoogleLogin                │
│    - Kakao: Kakao.Auth.login (또는 oauth/authorize 팝업)         │
│    - Naver: naver.LoginWithNaverId (popup: true)                 │
├──────────────────────────────────────────────────────────────────┤
│ 3. 팝업에서 인증 완료 → idToken 획득                              │
├──────────────────────────────────────────────────────────────────┤
│ 4. POST /api/v1/admin/auth/login { providerId, idToken }         │
├──────────────────────────────────────────────────────────────────┤
│ 5. 응답 분기:                                                    │
│    ├─ 200: { accessToken, refreshToken } 저장 → / 이동           │
│    ├─ 401: "로그인에 실패하였습니다." 카드 하단 에러             │
│    └─ 403: "백오피스 접근 권한이 없습니다." 카드 하단 에러       │
└──────────────────────────────────────────────────────────────────┘
```
 
#### providerId 매핑
 
| OAuth Provider | `providerId` 값 |
|---|---|
| Google | `"GOOGLE"` |
| Kakao | `"KAKAO"` |
| Naver | `"NAVER"` |
 
### 7-2. 인증 store (Zustand)
 
```typescript
// features/auth/store.ts (의사 코드)
interface AuthState {
  admin: AdminProfile | null;
  isAuthenticated: boolean;
  setAdmin: (admin: AdminProfile) => void;
  reset: () => void;
}
 
export const useAuthStore = create<AuthState>((set) => ({
  admin: null,
  isAuthenticated: false,
  setAdmin: (admin) => set({ admin, isAuthenticated: true }),
  reset: () => set({ admin: null, isAuthenticated: false }),
}));
```
 
> 운영자 프로필을 표시할 API(`GET /me` 등)는 현재 명세에 없습니다. `accessToken` 디코드(JWT payload)에서 운영자 정보를 추출하거나, 백엔드에 별도 엔드포인트를 요청해야 합니다. **본 명세서는 [백엔드 추가 요청 항목](#13-백엔드-추가-요청-사항-프론트엔드-관점)에 `GET /admin/me` 추가를 요청합니다.** 임시로는 JWT 디코드로 운영자 식별자만 추출하여 사이드바 표시에 사용합니다.
 
### 7-3. ProtectedRoute (loader 기반)
 
React Router v7의 `loader`를 활용하여 인증 체크를 처리합니다.
 
```typescript
// app/router.tsx (의사 코드)
import { createBrowserRouter, redirect } from 'react-router';
 
const protectedLoader: LoaderFunction = async () => {
  const refreshToken = tokenManager.getRefreshToken();
 
  // 토큰 없음 → 즉시 로그인
  if (!refreshToken) {
    throw redirect('/login');
  }
 
  // 토큰 있음 → 운영자 정보 보장 (없으면 fetch)
  const { admin, setAdmin } = useAuthStore.getState();
  if (!admin) {
    try {
      const me = await fetchCurrentAdmin();  // GET /admin/me
      setAdmin(me);
    } catch {
      tokenManager.clear();
      useAuthStore.getState().reset();
      throw redirect('/login');
    }
  }
 
  return null;
};
 
export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginLayout />,
    children: [{ index: true, element: <LoginPage /> }],
  },
  {
    path: '/',
    element: <MainLayout />,
    loader: protectedLoader,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'users', element: <UserListPage /> },
      { path: 'users/:userId', element: <UserDetailPage /> },
      // ... 나머지 라우트
    ],
  },
]);
```
 
### 7-4. 로그아웃 흐름
 
```
1. 헤더 [로그아웃] 클릭
2. Confirm Modal "로그아웃하시겠습니까?"
3. [확인]:
   - tokenManager.clear() (access, refresh 모두 삭제)
   - useAuthStore.getState().reset()
   - queryClient.clear()  (모든 캐시 비움)
   - navigate('/login')
4. (백엔드 logout 엔드포인트 미제공 → 서버 호출 없음)
```
 
### 7-5. 인증 상태 전이 다이어그램
 
```
                  [비로그인]
                      │
            OAuth 로그인 (200)
                      ↓
                  [로그인됨]
                      │
              ┌───────┼───────┬─────────────┐
              │       │       │             │
       토큰 만료    [로그아웃]   refresh도    네트워크
       (자동 reissue) [확인]      만료         차단
              │       │       │             │
              ↓       ↓       ↓             ↓
          [로그인됨]  [비로그인] [비로그인]    (재시도)
          (재발급 성공)         + 토스트
```
 
---
 
## 8. 라우팅 구조
 
### 8-1. 경로 상수 (ROUTES)
 
`src/shared/constants/routes.ts`에 중앙 집중식으로 정의합니다. 모든 라우팅·링크는 이 상수를 참조합니다 (하드코딩된 경로 문자열 금지).
 
```typescript
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  USERS: '/users',
  USER_DETAIL: (userId: number | string) => `/users/${userId}`,
  REPORTS: '/reports',
  REPORT_DETAIL: (reportId: number | string) => `/reports/${reportId}`,
  CHAPTERS: '/chapters',
  CHAPTER_DETAIL: (chapterId: number | string) => `/chapters/${chapterId}`,
  UNIT_DETAIL: (unitId: number | string) => `/units/${unitId}`,
  LESSON_DETAIL: (lessonId: number | string) => `/lessons/${lessonId}`,
  PROBLEM_DETAIL: (problemId: number | string) => `/problems/${problemId}`,
  STAGING_LABELS: '/staging/labels',
  STAGING_LABEL_DETAIL: (label: string) => `/staging/labels/${label}`,
  NOTICES: '/notices',
  NOTICE_NEW: '/notices/new',
  NOTICE_DETAIL: (noticeId: number | string) => `/notices/${noticeId}`,
} as const;
```
 
### 8-2. 전체 라우트 정의 (16개)
 
| # | 경로 | 페이지 컴포넌트 | 레이아웃 | 인증 |
|---|---|---|---|---|
| 1 | `/login` | LoginPage | LoginLayout | X |
| 2 | `/` | DashboardPage | MainLayout | O |
| 3 | `/users` | UserListPage | MainLayout | O |
| 4 | `/users/:userId` | UserDetailPage | MainLayout | O |
| 5 | `/reports` | ReportListPage | MainLayout | O |
| 6 | `/reports/:reportId` | ReportDetailPage | MainLayout | O |
| 7 | `/chapters` | ChapterListPage | MainLayout | O |
| 8 | `/chapters/:chapterId` | ChapterDetailPage | MainLayout | O |
| 9 | `/units/:unitId` | UnitDetailPage | MainLayout | O |
| 10 | `/lessons/:lessonId` | LessonDetailPage | MainLayout | O |
| 11 | `/problems/:problemId` | ProblemDetailPage | MainLayout | O |
| 12 | `/staging/labels` | StagingListPage | MainLayout | O |
| 13 | `/staging/labels/:label` | StagingDetailPage | MainLayout | O |
| 14 | `/notices` | NoticeListPage | MainLayout | O |
| 15 | `/notices/new` | NoticeNewPage | MainLayout | O |
| 16 | `/notices/:noticeId` | NoticeDetailPage | MainLayout | O |
 
### 8-3. Breadcrumb 자동 생성
 
#### 8-3-1. 정책
 
| 화면 | Breadcrumb |
|---|---|
| DASHBOARD | (표시 안 함 — 페이지 타이틀만) |
| USER_LIST | (페이지 타이틀만) |
| USER_DETAIL | `유저 관리 > {nickname}` |
| REPORT_LIST | (페이지 타이틀만) |
| REPORT_DETAIL | `신고 관리 > #{reportId}` |
| CHAPTER_LIST | (페이지 타이틀만) |
| CHAPTER_DETAIL | `학습 컨텐츠 > {chapterTitle}` |
| UNIT_DETAIL | `학습 컨텐츠 > {chapterTitle} > {unitTitle}` |
| LESSON_DETAIL | `학습 컨텐츠 > {chapterTitle} > {unitTitle} > {lessonTitle}` |
| PROBLEM_DETAIL | `학습 컨텐츠 > {chapterTitle} > {unitTitle} > {lessonTitle} > P-{problemId}` |
| STAGING_LIST | (페이지 타이틀만) |
| STAGING_DETAIL | `스테이징 > {label}` |
| NOTICE_LIST | (페이지 타이틀만) |
| NOTICE_NEW | `공지 관리 > 공지 작성` |
| NOTICE_DETAIL | `공지 관리 > {noticeTitle}` |
 
#### 8-3-2. 구현 방식
 
React Router의 `handle.breadcrumb`로 라우트별 선언 + 공용 `<Breadcrumb />` 컴포넌트가 매치된 라우트를 순회.
 
```typescript
// app/router.tsx (의사 코드)
{
  path: 'chapters/:chapterId',
  handle: {
    breadcrumb: (data: ChapterDetail) => ({
      label: data.title,
      href: ROUTES.CHAPTER_DETAIL(data.chapterId),
    }),
  },
  element: <ChapterDetailPage />,
}
```
 
#### 8-3-3. 학습 컨텐츠 계층 breadcrumb 데이터 확보
 
`UNIT_DETAIL`, `LESSON_DETAIL`, `PROBLEM_DETAIL`은 부모 리소스 정보가 필요합니다. 현재 API 응답에 부모 메타데이터(`chapterTitle` 등)가 포함되지 않으므로 **클라이언트에서 부모 리소스를 추가 GET 호출**하여 TanStack Query 캐시에 저장 후 사용합니다.
 
```typescript
// 예: useLessonBreadcrumb(lessonId)
function useLessonBreadcrumb(lessonId: number) {
  const lesson = useLessonQuery(lessonId);
  const unit = useUnitQuery(lesson.data?.unitId, { enabled: !!lesson.data });
  const chapter = useChapterQuery(unit.data?.chapterId, { enabled: !!unit.data });
  return { chapter, unit, lesson };
}
```
 
> **백엔드 확장 시 단순화 가능**: 자식 리소스 응답에 부모 메타데이터(`chapterTitle`, `unitTitle`)를 포함하면 추가 GET 호출이 불필요합니다. [백엔드 추가 요청 항목](#13-백엔드-추가-요청-사항-프론트엔드-관점)에 포함합니다.
 
### 8-4. 페이지 이탈 보호 (Unsaved Changes Guard)
 
#### 8-4-1. 적용 대상
 
| 화면 | 보호 조건 |
|---|---|
| NOTICE_NEW | 폼에 1자 이상 입력 시 |
| NOTICE_DETAIL (편집 모드) | 초기값과 다른 값 존재 시 |
| CHAPTER_DETAIL / UNIT_DETAIL / LESSON_DETAIL (편집 모드) | 초기값과 다른 값 존재 시 |
| PROBLEM_DETAIL (편집 모드) | 초기값과 다른 값 존재 시 |
| STAGING_DETAIL | 좌측 리스트에 ●(미저장) 항목 1개 이상 존재 시 |
 
#### 8-4-2. 이중 보호 메커니즘
 
```typescript
// shared/hooks/useUnsavedChangesGuard.ts (의사 코드)
export function useUnsavedChangesGuard(hasUnsavedChanges: boolean) {
  // (1) 브라우저 닫기/새로고침 보호
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';  // 모던 브라우저는 기본 메시지만 표시
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);
 
  // (2) 라우터 내부 이동 보호
  const blocker = useBlocker(hasUnsavedChanges);
 
  return blocker;  // 컴포넌트에서 blocker.state === 'blocked'일 때 모달 노출
}
```
 
#### 8-4-3. 표준 confirm 메시지
 
| 화면 | 메시지 |
|---|---|
| 일반 편집 화면 | "변경 사항이 있습니다. 페이지를 나가시겠습니까?" |
| 스테이징 상세 | "저장하지 않은 항목이 {N}건 있습니다. 페이지를 나가시겠습니까?" |
 
[확인] → `blocker.proceed()`, [취소] → `blocker.reset()`.
 
---
 
## 9. 횡단 정책 (Cross-cutting)
 
### 9-1. TanStack Query 사용 규칙
 
#### Query Key 컨벤션
 
```typescript
// 도메인별 queryKey 팩토리
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: UserListFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (userId: number | string) => [...userKeys.details(), userId] as const,
};
```
 
도메인별로 유사 구조의 키 팩토리를 두어 invalidation 정확도를 보장합니다.
 
#### Invalidation 정책
 
| 작업 | invalidate 대상 |
|---|---|
| 유저 status/role 변경 | `userKeys.detail(userId)` + `userKeys.lists()` |
| 신고 isResolved 변경 | `reportKeys.detail(reportId)` + `reportKeys.lists()` |
| 공지 생성/수정/삭제 | `noticeKeys.all` |
| 챕터/유닛/레슨/문제 수정 | 해당 리소스 detail + 부모 자식 목록 |
| 스테이징 PATCH (필드) | 해당 라벨 detail (`stagingKeys.detail(label)`) |
| 스테이징 promote (COMPLETED) | `stagingKeys.all` + `dashboardKeys.summary` |
 
#### Refetch 정책
 
| 시점 | 기본 동작 |
|---|---|
| 화면 진입 | mount 시 자동 fetch |
| 윈도우 포커스 | **비활성** (백오피스 특성상 불필요한 트래픽 방지) |
| 페이지 변경 (페이지네이션) | 새 query key로 자동 fetch |
| 필터 변경 | 새 query key로 자동 fetch (즉시 적용) |
 
### 9-2. 폼 검증 정책 (React Hook Form + Zod)
 
#### 검증 트리거
 
| 트리거 | 동작 |
|---|---|
| 입력 중 (onChange) | 검증 안 함 |
| 포커스 아웃 (onBlur) | 단일 필드 검증 (RHF의 `mode: 'onBlur'`) |
| [저장]/[게시] 제출 클릭 | **전체 필드 검증** + 실패 시 토스트 "필수 항목을 확인해주세요." |
 
#### 검증 실패 시각 표시
 
- input 보더: `danger-text` 컬러 (Tailwind에서 `border-destructive`)
- 에러 메시지: input 하단, 12px, `text-destructive`
- 검증 통과 시 즉시 보더와 메시지 제거
#### Zod 스키마 위치
 
도메인별 `features/{domain}/schemas.ts`에 정의. `react-hook-form`의 `zodResolver`로 통합.
 
```typescript
// features/notices/schemas.ts (의사 코드)
import { z } from 'zod';
import { FIELD_LIMITS } from '@/shared/constants/fieldLimits';
 
export const noticeFormSchema = z.object({
  title: z.string().min(1, '제목은 필수 항목입니다.')
    .max(FIELD_LIMITS.notice.title, `${FIELD_LIMITS.notice.title}자 이내로 입력해주세요.`),
  summary: z.string().min(1, '요약은 필수 항목입니다.')
    .max(FIELD_LIMITS.notice.summary, `${FIELD_LIMITS.notice.summary}자 이내로 입력해주세요.`),
  content: z.string().min(1, '본문은 필수 항목입니다.')
    .max(FIELD_LIMITS.notice.content, `${FIELD_LIMITS.notice.content}자 이내로 입력해주세요.`),
  pinned: z.boolean().default(false),
});
 
export type NoticeFormValues = z.infer<typeof noticeFormSchema>;
```
 
### 9-3. 토스트 사용 정책
 
| 케이스 | Variant | 표준 문구 |
|---|---|---|
| 일반 성공 | success | "저장되었습니다." |
| 일반 실패 | error | (백엔드 message 또는 HTTP fallback 메시지) |
| 검증 실패 | error | "필수 항목을 확인해주세요." |
| 공지 게시 | success | "공지가 게시되었습니다." |
| 공지 임시저장 | success | "임시 저장되었습니다." |
| 공지 삭제 | success | "공지가 삭제되었습니다." |
| 유저 status/role 변경 | success | "변경되었습니다." |
| 신고 처리 | success | "신고가 처리되었습니다." |
| 스테이징 저장 (전체 성공) | success | "저장되었습니다." |
| 스테이징 저장 (부분 실패) | error | "{N}건 저장 실패." |
| 스테이징 저장 (전체 실패) | error | "저장에 실패했습니다." |
| 스테이징 반영 (promote) | success | "라벨이 반영되었습니다." |
| 스테이징 반영 실패 | error | "반영에 실패했습니다. 잠시 후 다시 시도해주세요." |
| 401 reissue 실패 | error | "다시 로그인해주세요." |
| 네트워크 에러 | error | "네트워크 연결을 확인해주세요." |
 
| 사양 | 값 |
|---|---|
| 위치 | 우상단 |
| 자동 dismiss | 3초 |
| 동시 노출 | sonner 기본 (최대 3개 권장) |
 
### 9-4. 상태 표시 패턴 (Empty / Loading / Error)
 
#### Empty State
 
| 화면 | 기본 메시지 | 검색·필터 후 메시지 |
|---|---|---|
| USER_LIST | "유저가 없습니다." | "조건에 맞는 유저가 없습니다." |
| REPORT_LIST | "신고가 없습니다." | "조건에 맞는 신고가 없습니다." |
| CHAPTER_LIST | "챕터가 없습니다." | — |
| STAGING_LIST | "라벨이 없습니다." | "조건에 맞는 라벨이 없습니다." |
| NOTICE_LIST | "공지가 없습니다." | — |
| CHAPTER_DETAIL 풀이 현황 | "아직 풀이 데이터가 없습니다." | — |
| CHAPTER_DETAIL 유닛 목록 | "유닛이 없습니다." | — |
| UNIT_DETAIL 레슨 목록 | "레슨이 없습니다." | — |
| LESSON_DETAIL 문제 목록 | "문제가 없습니다." | — |
 
| 사양 | 값 |
|---|---|
| 아이콘 | 회색, 48px (lucide `Inbox` 또는 도메인별 아이콘) |
| 메시지 | 16px, `text-secondary`, 중앙 정렬 |
| 보조 액션 | 해당 시 (예: NOTICE_LIST의 [+ 공지 작성]) |
 
#### Loading State (Skeleton)
 
- 테이블 행 모양의 회색 placeholder 5~10줄
- 전체 페이지 로딩이 아닌, **데이터 영역만** skeleton 처리 (사이드바/헤더는 유지)
- shadcn/ui `Skeleton` 컴포넌트 사용
#### Error State
 
- 메시지: "데이터를 불러올 수 없습니다. 잠시 후 다시 시도해주세요."
- 버튼: "다시 시도" (Outline Button) → `queryClient.invalidateQueries({ queryKey })` 또는 `query.refetch()`
- 아이콘: 회색, 48px (lucide `AlertTriangle`)
### 9-5. 글자 수 제한 (FIELD_LIMITS)
 
⚠️ **본 제한치는 클라이언트 측 UX 보호용입니다.** 백엔드 DB 제약과 정렬되도록 향후 백엔드와 동기화가 필요합니다 ([백엔드 추가 요청](#13-백엔드-추가-요청-사항-프론트엔드-관점) 참조).
 
```typescript
// shared/constants/fieldLimits.ts
export const FIELD_LIMITS = {
  notice: {
    title: 100,
    summary: 200,
    content: 10000,
  },
  chapter: {
    title: 100,
    description: 500,
  },
  unit: {
    title: 100,
    description: 500,
  },
  lesson: {
    title: 100,
  },
  problem: {
    instruction: 500,
    content: 2000,
  },
  option: {
    content: 200,
    explanation: 1000,
  },
  answer: {
    content: 500,       // 콤마 구분 다중 정답 표현 고려
    explanation: 1000,
  },
} as const;
```
 
### 9-6. 한국어 정책
 
- **i18n 라이브러리 미도입**. 모든 UI 문구는 한국어 하드코딩.
- 향후 다국어가 필요할 경우 i18next 등 도입 검토.
- 사용자에게 노출되는 모든 문자열은 컴포넌트 내부 또는 `shared/constants/labels.ts`에 위치.
### 9-7. 한글 매핑 테이블 (labels.ts)
 
```typescript
// shared/constants/labels.ts
export const userStatusLabels: Record<UserStatus, string> = {
  ACTIVE: '활성',
  SUSPENDED: '정지',
  DELETED: '삭제됨',
};
 
export const userRoleLabels: Record<UserRole, string> = {
  ADMIN: '관리자',
  USER: '일반',
};
 
export const reportTypeLabels: Record<ReportType, string> = {
  TYPO_ERROR: '오타',
  CONTENT_ERROR: '내용 오류',
  ANSWER_ERROR: '정답 오류',
  OTHER_ERROR: '기타',
};
 
export const problemTypeLabels: Record<ProblemType, string> = {
  OBJECTIVE: '객관식',
  SUBJECTIVE: '주관식',
};
 
export const noticeStatusLabels: Record<NoticeStatus, string> = {
  DRAFT: '초안',
  PUBLISHED: '게시중',
  ARCHIVED: '보관됨',
};
 
export const stagingStatusLabels: Record<StagingStatus, string> = {
  PENDING: '검수 대기',
  COMPLETED: '반영 완료',
};
```
 
### 9-8. Status Badge variant 매핑
 
```typescript
// shared/constants/badgeVariants.ts
export const userStatusBadgeVariant: Record<UserStatus, BadgeVariant> = {
  ACTIVE: 'success',
  SUSPENDED: 'warning',
  DELETED: 'muted',
};
 
export const userRoleBadgeVariant: Record<UserRole, BadgeVariant> = {
  ADMIN: 'primary',   // primary-bg-badge
  USER: 'muted',
};
 
export const reportResolvedBadgeVariant = {
  unresolved: 'danger' as const,
  resolved: 'success' as const,
};
 
export const noticeStatusBadgeVariant: Record<NoticeStatus, BadgeVariant> = {
  DRAFT: 'muted',
  PUBLISHED: 'success',
  ARCHIVED: 'muted',
};
 
export const stagingStatusBadgeVariant: Record<StagingStatus, BadgeVariant> = {
  PENDING: 'warning',
  COMPLETED: 'success',
};
 
export const problemTypeBadgeVariant: Record<ProblemType, BadgeVariant> = {
  OBJECTIVE: 'info',
  SUBJECTIVE: 'accent',
};
```
 
### 9-9. 날짜 / 숫자 포맷팅
 
```typescript
// shared/lib/formatDate.ts
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
 
// API: "YYYY-MM-DD" (KST 일자) → 그대로 표시
export const formatDate = (input: string | Date | null | undefined): string => {
  if (!input) return '-';
  // YYYY-MM-DD 문자열은 그대로 사용. Date 객체일 경우만 포맷.
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  return format(new Date(input), 'yyyy-MM-dd', { locale: ko });
};
 
// API: ISO 8601 UTC → "YYYY-MM-DD HH:mm" (브라우저 로컬 → KST)
export const formatDateTime = (input: string | Date | null | undefined): string => {
  if (!input) return '-';
  return format(new Date(input), 'yyyy-MM-dd HH:mm', { locale: ko });
};
 
// shared/lib/formatNumber.ts
export const formatNumber = (value: number): string =>
  new Intl.NumberFormat('ko-KR').format(value);
```
 
### 9-10. 마크다운 렌더링 (공지 본문)
 
`NOTICE_DETAIL`의 표시 모드에서만 사용. 작성 화면은 plain `<textarea>`.
 
```typescript
// features/notices/components/NoticeMarkdownViewer.tsx (의사 코드)
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
 
export function NoticeMarkdownViewer({ content }: { content: string }) {
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        // 보안: HTML 허용 안 함 (기본값)
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
```
 
- `prose` 클래스를 위해 `@tailwindcss/typography` 플러그인 도입 권장.
- HTML 렌더링은 **허용하지 않음** (XSS 방지).
---
 
## 10. 추가 명세 (와이어프레임/디자인 시스템 보강)
 
본 섹션은 와이어프레임/디자인 시스템에서 누락되었거나 프론트엔드 구현 시 추가 결정이 필요한 항목을 정리합니다.
 
### 10-1. 화면별 검증 규칙 (구체 문구 포함)
 
#### NOTICE_NEW / NOTICE_DETAIL (편집 모드)
 
| 필드 | 검증 | 에러 메시지 |
|---|---|---|
| 제목 | 빈 값 불가 | "제목은 필수 항목입니다." |
| 제목 길이 | 100자 이내 | "100자 이내로 입력해주세요." |
| 요약 | 빈 값 불가 | "요약은 필수 항목입니다." |
| 요약 길이 | 200자 이내 | "200자 이내로 입력해주세요." |
| 본문 | 빈 값 불가 | "본문은 필수 항목입니다." |
| 본문 길이 | 10000자 이내 | "10000자 이내로 입력해주세요." |
 
#### NOTICE_DETAIL (편집 모드) — 상태 전이
 
| 현재 상태 | 선택 가능 옵션 |
|---|---|
| DRAFT | DRAFT, PUBLISHED |
| PUBLISHED | PUBLISHED, ARCHIVED |
| ARCHIVED | ARCHIVED 만 (Select Dropdown disabled) |
 
> 409 응답을 받는 경우(백엔드 검증) 토스트: "상태 전이가 허용되지 않습니다."
 
#### CHAPTER_DETAIL / UNIT_DETAIL / LESSON_DETAIL (편집 모드)
 
| 필드 | 검증 |
|---|---|
| 제목 | 빈 값 불가 + 길이 제한 |
| 설명 (해당 시) | 빈 값 허용 + 길이 제한 |
 
#### PROBLEM_DETAIL — 객관식 편집
 
| 필드 | 검증 |
|---|---|
| 지시문 | 빈 값 불가 + 500자 이내 |
| 본문 | 빈 값 불가 + 2000자 이내 |
| 옵션 4개의 content | 모두 빈 값 불가 + 200자 이내 |
| 옵션 4개의 explanation | 모두 빈 값 불가 + 1000자 이내 |
| 정답 (radio) | 정확히 1개 선택 |
 
#### PROBLEM_DETAIL — 주관식 편집 (단일 정답 모델)
 
| 필드 | 검증 |
|---|---|
| 지시문 | 빈 값 불가 + 500자 이내 |
| 본문 | 빈 값 불가 + 2000자 이내 |
| 정답 content (콤마 구분 단일 문자열) | 빈 값 불가 + 500자 이내 |
| 정답 explanation | 빈 값 불가 + 1000자 이내 |
 
#### STAGING_DETAIL — 모든 폼
 
PROBLEM_DETAIL 객관식/주관식과 동일한 검증 규칙 + 레슨 폼은 다음과 같습니다.
 
| 필드 | 검증 |
|---|---|
| 레슨 title | 빈 값 불가 + 100자 이내 |
 
### 10-2. STAGING_DETAIL 상세 동작 명세
 
본 화면은 가장 복잡하므로 세부 동작을 별도 정리합니다.
 
#### 10-2-1. 데이터 구조 (`GET /staging/labels/{label}` 응답)
 
```json
{
  "label": "2026-04-25-update",
  "unitId": 12,
  "description": "배열 챕터 5번째 사이클",
  "status": "PENDING",
  "createdAt": "2026-04-25",
  "lesson": { "lessonId": 901, "title": "배열의 정의" },
  "problems": [
    {
      "problemId": 1001,
      "problemType": "OBJECTIVE",
      "instruction": "...",
      "content": "...",
      "options": [
        { "optionId": 1, "content": "...", "explanation": "...", "isAnswer": false }
        // 총 4개, optionId ASC
      ]
    },
    {
      "problemId": 1003,
      "problemType": "SUBJECTIVE",
      "instruction": "...",
      "content": "...",
      "answer": { "answerId": 1, "content": "0, 영, zero", "explanation": "..." }
    }
  ]
}
```
 
#### 10-2-2. 좌측 항목 리스트 (7개 = 레슨 1 + 문제 6)
 
| 항목 종류 | 표시 |
|---|---|
| 레슨 | `레슨` + 미저장 시 우측 ● |
| 문제 (N=1~6) | `문제 N` + 우측 끝에 Status Badge (객관식/주관식) + 미저장 시 ● |
 
#### 10-2-3. 변경 감지 (Dirty Tracking)
 
```typescript
// features/staging/hooks.ts (의사 코드)
interface DirtyState {
  lesson: boolean;                    // 레슨 폼 dirty 여부
  problems: Record<number, boolean>;  // problemId → dirty 여부
}
 
// React Hook Form의 formState.isDirty 또는 dirtyFields를 활용
// 각 항목별로 독립된 form 인스턴스를 두거나, 단일 form으로 통합
```
 
본 명세는 **항목별 독립 form 인스턴스** 방식을 권장합니다. 이유:
- 항목 전환 시 form 상태가 자연스럽게 메모리에 유지됨 (RHF의 `useForm` 인스턴스가 컴포넌트 lifecycle에 묶임)
- 검증, dirty 추적, 제출이 항목 단위로 깔끔하게 분리됨
다만 **모든 항목의 form 인스턴스를 한 번에 mount해야** 항목 전환 시 입력값이 손실되지 않습니다. 방법:
 
```typescript
// 의사 코드
function StagingDetailPage() {
  const { data } = useStagingLabelQuery(label);
  const [activeItemKey, setActiveItemKey] = useState<ItemKey>({ type: 'lesson' });
 
  // 모든 항목의 form 인스턴스를 부모에서 보유
  const lessonForm = useForm({ defaultValues: data.lesson, resolver: ... });
  const problemForms = data.problems.map(p => useForm({ defaultValues: p, resolver: ... }));
  // ⚠️ 실제로는 hooks rule 위반. 아래 방법으로 우회
 
  // ✅ 권장: 각 항목별 form 컴포넌트를 모두 render하되 비활성 항목은 hidden
  return (
    <>
      <StagingLessonForm hidden={activeItemKey.type !== 'lesson'} ... />
      {data.problems.map(p =>
        <StagingProblemForm key={p.problemId} hidden={...} ... />
      )}
    </>
  );
}
```
 
> **간소화 대안**: 활성 항목 전환 시 비활성 항목의 form 상태를 별도 외부 store(Zustand 또는 ref)에 백업하는 방식. 본 명세는 위의 `hidden` 방식을 권장(구현이 단순하고 RHF의 기본 동작과 충돌이 적음).
 
#### 10-2-4. 변경 표시 (좌측 4px Primary 보더 + 좌측 ● 점)
 
- **좌측 4px 보더**: 해당 input이 dirty일 때 `border-l-4 border-primary` 적용. RHF의 `formState.dirtyFields[fieldName]` 구독.
- **좌측 리스트 ● 점**: 해당 항목 form의 `formState.isDirty`가 true일 때 표시.
#### 10-2-5. 저장 동작 (다중 PATCH + Promise.allSettled)
 
| 항목 | 변경 영역 | PATCH 호출 |
|---|---|---|
| 레슨 | title | `PATCH /staging/lessons/{lessonId}` 1회 |
| 객관식 문제 | instruction/content만 | `PATCH /staging/problems/{problemId}` 1회 |
| 객관식 문제 | 옵션 1개 이상 | `PATCH /staging/options/{optionId}` 변경된 옵션마다 1회 (정답 변경 시 이전 정답 옵션도 포함 → 2회) |
| 객관식 문제 | 문제 본문 + 옵션 | 위 둘 합산 |
| 주관식 문제 | instruction/content만 | `PATCH /staging/problems/{problemId}` 1회 |
| 주관식 문제 | answer만 | `PATCH /staging/answers/{answerId}` 1회 |
| 주관식 문제 | 문제 본문 + answer | 위 둘 합산 |
 
```typescript
// 의사 코드 (객관식 저장)
async function saveObjectiveProblem(form, problemId) {
  const dirtyFields = form.formState.dirtyFields;
  const values = form.getValues();
 
  const calls: Array<Promise<unknown>> = [];
 
  // problem level
  if (dirtyFields.instruction || dirtyFields.content) {
    calls.push(patchStagingProblem(problemId, {
      instruction: dirtyFields.instruction ? values.instruction : undefined,
      content: dirtyFields.content ? values.content : undefined,
    }));
  }
 
  // option level
  values.options.forEach((opt, idx) => {
    const dirtyOpt = dirtyFields.options?.[idx];
    if (!dirtyOpt) return;
    calls.push(patchStagingOption(opt.optionId, {
      content: dirtyOpt.content ? opt.content : undefined,
      explanation: dirtyOpt.explanation ? opt.explanation : undefined,
      isAnswer: dirtyOpt.isAnswer ? opt.isAnswer : undefined,
    }));
  });
 
  const results = await Promise.allSettled(calls);
 
  // 결과 분류
  const successCount = results.filter(r => r.status === 'fulfilled').length;
  const failCount = results.length - successCount;
 
  if (failCount === 0) {
    // 전체 성공: baseline reset (form.reset(values)) + 토스트
    form.reset(values);
    toast.success('저장되었습니다.');
  } else if (successCount > 0) {
    // 부분 실패: 성공한 필드만 baseline 갱신
    // (구체적으로 어떤 필드가 성공했는지 추적 후 부분 reset)
    toast.error(`${failCount}건 저장 실패.`);
  } else {
    toast.error('저장에 실패했습니다.');
  }
 
  // 마지막으로 해당 라벨 detail 캐시 invalidate (백엔드 최신 상태 반영)
  queryClient.invalidateQueries({ queryKey: stagingKeys.detail(label) });
}
```
 
#### 10-2-6. [반영 완료 처리] 버튼 상태
 
| 라벨 상태 | 미저장 항목 | 버튼 상태 |
|---|---|---|
| COMPLETED | (무관) | **숨김** |
| PENDING | ●이 1개 이상 | **비활성** + hover 툴팁 "저장하지 않은 항목이 있습니다 ({N}건)" |
| PENDING | 없음 | **활성** (destructive variant) |
 
#### 10-2-7. Strict Match Modal
 
| 사양 | 값 |
|---|---|
| 폭 | 480px |
| 라벨명 표시 | 코드 블록 또는 read-only input, **monospace** |
| 입력 input | monospace, placeholder 없음 |
| [반영] 활성 조건 | 입력값 === 라벨명 (대소문자/공백 포함 strict 비교) |
| [반영] variant | destructive |
| ESC / 외부 클릭 | 모달 닫힘 + 입력값 초기화 |
 
#### 10-2-8. promote 흐름
 
```
[반영] 클릭
  ↓
PATCH /staging/labels/{label}/status { status: "COMPLETED" }
  ↓
┌─ 성공 (2xx)
│  - 토스트: "라벨이 반영되었습니다."
│  - navigate('/staging/labels')  (필터 상태 유지)
│  - 페이지네이션 1페이지로 reset
│  - 캐시 invalidate: stagingKeys.all, dashboardKeys.summary
│
└─ 실패 (4xx/5xx)
   - 모달 닫힘
   - 토스트: "반영에 실패했습니다. 잠시 후 다시 시도해주세요."
   - 상세 페이지 머무름, 상태 변경 없음
```
 
#### 10-2-9. COMPLETED 상태 (read-only)
 
| 영역 | 동작 |
|---|---|
| 안내 배너 | 페이지 상단 노출 (Banner Success, `CheckCircle2` 아이콘) |
| 헤더 [반영 완료 처리] | 숨김 |
| 좌측 리스트 | 정상 동작, 단 ● 점 표시 안 함 |
| 우측 input/textarea | `disabled`, 배경 `bg-hover`, 텍스트 `text-secondary` |
| 객관식 radio | `disabled` (정답 표시는 유지) |
| [저장] 버튼 | 숨김 |
| 페이지 이탈 가드 | 미작동 (변경 불가하므로) |
 
### 10-3. USER_DETAIL 상태 변경 모달 매핑
 
`USER_DETAIL`에서 드롭다운으로 status/role을 변경할 때 표시되는 4가지 Confirm Modal:
 
| 케이스 | Variant | 타이틀 | 본문 | 확인 버튼 |
|---|---|---|---|---|
| status → ACTIVE | default | 유저 상태를 변경하시겠습니까? | "{nickname} ({@handle})을(를) ACTIVE 상태로 변경합니다." | "확인" |
| status → SUSPENDED | default | 유저 상태를 변경하시겠습니까? | "{nickname} ({@handle})을(를) SUSPENDED 상태로 변경합니다." | "확인" |
| **status → DELETED** | **destructive** | 유저를 삭제 처리하시겠습니까? | "{nickname} ({@handle})을(를) DELETED 상태로 변경합니다. 이 작업은 되돌리기 어렵습니다." | "삭제" |
| role → USER | default | 관리자 권한을 회수하시겠습니까? | "{nickname} ({@handle})의 관리자 권한을 회수합니다." | "확인" |
| **role → ADMIN** | **destructive** | 관리자 권한을 부여하시겠습니까? | "{nickname} ({@handle})에게 관리자 권한을 부여합니다. 백오피스 접근 등 모든 운영 권한이 부여됩니다." | "부여" |
 
[취소] 클릭 시: 드롭다운 원복 (변경 전 값으로 되돌림).
 
### 10-4. REPORT_DETAIL 처리 후 동작 분기
 
| 변경 | 처리 후 동작 |
|---|---|
| 미해결 → 해결됨 | **목록(`/reports`)으로 자동 이동** + 필터 상태 유지 + 페이지네이션 1페이지 reset + Success 토스트 |
| 해결됨 → 미해결 | 상세 페이지 머무름 + Success 토스트 (의도 외 동작 방지) |
 
### 10-5. 프로필 이미지 처리
 
- API 응답의 `profileImgNumber`(정수)로 프리셋 이미지 매핑
- 80×80px, 원형 마스크 (`rounded-full`)
- **매핑 규칙은 사용자 앱 명세서와 동일하게 가져가야 함**. 본 명세서 시점에는 백엔드 결정 사항이며, 구현 시점에 사용자 앱 매핑을 확인하여 적용.
### 10-6. 사이드바 운영자 표시
 
사이드바 하단의 운영자 표시 영역:
- 프로필 아이콘 (운영자 본인의 `profileImgNumber` 매핑)
- 닉네임 (14px)
- 이메일 (12px, `text-muted`)
- 1px top border로 메뉴 영역과 분리
데이터 출처: `useAuthStore().admin`. 현재 API 명세에 `GET /admin/me`가 없으므로 [백엔드 추가 요청](#13-백엔드-추가-요청-사항-프론트엔드-관점)에 포함.
 
### 10-7. 데이터 표 행 hover / 클릭
 
| 동작 | 시각 처리 |
|---|---|
| 행 hover | 배경 `bg-hover` (`#F5F5F5`), `cursor: pointer` |
| 행 click | 상세 페이지 이동 |
| 행 내부 버튼 click | `event.stopPropagation()` 또는 별도 클릭 영역으로 분리하여 행 클릭과 별도 처리 |
 
특히 REPORT_LIST의 "문제ID" 컬럼(`P-{problemId}` 링크)과 NOTICE_LIST의 [수정] 버튼은 행 클릭과 별도 동작이므로 `stopPropagation` 필요.
 
### 10-8. 페이지네이션 컴포넌트
 
shadcn/ui의 `Pagination` 컴포넌트 기반. 본 프로젝트의 페이지네이션 응답은 `{ page, totalPages, hasNextPage }`이며 `totalElements`가 없습니다.
 
표시 패턴:
- 1페이지: `[이전 비활성] 1 2 3 ... 10 [다음]`
- 중간 페이지: `[이전] 1 ... 4 5 6 ... 10 [다음]`
- 마지막 페이지: `[이전] 1 ... 8 9 10 [다음 비활성]`
`hasNextPage`로 [다음] 버튼 활성 여부 판단. 단, `totalPages`가 있으므로 일반적인 페이지네이션 UI 사용 가능.
 
---
 
## 11. 단계별 구현 가이드 (Step 1 ~ Step 7)
 
### 11-1. 전체 Step 구조
 
```
Step 1. 프로젝트 셋업 (Bootstrap)
   ↓
Step 2. 공통 인프라 (Infrastructure)
   ↓
Step 3. 단순 화면 5개 (Low complexity)
   ↓
Step 4. 중간 화면 8개 (Medium)
   ↓
Step 5. 중상 화면 2개 (Medium-High)
   ↓
Step 6. 최복잡 화면 1개 — STAGING_DETAIL (High, 9단계 분할)
   ↓
Step 7. QA & 통합 검증
```
 
### 11-2. Step 1: 프로젝트 셋업 (Bootstrap)
 
#### 작업 범위
 
```
✓ Vite + React + TypeScript 프로젝트 생성
   npm create vite@latest gravit-admin -- --template react-ts
 
✓ Tailwind CSS v3 설치 + 디자인 시스템 토큰 매핑 (DS-01)
   - tailwind.config.ts: theme.extend.colors 등에 토큰 추가
   - globals.css: CSS Variables 정의 (라이트 모드 전용)
 
✓ shadcn/ui 초기화
   npx shadcn-ui@latest init
   - components.json 생성
   - components/ui 디렉토리 자동 생성
 
✓ shadcn/ui CLI로 필수 컴포넌트 설치:
   button, input, textarea, select, dialog, table, badge,
   checkbox, radio-group, skeleton, sonner, dropdown-menu
 
✓ 보조 라이브러리 설치:
   - react-router (v7)
   - @tanstack/react-query
   - zustand
   - react-hook-form @hookform/resolvers zod
   - axios
   - sonner
   - react-markdown remark-gfm
   - date-fns
   - lucide-react
   - clsx tailwind-merge
   - @react-oauth/google
 
✓ ESLint + Prettier 설정
   - eslint-plugin-react-hooks
   - @tanstack/eslint-plugin-query
   - prettier + .prettierrc
 
✓ 절대 경로 alias (@/) 설정
   - tsconfig.json: paths
   - vite.config.ts: resolve.alias
 
✓ 환경 변수 셋업 (env.ts + Zod 검증)
   - .env.development, .env.production
   - src/env.ts
 
✓ 폴더 구조 생성 (app / pages / features / shared)
 
✓ 라우터 빈 셸 구성
   - src/app/router.tsx: ROUTES 상수 활용한 16개 라우트 정의
   - 페이지 컴포넌트는 일단 빈 컴포넌트 (`<div>{화면명}</div>`)
 
✓ Provider 셋업 (src/app/providers.tsx)
   - QueryClientProvider (글로벌 onError 포함)
   - Toaster (sonner)
   - GoogleOAuthProvider
```
 
#### 완료 기준
 
- `npm run dev` 실행 시 1280px+ 폭에서 빈 페이지 동작
- 16개 라우트 경로가 404 없이 매칭됨 (빈 화면이라도 표시)
- `npm run build`가 에러 없이 성공
### 11-3. Step 2: 공통 인프라 (Infrastructure)
 
#### 작업 범위
 
```
✓ 토큰 관리 (shared/api/tokenManager.ts)
   - access: 메모리
   - refresh: localStorage
 
✓ axios 인스턴스 (shared/api/client.ts)
   - apiClient (백오피스용, base /api/v1/admin)
   - authApiClient (인증용, base /api/v1)
   - Request 인터셉터: Authorization 헤더 부착
   - Response 인터셉터: 401 처리 + reissue 단일 비행 큐 (shared/api/reissueQueue.ts)
 
✓ 에러 핸들러 (shared/api/errorHandler.ts)
   - getErrorMessage(): message > HTTP fallback > 네트워크 에러 순
   - QueryClient의 QueryCache/MutationCache onError에 연결
 
✓ 공용 응답 타입 (shared/api/types.ts)
   - PaginatedResponse<T>, ErrorResponse
 
✓ 인증 store (features/auth/store.ts)
   - useAuthStore (Zustand)
 
✓ 인증 API (features/auth/api.ts, hooks.ts)
   - login(providerId, idToken)
   - reissue (인터셉터 내부에서 호출)
   - fetchCurrentAdmin() — GET /admin/me (백엔드 추가 시)
   - useLogin, useLogout, useCurrentAdmin
 
✓ ProtectedRoute (loader 방식, app/router.tsx)
 
✓ 레이아웃 컴포넌트 (shared/components/layout/)
   - MainLayout (Sidebar + Header + <Outlet />)
   - LoginLayout (중앙 정렬)
   - Sidebar (240px, 메뉴 6개, 활성 표시, 운영자 영역)
   - Header (56px, breadcrumb 또는 페이지 타이틀, 로그아웃 버튼)
   - Breadcrumb (handle.breadcrumb 기반 자동 생성)
 
✓ 공용 UI 컴포넌트 (shared/components/)
   - DataTable + PaginationControl (data-table/)
   - StatusBadge (status-badge/, variant 6종 지원)
   - ConfirmModal (modals/, destructive variant 지원)
   - StrictMatchModal (modals/, 480px 폭)
   - UnsavedChangesModal (modals/)
   - EmptyState / ErrorState / LoadingSkeleton (states/)
   - FormField / FieldError (form/)
 
✓ 공용 유틸 (shared/lib/)
   - cn, formatDate, formatNumber, markdown
 
✓ 라우트 상수 (shared/constants/routes.ts)
✓ 한글 매핑 (shared/constants/labels.ts)
✓ 뱃지 variant 매핑 (shared/constants/badgeVariants.ts)
✓ 글자 수 제한 (shared/constants/fieldLimits.ts)
 
✓ 페이지 이탈 보호 훅 (shared/hooks/useUnsavedChangesGuard.ts)
```
 
#### 완료 기준
 
- 로그인 → 대시보드(빈 컨텐츠) 이동 동작
- 사이드바·헤더·breadcrumb 표시 (컨텐츠 영역은 비워둠)
- 401 → reissue → retry 동작 검증 (의도적으로 만료 토큰 주입 테스트)
- refresh 만료 시 `/login` 자동 이동 + 토스트 노출
- 사이드바 운영자 영역에 닉네임/이메일 표시
### 11-4. Step 3: 단순 화면 5개
 
#### 화면 목록
 
| # | 화면 ID | 경로 | 핵심 |
|---|---|---|---|
| 1 | LOGIN | `/login` | OAuth 3 provider 버튼 + 에러 표시 |
| 2 | DASHBOARD | `/` | Stat Card 3개 + 클릭 이동 |
| 3 | NOTICE_LIST | `/notices` | 데이터 테이블 + 페이지네이션 |
| 4 | CHAPTER_LIST | `/chapters` | 데이터 테이블 + 페이지네이션 |
| 5 | STAGING_LIST | `/staging/labels` | 필터 + 데이터 테이블 + 페이지네이션 |
 
#### 공통 요구사항
 
- 모든 화면은 **빈 상태 / 로딩 / 에러 / 정상** 4가지 상태 처리
- 모든 데이터 페칭은 TanStack Query 사용 (`useQuery`)
- 라우팅·이동은 ROUTES 상수 사용
- 한글 라벨은 `shared/constants/labels.ts` 매핑 사용
#### 완료 기준
 
- 5개 화면이 4가지 상태(빈/로딩/에러/정상) 모두 정상 표시
- STAGING_LIST 필터 변경 시 즉시 refetch (기본값 `PENDING`)
- 모든 행 hover + 클릭 시 상세 페이지 이동 (Step 4에서 만들 페이지로)
### 11-5. Step 4: 중간 화면 8개
 
#### 화면 목록
 
| # | 화면 ID | 경로 | 핵심 |
|---|---|---|---|
| 1 | NOTICE_NEW | `/notices/new` | Form Page + 검증 + 임시저장/게시 |
| 2 | NOTICE_DETAIL | `/notices/:id` | 표시/편집 모드 + 상태 전이 + 삭제 |
| 3 | USER_LIST | `/users` | 검색 + 필터 2종 + 테이블 |
| 4 | USER_DETAIL | `/users/:id` | 프로필 + status/role 변경 모달 4종 |
| 5 | REPORT_LIST | `/reports` | 필터 2종 (기본=미해결) |
| 6 | REPORT_DETAIL | `/reports/:id` | 정보 카드 + 처리 후 분기 동작 |
| 7 | UNIT_DETAIL | `/units/:id` | 편집 모드 + 레슨 목록 |
| 8 | LESSON_DETAIL | `/lessons/:id` | 편집 모드 + 문제 목록 |
 
#### 공통 요구사항
 
- 모든 폼은 React Hook Form + Zod 사용
- Confirm Modal variant는 `DS-03` 1-2 매핑 준수
- 편집 모드 진입/이탈 시 페이지 이탈 보호 (`useUnsavedChangesGuard`)
- mutation 후 캐시 invalidation
- breadcrumb 자동 생성 (학습 컨텐츠 계층은 추가 GET 호출 활용)
#### 완료 기준
 
- 8개 화면의 모든 동작 (검증, 모달, 편집 모드, 페이지 이탈 보호) 정상 동작
- USER_DETAIL의 4가지 변경 케이스 모두 적절한 variant Modal 표시
- REPORT_DETAIL의 미해결→해결됨 시 자동 목록 이동 + 필터 유지
- NOTICE_DETAIL의 상태 전이 제약 (DRAFT/PUBLISHED/ARCHIVED) 드롭다운 동작
### 11-6. Step 5: 중상 화면 2개
 
#### 화면 목록
 
| # | 화면 ID | 경로 | 핵심 |
|---|---|---|---|
| 1 | CHAPTER_DETAIL | `/chapters/:id` | 풀이 현황 통계 + 유닛 목록 + 편집 모드 |
| 2 | PROBLEM_DETAIL | `/problems/:id` | 객관식/주관식 분기 + 편집 모드 |
 
#### 핵심 동작
 
**CHAPTER_DETAIL**:
- 풀이 현황 위젯: `GET /chapters/{id}/stats` 응답을 미니 테이블 렌더링
- 진행률: Primary 컬러 가로 막대 + `{averageProgress.toFixed(1)}%` 텍스트
- 편집 모드 진입 시 챕터 정보 카드만 input/textarea로 전환 (통계/유닛 목록은 유지)
**PROBLEM_DETAIL**:
- `problemType`에 따라 객관식/주관식 컴포넌트 분기
- 객관식: 옵션 4개 고정. radio + content + explanation
- 주관식: **단일 정답 객체**. content는 콤마 구분 단일 문자열 + explanation
- 편집 모드 [저장] 시 객관식은 `PATCH /problems/{id}/objective`, 주관식은 `PATCH /problems/{id}/subjective` 호출
#### 완료 기준
 
- 풀이 현황의 진행률이 0.0~100.0 단위로 정확히 표시 (소수 1자리)
- 객관식 정답 변경 시 정확히 1개 선택 검증
- 주관식 정답 입력이 단일 필드(콤마 구분 문자열)로 동작
### 11-7. Step 6: STAGING_DETAIL (최복잡 화면, 9단계 분할)
 
화면 1개이지만 본 프로젝트의 거의 모든 패턴이 집약된 화면이므로 별도 단계로 분리 + 내부 9단계 분할 진행.
 
#### 6-1. 데이터 페칭 + 좌측 리스트 골격
- `GET /staging/labels/{label}` 호출, 데이터 구조 확인
- 좌측 280px 리스트 렌더링 (레슨 + 문제 6개)
- 활성 항목 전환만 동작 (form 미구현)
- 헤더 영역 (라벨명 + Status Badge + 메타 정보)
#### 6-2. 우측 레슨 폼
- `StagingLessonForm` 컴포넌트
- title 단일 input
- RHF + Zod 검증
- [저장] 비활성/활성 토글
#### 6-3. 우측 객관식 폼
- `StagingObjectiveForm` 컴포넌트
- instruction / content / 옵션 4개 (radio + content + explanation)
- 검증 규칙 적용 (10-1 참조)
#### 6-4. 우측 주관식 폼
- `StagingSubjectiveForm` 컴포넌트
- instruction / content / answer (단일: content + explanation)
- 콤마 구분 입력 UI
#### 6-5. 변경 감지 + 시각 표시
- RHF `formState.dirtyFields` 구독
- 변경된 input 좌측 4px Primary 보더
- 좌측 리스트의 ● 점 표시
- [저장] 버튼 활성화 조건 = `formState.isDirty`
- 활성 항목 전환 시 form 상태 보존 (hidden 방식 권장)
#### 6-6. 다중 PATCH 호출 + 부분 실패 처리
- `Promise.allSettled` 활용
- 변경된 필드만 골라 호출
- 객관식 정답 변경 시 이전 정답 옵션도 PATCH 대상에 포함
- 결과 분류 (전체 성공 / 부분 실패 / 전체 실패) + 토스트
- 저장 진행 중 [저장] 비활성 + spinner + 폼 input 비활성
#### 6-7. 헤더 [반영 완료 처리] + Strict Match Modal
- 버튼 상태 (숨김/비활성+툴팁/활성)
- StrictMatchModal 컴포넌트
- 라벨명 strict 비교 후 [반영] 활성
- promote API 호출 + 성공/실패 분기
- 성공 시 목록 이동 + 필터 유지
#### 6-8. COMPLETED 상태 (read-only)
- 안내 배너 (Banner Success)
- 헤더 버튼 숨김
- 우측 폼 disabled + bg-hover 배경
- 좌측 리스트의 ● 점 숨김
- [저장] 버튼 숨김
#### 6-9. 페이지 이탈 보호
- `useUnsavedChangesGuard(미저장 항목 1개 이상)` 적용
- beforeunload + useBlocker 둘 다 동작
- 이탈 confirm 모달 메시지: "저장하지 않은 항목이 {N}건 있습니다. ..."
#### Step 6 완료 기준
 
- 9개 하위 단계 모두 통과
- PENDING 라벨에서 변경 → 저장 → 반영의 full 흐름 동작
- COMPLETED 라벨 진입 시 read-only 모드 정확히 적용
- 미저장 변경 보호 (브라우저 닫기 + 라우터 이동 모두)
### 11-8. Step 7: QA & 통합 검증
 
#### 검증 시나리오 (15개)
 
**인증 시나리오**:
1. 비로그인 상태로 `/`로 직접 접근 → `/login` 리다이렉트
2. role=ADMIN으로 로그인 → `/`로 이동
3. accessToken을 강제로 만료시킨 후 API 호출 → reissue 자동 호출 후 retry 성공
4. refreshToken까지 만료 → `/login` 리다이렉트 + 토스트 "다시 로그인해주세요."
5. role=USER로 로그인 시도 → 403 + "백오피스 접근 권한이 없습니다." 표시
**페이지 이탈 보호 시나리오**:
6. NOTICE_NEW에서 제목 입력 후 사이드바 다른 메뉴 클릭 → confirm 모달
7. STAGING_DETAIL에서 한 항목 수정 후 좌측 다른 항목 클릭 → 자유 이동 (모달 없음)
8. STAGING_DETAIL에서 ● 항목 1개 이상 + 헤더 [반영 완료 처리] hover → 비활성 + 툴팁 노출
9. STAGING_DETAIL에서 미저장 항목 있는 상태로 새로고침 → beforeunload 확인창
 
**위험 액션 시나리오**:
10. USER_DETAIL에서 role을 USER → ADMIN 변경 → destructive variant 모달 + "관리자 권한을 부여하시겠습니까?"
11. 공지 DELETE → destructive 모달 → 204 응답 → 목록 이동
12. STAGING_DETAIL [반영 완료 처리] → Strict Match Modal → 라벨명 오타 → [반영] 비활성
 
**빈/에러/로딩 시나리오**:
13. 모든 List 화면의 빈 상태 표시 확인 (검색·필터 적용 전후 메시지 분기)
14. 네트워크 단절 상황(DevTools Offline)에서 모든 화면 동작 확인
15. 500 응답 시 Error State 또는 토스트 표시 확인
 
#### 디자인 시스템 일관성 검토
 
- 컬러 토큰 일관 사용 (Primary는 액션/강조에만)
- 타이포 토큰 일관 적용
- 카드 padding 24px, 컨텐츠 padding 32px 통일
- Status Badge variant 일관 적용
- Modal 폭 (일반 400px, Strict Match 480px) 통일
#### 완료 기준
 
- 15개 시나리오 모두 동작 보고
- 디자인 시스템 일관성 보고서 작성
- 미해결 이슈 목록화
---
 
## 12. Claude Code 핸드오프 프롬프트 템플릿
 
본 섹션은 각 Step별 Claude Code(또는 다른 코드 생성 AI)에 전달할 프롬프트 템플릿을 제공합니다. 그대로 복붙하여 사용 가능합니다.
 
### 12-1. 공통 원칙 (모든 Step에 포함)
 
```
## 작업 원칙
1. 첨부된 문서를 정확히 따르고, 임의로 해석하거나 추측하지 마세요.
2. 명세가 불명확하면 코드를 작성하지 말고 질문하세요. 환각 금지.
3. 디자인 시스템(DS-01)의 토큰과 컴포넌트 이름을 그대로 사용하세요.
4. shadcn/ui 기본 컴포넌트만 사용하고, 커스텀 스타일은 디자인 시스템 토큰을 통해서만 적용하세요.
5. 데스크탑 단일 폭(1280px+)만 고려하세요. 반응형/모바일 코드 작성 금지.
6. 타입 안전성을 우선합니다. `any` 사용 금지, 모든 API 응답은 타입 정의 후 사용하세요.
7. 명세에 없는 API 엔드포인트/필드를 임의로 만들지 마세요.
8. 모든 라우팅·이동은 `@/shared/constants/routes`의 ROUTES 상수를 사용하세요.
9. 데이터 페칭은 TanStack Query를 사용하세요. 직접 useEffect + fetch 금지.
10. 폼은 React Hook Form + Zod를 사용하세요. 직접 useState 폼 금지.
11. 사용자 액션의 결과 피드백은 sonner toast로 표시하세요.
 
## 입력 문서
- 04_gravit_admin_frontend_spec.md (본 통합 명세 — 작업의 기준)
- 01_gravit_admin_wireframe_spec.md (와이어프레임)
- 03_gravit_admin_api_spec.md (API 명세)
- DS-01_design_system.md (디자인 시스템)
- DS-02_screens.md (화면별 시각 구성)
- DS-03_interactions.md (상호작용)
 
## 문서 정합성 노트 (반드시 확인)
주관식 정답은 **단일 Answer 객체 + 콤마 구분 content** 모델입니다.
DS-02/DS-03의 "다중 정답 + 추가/삭제 UI" 기술은 무시하고 01_wireframe v1.2 / 03_api v1.1을 따르세요.
```
 
### 12-2. Step 1 프롬프트
 
```
Gravit 백오피스 프론트엔드 구현을 시작합니다. 첨부된 통합 명세서
(04_gravit_admin_frontend_spec.md)의 Step 1 (프로젝트 셋업)을 수행해주세요.
 
## 작업 범위
[04_spec §11-2의 작업 범위 체크리스트 그대로 삽입]
 
## 출력 요구사항
- 폴더 구조 생성 후 트리 출력
- package.json의 핵심 의존성 명시
- `npm run dev` 실행 시 1280px+ 폭에서 16개 라우트가 404 없이 매칭되어야 함
- `npm run build`가 에러 없이 성공해야 함
- 빈 페이지 컴포넌트는 `<div>{화면 ID}</div>` 형태로 placeholder만 만들어 두세요
 
## 완료 기준
[04_spec §11-2의 완료 기준 그대로 삽입]
 
## 작업 원칙
[§12-1 공통 원칙 그대로 삽입]
```
 
### 12-3. Step 2 프롬프트
 
```
Step 2 (공통 인프라)를 수행해주세요.
 
## 사전 조건
Step 1이 완료되어 있어야 합니다. 다음이 존재해야 합니다.
- Vite + React + TypeScript 프로젝트
- Tailwind + shadcn/ui 셋업
- 16개 라우트의 빈 페이지 컴포넌트
- 모든 의존성 설치 완료
 
## 작업 범위
[04_spec §11-3의 작업 범위 체크리스트 그대로 삽입]
 
## 핵심 구현 사항
1. **토큰 단일 비행 큐**: §6-4의 의사 코드를 따라 정확히 구현. 동시 401 발생 시 reissue를 단 1번만 호출하고 나머지는 큐에서 대기 후 새 토큰으로 retry.
2. **에러 → 토스트**: §6-6 우선순위(message > HTTP fallback > 네트워크 에러). 401은 토스트 생략.
3. **ProtectedRoute**: §7-3의 loader 방식. refreshToken 없으면 즉시 /login 리다이렉트.
4. **MainLayout**: 사이드바 240px + 헤더 56px + Content Area max-width 1200px (좌우 padding 32px, 상단 24px).
5. **사이드바**: 6개 메뉴 + 활성 메뉴 시각 처리 (좌측 3px Primary 보더 + Primary 8% opacity 배경 + Primary 텍스트).
 
## 출력 요구사항
- 로그인 → 대시보드(빈 컨텐츠) 이동 동작
- 사이드바·헤더·breadcrumb 표시
- 401 → reissue → retry 시나리오 동작 검증 코드 또는 검증 방법 제시
- 모든 공용 컴포넌트(DataTable, StatusBadge, ConfirmModal, EmptyState 등)의 사용 예시 1개씩
 
## 완료 기준
[04_spec §11-3의 완료 기준 그대로 삽입]
 
## 작업 원칙
[§12-1 공통 원칙 그대로 삽입]
```
 
### 12-4. Step 3 프롬프트 (단순 화면 5개)
 
```
Step 3 (단순 화면 5개 구현)을 수행해주세요.
 
## 사전 조건
Step 2가 완료되어 있어야 합니다.
 
## 구현 대상
[04_spec §11-4의 화면 목록 그대로 삽입]
 
## 화면별 참조 문서
 
### 1. LOGIN (/login)
- DS-02 §1, DS-03 §5-1, 01_wireframe §4-1
- OAuth provider 3개 버튼, 실패 시 카드 하단 에러 메시지
 
### 2. DASHBOARD (/)
- DS-02 §2, DS-03 §5-2, 01_wireframe §6-1
- Stat Card 3개, 카드 클릭 시 해당 도메인 이동
- API: GET /dashboard/summary
 
### 3. NOTICE_LIST (/notices)
- DS-02 §3, DS-03 §5-3, 01_wireframe §6-2-1
- Page Header 우측에 [+ 공지 작성]
- API: GET /notices?page={n}
 
### 4. CHAPTER_LIST (/chapters)
- DS-02 §10, 01_wireframe §6-5-1
- 검색·필터 없음. [+ 새로 만들기] 버튼 없음
- API: GET /chapters?page={n}
 
### 5. STAGING_LIST (/staging/labels)
- DS-02 §15, DS-03 §5-12, 01_wireframe §6-6-1
- 상태 필터, 기본값 PENDING
- 라벨명은 monospace 폰트
- API: GET /staging/labels?page={n}&status={}
 
## 구현 요구사항
- 모든 화면은 빈 상태 / 로딩 / 에러 / 정상 4가지 상태 처리
- 모든 데이터 페칭은 TanStack Query 사용
- queryKey는 도메인별 키 팩토리 사용 (§9-1)
- 한글 라벨은 §9-7의 매핑 사용
- Status Badge variant는 §9-8의 매핑 사용
 
## 완료 기준
[04_spec §11-4의 완료 기준 그대로 삽입]
 
## 작업 원칙
[§12-1 공통 원칙 그대로 삽입]
```
 
### 12-5. Step 4 프롬프트 (중간 화면 8개)
 
```
Step 4 (중간 화면 8개 구현)을 수행해주세요.
 
## 사전 조건
Step 3이 완료되어 있어야 합니다.
 
## 구현 대상
[04_spec §11-5의 화면 목록 그대로 삽입]
 
## 화면별 참조 문서
 
### 1. NOTICE_NEW (/notices/new)
- DS-02 §4, DS-03 §5-4, 01_wireframe §6-2-2
- Form Page 패턴, 검증 (§10-1)
- [취소]/[임시저장]/[게시] 3개 버튼
- 페이지 이탈 보호 (§8-4)
 
### 2. NOTICE_DETAIL (/notices/:id)
- DS-02 §5, DS-03 §5-5, 01_wireframe §6-2-3
- 표시 모드 / 편집 모드 분기
- 상태 전이 제약 적용
- 삭제 시 Destructive Modal
 
### 3. USER_LIST (/users)
- DS-02 §6, DS-03 §5-6, 01_wireframe §6-3-1
- 검색 + 필터 2종, 즉시 적용
- API: GET /users?page={n}&search={}&status={}&role={}
 
### 4. USER_DETAIL (/users/:id)
- DS-02 §7, DS-03 §5-7, 01_wireframe §6-3-2
- status/role 드롭다운 변경 시 §10-3의 4가지 Modal
- [취소] 시 드롭다운 원복
 
### 5. REPORT_LIST (/reports)
- DS-02 §8, DS-03 §5-8, 01_wireframe §6-4-1
- 필터 2종, 처리상태 기본값 "미해결"
- 문제ID 컬럼은 별도 링크 (행 클릭과 분리)
 
### 6. REPORT_DETAIL (/reports/:id)
- DS-02 §9, DS-03 §5-9, 01_wireframe §6-4-2
- [문제 보기 →] 같은 탭 이동
- 미해결→해결됨 시 목록 자동 이동 + 필터 유지
 
### 7. UNIT_DETAIL (/units/:id)
- DS-02 §12, DS-03 §5-10, 01_wireframe §6-5-3
- 편집 모드 + 레슨 목록
 
### 8. LESSON_DETAIL (/lessons/:id)
- DS-02 §13, DS-03 §5-10, 01_wireframe §6-5-4
- 편집 모드 + 문제 목록
 
## 구현 요구사항
- 모든 폼은 React Hook Form + Zod, §10-1의 검증 규칙 적용
- 페이지 이탈 보호 적용 (§8-4)
- mutation 성공 시 적절한 캐시 invalidation (§9-1)
- Modal variant는 §10-3 매핑 준수
- breadcrumb 자동 생성 (계층 화면은 부모 GET 호출 활용)
 
## 완료 기준
[04_spec §11-5의 완료 기준 그대로 삽입]
 
## 작업 원칙
[§12-1 공통 원칙 그대로 삽입]
```
 
### 12-6. Step 5 프롬프트 (중상 화면 2개)
 
```
Step 5 (중상 화면 2개 구현)를 수행해주세요.
 
## 사전 조건
Step 4가 완료되어 있어야 합니다.
 
## 구현 대상
 
### 1. CHAPTER_DETAIL (/chapters/:id)
- DS-02 §11, DS-03 §5-10, 01_wireframe §6-5-2
- Info Card 1: 풀이 현황 통계 위젯
  * API: GET /chapters/{chapterId}/stats
  * Progress Bar (Primary 컬러) + 소수 1자리 % 텍스트
- Info Card 2: 유닛 목록 + 페이지네이션 (카드 내부)
- 편집 모드 진입 시 챕터 정보 카드만 전환 (통계/유닛 목록 유지)
 
### 2. PROBLEM_DETAIL (/problems/:id)
- DS-02 §14, DS-03 §5-11, 01_wireframe §6-5-5
- problemType으로 객관식/주관식 분기
- **주관식은 단일 Answer 객체 + 콤마 구분 content** (§2-1 참조)
- 객관식 편집: 옵션 4개 고정, radio + content + explanation
- 주관식 편집: 단일 정답 입력 (Text Input 1개) + 해설 (Text Input 1개)
- API: PATCH /problems/{problemId}/objective 또는 /subjective
 
## 구현 요구사항
- 객관식 검증: 정답 정확히 1개 선택 + 모든 필드 빈 값 불가 (§10-1)
- 주관식 검증: 단일 정답 + 해설 빈 값 불가
- breadcrumb: §8-3 학습 컨텐츠 계층
 
## 완료 기준
[04_spec §11-6의 완료 기준 그대로 삽입]
 
## 작업 원칙
[§12-1 공통 원칙 그대로 삽입]
```
 
### 12-7. Step 6 프롬프트 (STAGING_DETAIL, 9단계 분할)
 
```
Step 6 (STAGING_DETAIL — 최복잡 화면)를 수행해주세요.
 
## 사전 조건
Step 5가 완료되어 있어야 합니다.
 
## 구현 대상
- STAGING_DETAIL (/staging/labels/:label)
- 참조 문서: DS-02 §16, DS-03 §5-13, 01_wireframe §6-7
- 04_spec §10-2 전체 (상세 동작 명세)
 
## 작업 방식 — 9단계 분할
다음 순서로 단계 분할하여 진행하세요. 각 단계 완료 후 결과를 보고하고
다음 단계로 넘어가주세요.
 
### 6-1. 데이터 페칭 + 좌측 리스트 골격
- GET /staging/labels/{label} 호출
- 좌측 280px 항목 리스트 (레슨 1 + 문제 6 = 7개)
- 활성 항목 전환 동작 (form 미구현)
- 헤더 영역 (라벨명 monospace + Status Badge + 메타 정보)
 
### 6-2. 우측 레슨 폼
- StagingLessonForm 컴포넌트
- 검증: 04_spec §10-1
 
### 6-3. 우측 객관식 폼
- StagingObjectiveForm 컴포넌트
- instruction / content / 옵션 4개
- 검증: 04_spec §10-1
 
### 6-4. 우측 주관식 폼
- StagingSubjectiveForm 컴포넌트
- instruction / content / answer (단일 객체)
- 검증: 04_spec §10-1
 
### 6-5. 변경 감지 + 시각 표시
- 좌측 4px Primary 보더 (변경된 input)
- 좌측 리스트 ● 점 (해당 항목 dirty 시)
- [저장] 버튼 활성화 조건 = formState.isDirty
- 활성 항목 전환 시 form 상태 보존 (hidden 방식 권장, 04_spec §10-2-3 참조)
 
### 6-6. 다중 PATCH 호출 + 부분 실패 처리
- 04_spec §10-2-5의 의사 코드 참조
- Promise.allSettled
- 전체 성공 / 부분 실패 / 전체 실패 분기 토스트
- 객관식 정답 변경 시 이전 정답 옵션도 PATCH 대상에 포함
 
### 6-7. 헤더 [반영 완료 처리] + Strict Match Modal
- 버튼 상태 (숨김/비활성+툴팁/활성) — 04_spec §10-2-6
- StrictMatchModal (480px) — 04_spec §10-2-7
- promote API + 성공/실패 분기 — 04_spec §10-2-8
 
### 6-8. COMPLETED 상태 (read-only)
- Banner Success
- 버튼 숨김 / form disabled / [저장] 숨김 / ● 점 숨김
- 04_spec §10-2-9 참조
 
### 6-9. 페이지 이탈 보호
- useUnsavedChangesGuard 적용 (조건: 미저장 항목 1개 이상)
- 메시지: "저장하지 않은 항목이 {N}건 있습니다. 페이지를 나가시겠습니까?"
 
## 완료 기준
[04_spec §11-7의 완료 기준 그대로 삽입]
 
## 작업 원칙
[§12-1 공통 원칙 그대로 삽입]
```
 
### 12-8. Step 7 프롬프트 (QA)
 
```
구현이 모두 완료되었습니다. Step 7 (QA & 통합 검증)을 수행해주세요.
 
## 검증 시나리오 (15개)
[04_spec §11-8의 검증 시나리오 15개 그대로 삽입]
 
## 디자인 시스템 일관성 검토
다음 항목을 점검하고 발견된 불일치를 모두 보고해주세요.
1. 컬러 토큰 일관 사용 (Primary는 액션/강조에만)
2. 타이포 토큰 일관 적용 (display/h1/h2/h3/body/caption)
3. 간격 토큰 일관 적용 (카드 padding 24px, 컨텐츠 padding 32px)
4. Status Badge variant 일관 사용
5. Modal 폭 통일 (일반 400px, Strict Match 480px)
6. 모든 화면이 데스크탑 1280px+ 단일 폭에서만 동작 (반응형 코드가 없는지 확인)
 
## 보고 형식
각 시나리오를 [O / X / 부분 동작] + 미동작/부분 동작 사유로 보고해주세요.
미구현 항목은 이슈 목록으로 정리해주세요.
 
## 작업 원칙
[§12-1 공통 원칙 그대로 삽입]
```
 
---
 
## 13. 백엔드 추가 요청 사항 (프론트엔드 관점)
 
본 명세서 작성 과정에서 프론트엔드 구현에 필요하나 현재 API 명세에 없는 항목을 정리합니다.
 
### 13-1. 신규 엔드포인트 요청
 
| # | 엔드포인트 | 사유 | 우선순위 |
|---|---|---|---|
| 1 | `GET /admin/me` | 현재 로그인한 운영자 프로필 조회 (사이드바 표시, 인증 store 초기화) | **High** |
 
#### 13-1-1. 요청 사양 예시
 
```
GET /api/v1/admin/me
Authorization: Bearer {accessToken}
 
응답 200:
{
  "adminId": number,
  "nickname": string,
  "email": string,
  "profileImgNumber": number,
  "role": "ADMIN"
}
```
 
### 13-2. 응답 필드 확장 요청
 
| # | 엔드포인트 | 추가 필드 | 사유 |
|---|---|---|---|
| 1 | `GET /units/{unitId}` | `chapterId`, `chapterTitle` | UNIT_DETAIL의 breadcrumb (`학습 컨텐츠 > {챕터} > {유닛}`) 표시. 부재 시 클라이언트가 추가 GET 호출로 우회 가능. |
| 2 | `GET /lessons/{lessonId}` | `unitId`, `unitTitle`, `chapterId`, `chapterTitle` | LESSON_DETAIL의 breadcrumb |
| 3 | `GET /problems/{problemId}` | `lessonId`, `lessonTitle`, `unitId`, `unitTitle`, `chapterId`, `chapterTitle` | PROBLEM_DETAIL의 breadcrumb |
 
### 13-3. 글자 수 제한 정책 확정 요청
 
현재 프론트엔드는 §9-5의 보수적 제한치를 적용하고 있으나, **DB 제약과 정렬되어야 합니다**. 백엔드 결정 후 동기화 필요:
 
| 필드 | 현재 프론트 제한 | 백엔드 확정 필요 |
|---|---|---|
| 공지 title | 100 | ? |
| 공지 summary | 200 | ? |
| 공지 content | 10000 | ? |
| 챕터/유닛 title | 100 | ? |
| 챕터/유닛 description | 500 | ? |
| 레슨 title | 100 | ? |
| 문제 instruction | 500 | ? |
| 문제 content | 2000 | ? |
| 옵션 content | 200 | ? |
| 옵션 explanation | 1000 | ? |
| 주관식 answer content | 500 | ? |
| 주관식 answer explanation | 1000 | ? |
 
### 13-4. 프로필 이미지 매핑 규칙 확정
 
`profileImgNumber` (정수) → 실제 이미지 매핑 규칙을 사용자 앱 명세와 동기화 필요. 본 명세서 시점에는 구체적 매핑이 미공개 상태로, 구현 시 사용자 앱 팀과 확인 필요.
 
### 13-5. 자기 자신 보호 정책 (운영 권고)
 
현재 USER_DETAIL에서 본인 계정의 role/status 변경이 가능합니다. 운영자가 실수로 자기 자신의 role을 USER로 변경하면 즉시 백오피스 접근 불가 상태가 됩니다.
 
**프론트엔드 측 보호 (현 명세 기준 미적용)**: 본 명세서는 와이어프레임 결정에 따라 본인 변경을 차단하지 않으나, 운영 리스크 감소를 위해 다음 중 하나 도입을 권장:
- 본인 계정 변경 시 추가 경고 모달
- `GET /admin/me` 응답의 adminId와 비교하여 본인 계정 식별 후 변경 액션 disabled
이 결정은 백엔드 + 운영팀과 협의 후 명세서 갱신 필요.
 
---
 
## 14. 참고 문서 및 변경 이력
 
### 14-1. 참조 문서
 
| 문서 | 버전 | 용도 |
|---|---|---|
| `01_gravit_admin_wireframe_spec.md` | v1.2 | 와이어프레임 + 동작 명세 |
| `03_gravit_admin_api_spec.md` | v1.1 | API 통합 명세 |
| `DS-00_overview.md` | v1.0 | 프로젝트 개요 |
| `DS-01_design_system.md` | v1.0 | 디자인 시스템 |
| `DS-02_screens.md` | v1.0 | 화면별 시각 구성 (주관식 부분은 v1.2 와이어프레임 우선) |
| `DS-03_interactions.md` | v1.0 | 상호작용 (주관식 부분은 v1.2 와이어프레임 우선) |
| `DS-04_prompt_templates.md` | v1.0 | Claude Design 프롬프트 템플릿 |
 
### 14-2. 본 문서 변경 이력
 
- **v1.0** (2026-04-26): 초안 작성
  - Phase 1~5 (기술 스택 / 인증 / 구조 / 횡단 정책 / Step 가이드) 결정 통합
  - 문서 정합성 노트(§2): 주관식 정답 모델을 단일 객체 기준으로 통일
  - 백엔드 추가 요청 사항 정리

### 14-3. 결정 사항 요약 (Phase별)
 
#### Phase 1: 기술 스택
- 빌드 도구: Vite + React + TypeScript
- 라우팅: React Router v7 (data router)
- 서버 상태: TanStack Query v5
- 클라이언트 상태: Zustand
- 폼: React Hook Form + Zod
- HTTP: axios
- OAuth: `@react-oauth/google` + Kakao/Naver CDN SDK
- 마크다운: react-markdown + remark-gfm
- 토스트: sonner
- 날짜: date-fns
- 스타일: Tailwind CSS v3 + shadcn/ui
- 테스트: 단위 미도입, E2E 추후 검토
#### Phase 2: 인증 & 보안
- OAuth 흐름: 팝업 방식
- 토큰 저장: access=메모리, refresh=localStorage
- 토큰 갱신: axios 인터셉터 + 단일 비행 큐
- ProtectedRoute: React Router loader 기반
- 로그아웃: 클라이언트 측 토큰 삭제 + 캐시 clear
#### Phase 3: 프로젝트 구조 & 컨벤션
- 디렉토리: 도메인 단위 (app / pages / features / shared)
- import: 절대 경로 alias (@/)
- 환경 분리: 2환경 (개발 / 운영)
#### Phase 4: 횡단 정책
- 라우트 정의: 중앙 집중식 ROUTES 상수
- Breadcrumb: handle.breadcrumb + 부모 리소스 추가 GET 호출
- 이탈 보호: beforeunload + useBlocker 이중 보호
- 에러 매핑: message > HTTP fallback > 네트워크
- 글자 수 제한: 보수적 제한 + 백엔드 확장 요청
#### Phase 5: Step별 구현
- 7 Step (셋업 / 인프라 / 단순 / 중간 / 중상 / 최복잡 / QA)
- STAGING_DETAIL은 내부 9단계 분할
---