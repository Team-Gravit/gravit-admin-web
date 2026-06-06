# 규칙 — API 계약 준수

> 근거: `03_..._api_spec.md`(spec/). 엔드포인트/필드/응답은 **반드시 거기서 확인**. 여기는 불변 규칙 + 공통 형태만.

## 절대 규칙
- 명세에 **없는 엔드포인트/필드/쿼리 만들지 않는다.** 필요해 보이면 멈춰 질문(🙋🏻). → [[source-of-truth]]
- 모든 응답은 **Zod 스키마로 파싱 후** 사용. `any`/캐스팅 우회 금지. 스키마는 `features/{domain}/schemas.ts`.
- Base URL `/{API_HOST}/api/v1/admin`. 인증 `Authorization: Bearer {accessToken}` (login 제외 전부 `role=ADMIN`).

## 공통 응답 형태 (03 §2)
- 페이지네이션: `{ page, totalPages, hasNextPage, content: T[] }`. 페이지 크기 **20 고정**.
- 에러: `{ code, message }`. `code` = 도메인 코드(`USER_NOT_FOUND` 등). 토스트는 `message` 우선 노출. → [[good-patterns]]
- 상태코드: 200/201/204 성공, 400 검증, 401 인증, 403 권한, 404 없음, **409 상태전이 위반·COMPLETED 라벨 편집**, 5xx 서버.
- datetime 전송은 **ISO 8601 UTC**(`...Z`).

## Enum (03 §5 / 01 §8) — 값 추가/변경 금지
- user `status`: ACTIVE·SUSPENDED·DELETED(soft) / `role`: ADMIN·USER
- report `reportType`: TYPO_ERROR·CONTENT_ERROR·ANSWER_ERROR·OTHER_ERROR / `isResolved`: boolean
- problem `problemType`: OBJECTIVE(옵션 4·정답 1)·SUBJECTIVE(**정답 단일 객체 1개** `{answerId, content(콤마 String), explanation}`, prod·staging·GET·PATCH 동일 → [[decisions]] D1·D2. `03` answers 배열 표기는 stale)
- staging label `status`: PENDING(편집가능)·COMPLETED(read-only, 편집 시 409)
- notice `status`: DRAFT·PUBLISHED·ARCHIVED (단방향, ARCHIVED 종착)

## 상태전이 (백엔드 검증, 프론트도 UI 차단)
- 공지: DRAFT→{DRAFT,PUBLISHED} / PUBLISHED→{PUBLISHED,ARCHIVED} / ARCHIVED→ARCHIVED. (03 §9-4)
- 스테이징 promote: `PATCH /staging/labels/{label}/status` → PENDING→COMPLETED. **가장 위험·비가역 → 코드구조만, 실행은 사람.** → [[hooks]]

## 04 stale 조항 — 03 우선 (Step 2 해소, 재발 방지)
> 04 의사코드 중 03 v1.1과 어긋나는 항목. 코드는 항상 03을 따른다.
- 04 §6-4 (access-only 저장)        → 03 §3-2: refresh Rotation, access+refresh **둘 다** 저장
- 04 §7-4 (logout 미제공)           → 03 §3-3: POST /auth/logout 구현(body refreshToken, 204)
- 04 §6 (/auth/reissue), §6-7 {error,message} → 03 §3-2 POST /api/v1/admin/auth/refresh, §2-5 {code,message}

## 토큰 (03 §3)
- access 2h / refresh 14d, refresh Rotation, Redis 화이트리스트. 401 → reissue 단일비행 큐로 갱신 후 retry. → [[good-patterns]]

관련: [[decisions]] · [[architecture]] · [[good-patterns]]
