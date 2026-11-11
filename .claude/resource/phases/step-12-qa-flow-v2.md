# Step 12 — QA 흐름 v2

## 권위
- 사용자 요청서(W1~W14, SESSION_E1 계약, P1~P10)와 2026-11-11 승인, `rules/decisions.md` D11.
- D11은 D9와 로컬 미추적 QA_SPEC.md의 충돌 부분보다 우선한다.
- 기존 H1/H2와 다른 메뉴는 범위 밖. 사용자 변경·환경 파일·rewrite·proxy를 보존한다.

## 순서
1. `step-12:QA_FLOW_V2-CONTRACT`: Zod → API → 쿼리/변경 처리 → MSW. round 필수, version 잠금, reason 이력.
2. `step-12:QA_FLOW_V2-LIST`: 3열 목록, 공통 헤더/6단계/4개 링크, 상태별 진입.
3. `step-12:QA_FLOW_V2-SETUP`: 연결 5개, 준비 단계 5개, 전후 비교/승인/거절/재수집.
4. `step-12:QA_FLOW_V2-DESIGN`: 반원형 속도계, 화면별 묶음, 판정/이력/다음 미검수.
5. `step-12:QA_FLOW_V2-CHECKLIST`: round 1/2, 추가/수정/삭제, 초기화 확인, 2차에서만 종료.
6. `step-12:QA_FLOW_V2-VERIFY`: lint/build/e2e/하네스 게이트, 명세·DS 리뷰, 항목별 리뷰 JSON과 최종 패킷.

## 검증과 상태
- IN_PROGRESS는 최대 1개. 기존 checklist의 ID/상태/상대 순서는 유지한다.
- UI 전환 중에는 연결된 계약 변경이 끝난 뒤 통합 게이트를 수행한다. 통과 전 완료를 주장하지 않는다.
- 리뷰어는 `spec-conformance-reviewer`와 `ds-conformance-reviewer`를 호출한다. QA 명세 권위는 D11이다.
- 리뷰 결과는 `harness/review/<id>.json`, 검증 사실과 실서버 확인사항은 build-state.log/manual_review에 기록한다.
- 사용자 승인으로 커밋 절차는 최종 결과 보고 이후로 이연한다. 커밋/푸시는 별도 승인 전 실행하지 않는다.
