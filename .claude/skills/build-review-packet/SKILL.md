---
name: build-review-packet
description: Step(또는 STAGING_DETAIL 하위단계) 종료 시 사용자 승인을 받기 위한 리뷰 패킷(§A~F)을 작성하고 정지한다. build-orchestrator 가 사람 게이트에서 사용.
---

# 리뷰 패킷 (§A~F) 양식

Step 종료마다(STAGING_DETAIL 은 9 하위단계 각각마다) 아래 형식으로 제출하고 **정지**. 사용자 승인 후에만 다음 단계.

## §A. 범위
- 이번 항목 ID(들) / 화면 / Step. build-state 체크리스트상 위치.

## §B. 변경 사항
- 추가·수정 파일 목록(간결히) + 커밋 해시/메시지.

## §C. 명세 준수 (인용)
- 충족한 spec 섹션을 인용으로: "`01 §6-7-8` promote strict-match → StagingPromoteModal 에서 구현".
- 적용한 결정 D1~D4. 명세에 없어 **만들지 않은 것**과 그 이유.

## §D. 게이트 결과
- `gate-runner.sh --full` 출력: validate-state / typecheck / token-lint / build (QA 는 `--with-smoke` 로 + smoke) 각각 green 증빙.
- 자가수정 횟수(`retry`), 발생한 경우 사유.

## §E. 동작 확인
- 4상태(Empty/Loading/Error/Data) + 상호작용(모달/토스트/검증) + 이탈보호 확인 결과. 스크린샷 또는 수동 확인 체크.

## §F. 미해결 / 다음
- `manual_review` 항목, 비가역으로 **사람에게 위임한 것**(예: 실제 promote).
- 명세 불명확으로 막힌 질문(🙋🏻).
- 다음 체크리스트 항목.

---
제출 후: 상태를 갱신하지 말고 **정지**. 승인 시그널을 받으면 `build-orchestrator` 가 다음 항목으로.

참조: [[hooks]] · [[decisions]] · [[antipatterns]]
