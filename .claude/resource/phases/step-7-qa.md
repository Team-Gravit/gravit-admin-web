# Step 7 — QA & 통합 검증

## 목적
15개 시나리오 + 디자인 일관성 + 위험3흐름 스모크.

## 선행조건
- step-1~6 모든 항목 COMPLETED/SKIPPED.

## 참조파일
- `.claude/spec/04...` §11-8(시나리오 15), §12-8
- `.claude/resource/smoke/*`(promote/role/login)

## 절차
1. `.claude/hooks/checks/gate-runner.sh --with-smoke` (full + 스모크). 하드블록.
2. 15개 시나리오 [O/X/부분] + 사유 기록.
3. 디자인 일관성 점검(토큰/타이포/간격/Badge/모달폭/반응형 부재).
4. 미해결 이슈 목록화.

## 출력
- QA 보고서 + 디자인 일관성 보고 + 이슈 목록(리뷰 패킷 §A~F).

## 실패처리 / 다음 phase
- red → 수정. 완료 시 Phase C(통합 QA) 종료.
