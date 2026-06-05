# 규칙 — 확정 결정(Locked Decisions)

> spec 간 충돌·미확정 사항에 대해 **이미 내려진 결정**. 재논의 금지(바꾸려면 사용자 승인). 근거 spec 섹션을 함께 적는다. phase 파일들이 `D1~D4` 로 참조한다.

## D1 — 주관식 정답 = 단일 Answer + 콤마 구분 content
- 모델: **단일 Answer 객체 1개**, 정답들은 `content` 에 콤마로 구분된 한 문자열. (`build-state.json.meta.subjective_model = "B-single-comma"`)
- 표시 모드: 정답을 콤마 그대로 한 줄 표시, `(N개)` 표기 제거.
- 편집 모드: **Text Input 1개 + 해설 Textarea 1개**. `[+ 정답 추가]`/`X 삭제` 버튼 **없음**.
- 적용: `PROBLEM_DETAIL` 주관식, `STAGING_DETAIL` 6-4 주관식 폼.
- 근거: `04 §2(문서 정합성 노트)`. **DS-02/DS-03 의 "다중 정답 N개" 묘사는 무시**(이 결정이 우선).

## D2 — 주관식 정답 개수 고정
- 운영자는 자동 생성된 N개 정답을 **수정만** 가능. 추가·삭제 불가. 추가/삭제 API 없음.
- 백엔드: 개수 불일치 시 `400 SUBJECTIVE_ANSWER_COUNT_FIXED`.
- 근거: `01 §6-7-7`(Q19), `03 §7-14`.

## D3 — 운영자 자기 자신 권한/상태 변경 허용
- 본인 계정의 role/status 변경 **허용**(차단하지 않음). 단 위험 경고를 시각적으로 노출.
- 주의: 본인 role 을 USER 로 바꾸면 즉시 백오피스 접근 권한 상실.
- 근거: `01 §6-3-2`(Q3).

## D4 — `GET /admin/me` 미구현
- 현재 명세에 없음. 사이드바 운영자명 등은 **가용 정보로 처리**하고, 해당 Step 패킷에 `manual-review` 로 명시.
- 근거: `.claude/resource/phases/step-2-infra.md`.

## 기타 확정값 (계약에서 고정 — 임의 변경 금지)
- 토큰: access **2h** / refresh **14d**, Rotation, refresh 는 Redis 화이트리스트 + body 전달. (`03 §3, §11`)
- 목록 페이지 크기 **20행 고정**(서버 고정, 클라 변경 불가). (`03 §2-4`, `04 §6-3`)
- 객관식: 옵션 정확히 4개, 정답 `isAnswer` 정확히 1개. 정답 변경 시 **이전 정답 옵션 + 새 정답 옵션 2개 모두 PATCH**. (`01 §6-7-6`, `03 §7-12`)
- 스테이징 1 라벨 = 레슨 1 + 문제 6. promote 는 라벨명 **strict match** 입력(대소문자·공백 포함). (`01 §6-7-8`, `03 §8`)
- 공지 상태 단방향: `DRAFT → PUBLISHED → ARCHIVED`(역방향·DRAFT 복귀 불가, ARCHIVED 종착). (`01 §8-5`, `03 §9-4`)
- datetime 전송 **ISO 8601 UTC**. (`03 §12`)

관련: [[source-of-truth]] · [[api-contract]]
