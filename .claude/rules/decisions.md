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

## 기타 확정값 (계약에서 고정 — 임의 변경 금지)
- 토큰: access **2h** / refresh **14d**, Rotation, refresh 는 Redis 화이트리스트 + body 전달. (`03 §3, §11`)
- 목록 페이지 크기 **20행 고정**(서버 고정, 클라 변경 불가). (`03 §2-4`, `04 §6-3`)
- 객관식: 옵션 정확히 4개, 정답 `isAnswer` 정확히 1개. 정답 변경 시 **이전 정답 옵션 + 새 정답 옵션 2개 모두 PATCH**. (`01 §6-7-6`, `03 §7-12`)
- 스테이징 1 라벨 = 레슨 1 + 문제 6. promote 는 라벨명 **strict match** 입력(대소문자·공백 포함). (`01 §6-7-8`, `03 §8`)
- 공지 상태 단방향: `DRAFT → PUBLISHED → ARCHIVED`(역방향·DRAFT 복귀 불가, ARCHIVED 종착). (`01 §8-5`, `03 §9-4`)
- datetime 전송 **ISO 8601 UTC**. (`03 §12`)

관련: [[source-of-truth]] · [[api-contract]]
