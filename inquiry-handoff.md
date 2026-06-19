# 문의 관리(Inquiry) — 프론트 구현 인테이크 양식 (작성 완료본)

> **목적**: 백오피스에 새 토픽 **"문의 관리"** 화면을 추가하기 위한 프론트 명세.
> 아래 A 섹션은 **실제 구현 코드(gravit-server, #404·#405)에서 100% 확정**된 값이다.
> B 섹션은 기획/운영 결정이 반영된 값, C 섹션은 기존 백오피스 패턴 자체 완성.
>
> **이 화면은 신고관리와 다르다.** 신고는 상태 토글만 있지만, 문의는 운영자가 **답변을 작성/수정/삭제**하고 그에 따라 상태가 자동으로 바뀐다. 작성자 정보(닉네임/이메일)도 노출된다.

---

## 0. 핵심 분기 — 확정

| # | 질문 | 답 (실제 구현 기준) |
|---|---|---|
| Q1 | 목록만 / 목록+상세 | **목록 + 상세** (상세 엔드포인트 존재) |
| Q2 | 답변 작성? / 상태만 변경? | **답변 작성함**. 운영자가 답변을 등록/수정/삭제. ⚠️ 신고와 달리 **별도 상태 토글 없음** — 상태는 답변 등록(→RESOLVED)/삭제(→PENDING)에 따라 **자동 전환** |
| Q3 | 작성자 정보 노출? | **노출함**. 목록=닉네임, 상세=닉네임+이메일. ⚠️ 신고(미노출)와 반대. 탈퇴 사용자는 `null` |
| Q4 | 검색/필터? | **`status` 필터만** 있음. 키워드 검색 **없음**. 진입 기본값 = **`PENDING`**(대기) |
| Q5 | 카테고리/유형? | **있음** — `type` (4종: 버그/콘텐츠오류/기능제안/기타) |

---

## A. API 계약 *(실제 코드에서 확정 — 필수)*

### A-0. 공통 규약 — ⚠️ 양식 기본 가정과 다른 점 3가지

- **Base URL**: `/api/v1/admin/inquiries` · 인증 `Authorization: Bearer {accessToken}`, `role=ADMIN`
- ⚠️ **페이지네이션 래퍼 필드명이 일반적 가정과 다름**:
  ```json
  { "page": 1, "totalPages": 3, "hasNext": true, "contents": [ /* T[] */ ] }
  ```
  - `hasNextPage` → **`hasNext`**, `content` → **`contents`**
  - ⚠️ **`page`는 1-base** (0-base 아님). 첫 페이지 = `page=1`
  - 페이지 크기 **20 고정**, 정렬 = id 내림차순(최신순)
- **에러 응답 형태**: `{ "code": "INQUIRY_4041", "message": "존재하지 않는 문의입니다." }`
  - ⚠️ `code`는 도메인명이 아니라 **`INQUIRY_4041` 형태(접두사_숫자)**. 프론트 토스트는 `message` 우선 노출
- **상태코드**: 200/201/204 성공 · 400 검증 · 401 인증 · 403 권한 · 404 없음 · 409 상태전이 위반 · 5xx 서버
- ⚠️ **datetime**: `LocalDateTime` 직렬화 → **`2026-06-19T08:30:00`** (타임존/`Z` 없음). UTC 보장 아님

### A-1. enum 정의

| enum 이름 | 코드 값(전체) | 한글 라벨(제안) | 비고 |
|---|---|---|---|
| `status` (처리상태) | `PENDING` \| `RESOLVED` | 대기 / 답변완료 | ⚠️ 값 **2개뿐** |
| `type` (유형) | `BUG_REPORT` \| `CONTENT_ERROR` \| `FEATURE_SUGGESTION` \| `OTHER` | 버그 신고 / 콘텐츠 오류 / 기능 제안 / 기타 | 필드명은 `category`가 아니라 **`type`** |

**상태 전이 규칙**:
```
PENDING --(답변 등록)--> RESOLVED --(답변 삭제)--> PENDING   (양방향, 답변 액션에 종속)
※ 운영자가 status를 직접 지정하는 API는 없음. 답변 등록/삭제의 부수효과로만 전환됨.
```

### A-2. 엔드포인트 (실제 5개)

#### A-2-1. 목록 — `GET /api/v1/admin/inquiries`

**쿼리 파라미터**

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---|---|---|---|---|
| `page` | number | N | **1** | ⚠️ 1-base |
| `status` | string | N | (없음=전체) | A-1 `status` enum |

**응답 `contents[]` 1건** (`AdminInquiryListItemResponse`)

| 필드 | 타입 | 설명 |
|---|---|---|
| `inquiryId` | number | 문의 ID |
| `title` | string | 제목 (최대 50자) |
| `type` | string | A-1 `type` enum |
| `status` | string | A-1 `status` enum |
| `submitterId` | number | 작성자 ID |
| `submitterNickname` | string\|null | 작성자 닉네임 (탈퇴 시 null) |
| `createdAt` | string | datetime |

#### A-2-2. 상세 — `GET /api/v1/admin/inquiries/{inquiryId}`

**응답** (`AdminInquiryDetailResponse`)

| 필드 | 타입 | 설명 |
|---|---|---|
| `inquiryId` | number | |
| `title` | string | |
| `type` | string | A-1 enum |
| `content` | string | 문의 본문 |
| `status` | string | A-1 enum |
| `submitterId` | number | 작성자 ID |
| `submitterNickname` | string\|null | 탈퇴 시 null |
| `submitterEmail` | string\|null | 탈퇴 시 null |
| `createdAt` | string | datetime |
| `updatedAt` | string | datetime |
| `answer` | object\|null | 답변 없으면 **null** (아래 구조) |

**`answer` 객체** (`AdminInquiryAnswerResponse`)

| 필드 | 타입 | 설명 |
|---|---|---|
| `answerId` | number | 답변 ID |
| `content` | string | 답변 본문 |
| `adminId` | number | 답변 작성 관리자 ID |
| `answeredAt` | string | 답변 작성 시각 |
| `updatedAt` | string | 답변 수정 시각 |

#### A-2-3. 상태 변경 — ❌ 해당 엔드포인트 없음

문의는 별도 status PATCH가 없다. 상태는 A-2-4의 답변 액션으로 자동 전환된다.

#### A-2-4. 답변 — 등록/수정/삭제

| 작업 | 메서드 + 경로 | 요청 body | 성공 응답 | 부수효과 |
|---|---|---|---|---|
| 등록 | `POST /api/v1/admin/inquiries/{inquiryId}/answer` | `{ "content": "답변 내용" }` (`@NotBlank`) | **201** + 상세객체(`AdminInquiryDetailResponse`) | status → **RESOLVED** 자동 변경 + 작성자에게 알림 발송 |
| 수정 | `PUT /api/v1/admin/inquiries/{inquiryId}/answer` | `{ "content": "..." }` (`@NotBlank`) | **200** + 상세객체 | status 유지(RESOLVED) |
| 삭제 | `DELETE /api/v1/admin/inquiries/{inquiryId}/answer` | (없음) | **204** 무본문 | status → **PENDING** 복구 |

- 글자수 제한: `@NotBlank`만 (상·하한 명시 없음 — 빈 값/공백만 거부)
- 실패 케이스:
  - `404 INQUIRY_4041` 문의 없음 / `404 INQUIRY_4042` 답변 없음(수정·삭제 시)
  - `409 INQUIRY_4092` 이미 답변 등록된 문의에 또 등록

### A-3. 전체 에러코드

| code | HTTP | message |
|---|---|---|
| `INQUIRY_4001` | 400 | 문의 제목이 유효하지 않습니다. |
| `INQUIRY_4002` | 400 | 문의 내용이 유효하지 않습니다. |
| `INQUIRY_4031` | 403 | 본인의 문의만 접근할 수 있습니다. |
| `INQUIRY_4041` | 404 | 존재하지 않는 문의입니다. |
| `INQUIRY_4042` | 404 | 등록된 답변이 없습니다. |
| `INQUIRY_4091` | 409 | 이미 답변이 완료된 문의는 수정/삭제할 수 없습니다. |
| `INQUIRY_4092` | 409 | 이미 답변이 등록된 문의입니다. |

---

## B. 화면 동작

- **목록 컬럼**(좌→우): `inquiryId` / `type`(유형 배지) / `title` / `submitterNickname`(작성자) / `status`(상태 배지) / `createdAt`
- **행 클릭 시**: 상세로 이동 (`GET /inquiries/{inquiryId}`)
- **검색/필터 UI**: `status` 드롭다운 (대기/답변완료/전체). **진입 기본값 = `PENDING`**(=status=PENDING 전송). 변경 시 즉시 적용 + `page=1`로 리셋. ⚠️ 키워드 검색·유형 필터는 API 미지원 → 만들지 않음
- **운영자 액션**:
  - 상태 변경: ⚠️ **직접 토글 없음**. 상태는 답변 등록/삭제의 부수효과로만 바뀜 (배지는 읽기 전용 표시)
  - 답변 작성: 상세 하단 textarea + 저장 버튼. **등록/수정/삭제 모두 제공**
    - 답변 없을 때: 빈 textarea + `[등록]` → `POST .../answer`
    - 답변 있을 때: 기존 내용 채운 textarea + `[수정]`(`PUT`) + `[삭제]`(`DELETE`)
    - 삭제 시 확인 모달 권장 ("답변을 삭제하면 상태가 '대기'로 돌아갑니다")
- **저장/삭제 성공 후** (모두 **상세 유지 + 토스트**):
  - 등록: "답변이 등록되었습니다" → 201 응답의 상세객체로 화면 갱신(answer 영역·status 배지 즉시 반영)
  - 수정: "답변이 수정되었습니다" → 200 응답으로 갱신
  - 삭제: "답변이 삭제되었습니다" → answer 영역 비우고 status 배지 '대기'로
- **빈 상태/에러 문구**: 목록 비었을 때 "문의가 없습니다" / 에러 토스트는 응답 `message` 우선
- **작성자 정보 노출**: 목록=`submitterNickname`, 상세=`submitterNickname` + `submitterEmail`. **둘 다 `null` 가능**(탈퇴 사용자) → "(탈퇴한 사용자)" 폴백 표시 권장
- **권한/제약**: 답변이 이미 있는 문의에 재등록(`POST`) 시 `409 INQUIRY_4092` → "이미 답변이 등록되었습니다"

---

## C. 시각 / 디자인

- Figma 없음 → 기존 백오피스(신고/유저/공지) 톤·토큰·테이블·배지·모달 패턴으로 자체 완성. 신고관리 레이아웃 베이스 + 상세 하단에 답변 편집 영역 추가.

---

## D. 신고관리와의 차이 요약 (프론트가 가장 먼저 알아야 할 것)

| 항목 | 신고관리 | **문의관리** |
|---|---|---|
| 작성자 노출 | 미노출 | **노출**(닉네임/이메일) |
| 운영자 쓰기 | 상태 토글만 | **답변 등록/수정/삭제** |
| 상태 변경 | `PATCH .../status {isResolved}` | **별도 API 없음** — 답변 액션의 부수효과 |
| 상태값 | boolean | `PENDING`/`RESOLVED` |
| 유형 필터 | 있음(reportType) | **없음**(status만) |
| 응답 래퍼 | `hasNextPage`/`content`/0-base | ⚠️ `hasNext`/`contents`/**1-base** (전체 백오피스 공통) |

**프론트가 특히 주의할 함정 3가지**:
1. 페이지네이션 필드명(`hasNext`/`contents`)과 **1-base**
2. status 직접 변경 API가 없다는 점(답변으로만 전환)
3. datetime이 `Z` 없는 로컬 형태
