| Before | After | Why |
|---|---|---|
| 공용 Button의 transition-opacity·duration-feedback80ms 상속 (`src/shared/components/ui/button.tsx:7`) | 원래 native button의 즉시 opacity hover/disabled, computed transition0s (`src/features/auth/components/OAuthButtons.tsx:29`) | 승인 계획대로 원래 표시를 복원하면서 불필요한 보간 제거. 키보드도 즉시, 진입/반복/이동 모션 추가 없음 |

**Approve** — 모션 회귀 지적 없음. 10개 기준으로 제거된 효과를 검토했으며 새 easing/origin/재시작 타이머/레이아웃 보간이 없습니다. 보통/reduced 모두 실행 중 animation0, transition0s를 확인했습니다. 포커스는 정적 ring이며 대기 잠금과 클릭 조건은 기존 단위·목e2e·인증 테스트로 검증했습니다. 호버 opacity는 정적 표시이므로 애니메이션 hover gating 대상이 아닙니다.
