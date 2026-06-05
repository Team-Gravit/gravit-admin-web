# Step 1 — 프로젝트 셋업

## 목적
Vite+React+TS 스캐폴드, 디자인 토큰 매핑, shadcn/ui, 라이브러리, alias, env, 폴더, 빈 라우터.

## 선행조건
- phase-0 통과. `spec/` 5문서 존재.

## 참조파일
- `.claude/spec/04_gravit_admin_frontend_spec.md` §11-2(작업범위), §3(스택), §4(구조), §5(env)
- `.claude/spec/DS-01_design_system.md` §1~4(토큰)
- `.claude/rules/architecture.md`, `.claude/rules/ui-conventions.md`

## 절차
- §11-2 체크리스트를 그대로 수행. 빈 페이지는 `<div>{화면ID}</div>` placeholder.
- 토큰은 `globals.css`(CSS 변수)+`tailwind.config.ts` 에만 정의(token-lint allow 대상).

## 출력
- 16개 라우트가 404 없이 매칭. `npm run dev` 1280px+ 동작. `npm run build` 성공.

## 실패처리
- 게이트 red → 자가수정(한도 3) → 초과 시 manual-review + 보고.

## 다음 phase
- `step-2-infra.md`.
