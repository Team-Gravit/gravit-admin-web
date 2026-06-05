# Step 3 — 단순 화면 5개

## 목적
§11-4 의 화면들을 구현. 각 화면은 `implement-one-screen` 절차를 따른다.

## 선행조건
- 직전 Step COMPLETED.

## 참조파일
- `.claude/spec/04_gravit_admin_frontend_spec.md` §11-4, §10(상세동작), §12(해당 Step 프롬프트)
- 화면별: `.claude/spec/01`(§6-x), `.claude/spec/DS-02`, `.claude/spec/DS-03 §5-x`
- `.claude/skills/implement-one-screen/SKILL.md`, `.claude/rules/decisions.md`

## 절차
- 체크리스트의 화면 항목을 **하나씩** 구현(다중 화면 동시 금지). 화면마다 게이트→커밋→(Step 종료 시)패킷.
- 결정 D1~D4 해당 화면에 반영(특히 PROBLEM_DETAIL 주관식=D1 단일 객체).

## 출력
- 해당 §11-4 완료기준 충족(각 화면 4상태 + 상호작용 동작).

## 실패처리 / 다음 phase
- 자가수정 3회. → 다음 Step.
