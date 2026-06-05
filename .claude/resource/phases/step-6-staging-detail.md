# Step 6 — STAGING_DETAIL (최복잡, 9 하위단계)

## 목적
한 화면이지만 9 하위단계로 분할. 각 하위단계 = 체크리스트 1항목 = 게이트/패킷 단위.

## 선행조건
- step-5 COMPLETED.

## 참조파일
- `.claude/spec/04...` §10-2(전체 상세동작), §11-7(9분할), §12-7(프롬프트)
- `.claude/spec/01...` §6-7, `.claude/spec/DS-02 §16`, `.claude/spec/DS-03 §5-13`
- `.claude/rules/decisions.md`(D1), `.claude/skills/implement-one-screen/SKILL.md`

## 절차 (체크리스트 ID 순)
- 6-1 데이터페칭+좌측리스트 → 6-2 레슨폼 → 6-3 객관식폼 → 6-4 주관식폼(**D1 단일**) → 6-5 dirty+시각 → 6-6 다중PATCH(allSettled, 부분실패) → 6-7 promote(StrictMatch, 비가역=코드구조만) → 6-8 COMPLETED read-only → 6-9 이탈보호.
- 각 하위단계마다 게이트→green 커밋→패킷→정지.

## 출력
- §11-7 완료기준(full 흐름, COMPLETED read-only, 이탈보호).

## 실패처리 / 다음 phase
- 자가수정 3회. promote 실제 실행은 사람. → `step-7-qa.md`.
