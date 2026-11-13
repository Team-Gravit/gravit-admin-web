---
name: write-plan
description: 기능 추가·화면 수정·API 연동 변경·버그 수정처럼 src/ 동작을 바꾸는 요청의 첫 단계. 관련 명세와 규칙을 읽고 docs/plans/PLAN-{YYYYMMDD}-{slug}.md 계획서를 쓴 뒤 사용자 승인을 받는다. 코드는 고치지 않는다.
---

# write-plan — 계획서 작성과 승인 관문

요청 하나를 계획서 하나로 바꿉니다. **이 스킬에서는 `src/`·`tests/`·명세를 수정하지 않습니다.** 계획서는 사람이 검토하는 관문이며, 승인 전에는 `implement` 로 넘어가지 않습니다.

## 절차

1. **요청 확인** — 무엇을, 왜 바꾸는지 한 문장으로 정리합니다. 범위·동작이 모호하면 계획서를 쓰기 전에 묻습니다(🙋🏻).
2. **필수 읽기** — `AGENTS.md` 4장 "문서 지도"에서 바꿀 경로에 해당하는 행의 문서를 모두 읽습니다. 항상 읽는 것:
   - `docs/spec/00_INDEX.md`(문서별 권위·충돌 우선순위)
   - `docs/conventions/decisions.md` 에서 관련 D 항목
   - `docs/conventions/antipatterns.md`
3. **코드 조사** — 바뀔 feature 의 `schemas.ts`·`api.ts`·hooks·components, 연결된 `src/pages/`·라우터, `src/mocks/` 핸들러, 기존 `*.test.ts(x)`·`tests/e2e/` 를 읽습니다. 재사용할 공용 컴포넌트(`src/shared/`)를 먼저 찾습니다.
4. **화면 디자인 입력(선택)** — 화면이 바뀌면 Figma URL 이 있는지 한 번 묻습니다. 없으면 DS-02 → DS-03 → DS-01 토큰 + 기존 화면 관례로 정합니다(`ui-conventions.md` "Figma 사용 정책").
5. **계획서 작성** — [assets/plan-template.md](assets/plan-template.md) 를 복사해 `docs/plans/PLAN-{YYYYMMDD}-{slug}.md` 로 만듭니다.
   - 날짜는 작성일(`date +%Y%m%d`), slug 는 영어 소문자·하이픈 2~5단어(예 `qa-fail-reason-edit`).
   - 모든 절을 채웁니다. 해당 없으면 "없음 — 이유"를 적고 절을 지우지 않습니다.
   - 명세에 없는 엔드포인트·필드가 필요하면 지어내지 말고 "결정 필요"에 올립니다.
   - 기능이 바뀌면 함께 고칠 명세 파일과 절(`docs/spec/…` · `docs/conventions/decisions.md` 새 D 항목)을 "고칠 명세" 절에 적습니다.
6. **자기 점검** — 아래 체크리스트를 계획서 맨 끝에 붙이고 모두 확인합니다.
   - [ ] 명세에 없는 엔드포인트·필드·쿼리 없음
   - [ ] 상태 4종(로딩·빈·오류·정상) 각각 화면 동작이 적혀 있음
   - [ ] 문구가 기존 문구 체계(예 QA `copy.ts`)와 맞음
   - [ ] `features` 간 직접 import 없이 구현 가능
   - [ ] 테스트 계획에 단위·e2e 와 목 핸들러 변경이 있음
   - [ ] 확인할 화면 목록(경로·목 데이터 조건)이 있음
7. **승인 요청 후 멈춤** — 계획서 경로, 요약 표(바뀌는 화면·API 영향·고칠 명세·결정 필요), 질문을 보여 주고 **멈춥니다.** 사용자가 승인하면 계획서 `상태` 를 `승인 (YYYY-MM-DD)` 로 바꾸고 `implement` 로 넘어갑니다. 수정 요청이면 계획서를 고쳐 다시 승인을 받습니다.

## 참고

- React 구현 방식을 정할 때 `vercel-react-best-practices` 를 참고하되 `AGENTS.md` 5장의 "해당 없음" 규칙은 뺍니다.
- 완료 직전 `verification-before-completion`: 계획서 파일이 실제로 생겼는지, 템플릿 절이 모두 채워졌는지 파일을 다시 열어 확인한 뒤 보고합니다.
