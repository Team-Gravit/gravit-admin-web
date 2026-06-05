---
name: implement-one-screen
description: 한 화면(또는 STAGING_DETAIL 하위단계 1개)을 구현하는 표준 절차. build-orchestrator 가 화면 항목을 만났을 때 사용. SoT 읽기 → 스키마→API→훅→컴포넌트→페이지→라우트 → 4상태/상호작용 → 게이트 순서를 강제한다.
---

# 한 화면 구현 표준 절차

**한 번에 한 화면.** 다중 화면 동시 구현 금지. → [[antipatterns]]

## 1. SoT 먼저 읽기 (작성 전)
- 동작/검증/상태전이: `01 §6-x`(해당 화면)
- 엔드포인트/필드/응답: `03`(해당 리소스) — 명세에 없는 것은 만들지 않는다 → [[api-contract]]
- 프론트 상세 동작/의사코드: `04 §10`, 화면이 속한 Step 의 `§11-x`·`§12-x`
- 시각: `DS-01`(토큰·컴포넌트)·`DS-02 §N`(해당 화면)·`DS-03`(상호작용)·`DS-00`(개요). 특정 디테일이 없거나 모순일 때만 멈춰 질문(🙋🏻).
- 적용할 결정: [[decisions]] (D1 주관식 단일, D2 정답 개수 고정, D3 자기변경, D4 /admin/me)

## 2. 구현 순서 (features/{domain}/ 안에서)
1. `schemas.ts` — 응답/폼 Zod 스키마. `z.infer` 로 타입.
2. `api.ts` — 명세 그대로의 호출. 응답은 스키마로 parse.
3. `hooks.ts` — TanStack Query(queryKey 팩토리, invalidation). 폼은 RHF + zodResolver.
4. `components/` — shadcn/ui 기반, 토큰만. 
5. `pages/` 얇은 페이지 + 라우트 연결(`@/` alias). → [[architecture]]

## 3. 반드시 포함
- **4상태**: Empty / Loading(skeleton) / Error / Data.
- **상호작용**: confirm 모달(위험도별 variant), 토스트(message 우선), 검증(onBlur+제출 전체). → [[ui-conventions]] · [[good-patterns]]
- 편집/위험 화면: **이탈 보호**(beforeunload + useBlocker), 위험 액션 destructive.
- 비가역(promote 등)은 **코드 구조만**.

## 4. 마무리
- 토큰 위반/타입/빌드 없는지 게이트 실행: `bash .claude/hooks/checks/gate-runner.sh --full`. green → 항목 ID 로 커밋.
- 못 채운 명세/추측 필요 지점은 만들지 말고 패킷에 질문(🙋🏻)으로 남긴다.

참조: [[source-of-truth]] · [[api-contract]] · [[architecture]] · [[ui-conventions]] · [[good-patterns]] · [[decisions]]
