---
name: commit-push
description: 계획서 작업을 커밋하고 main 에 푸시한다. 커밋 타입은 feat·fix·docs·chore·test 다섯 가지만 쓰고, 본문에 계획서 경로를 적으며, 커밋과 푸시 전에 사용자 확인을 받는다. "커밋해줘", "푸시", "올려줘" 같은 요청에 쓴다. 브랜치 전략·리베이스·충돌 해결에는 쓰지 않는다.
---

# commit-push — 커밋과 main 푸시

GitHub 이슈·PR 없이 `main` 에 직접 커밋·푸시합니다.

## 커밋 규칙

| 타입 | 대상 |
|---|---|
| `feat` | 새 기능·동작 |
| `fix` | 버그 수정 |
| `docs` | 문서만 바뀜 |
| `chore` | 빌드·설정·의존성·도구·하네스 |
| `test` | 테스트 추가·수정 |

- 이 다섯 가지 외 타입(`refactor`·`style`·`perf`·`ci` 등)은 쓰지 않습니다. 어느 타입인지 애매하면 묻습니다.
- 제목: `<type>: <subject>` 또는 `<type>(<scope>): <subject>`. 간결한 구문, 마침표 없음, 저장소 관례대로 한국어.
- 본문: 계획서가 있으면 한 줄 `Plan: docs/plans/PLAN-{YYYYMMDD}-{slug}.md`. 그 밖의 본문은 사용자가 요청할 때만.
- 커밋 하나에 논리적 변경 하나. 타입이 섞이면(예 기능 + 무관한 설정) 나눠서 커밋하자고 제안합니다.

## 절차

1. **상태 확인** — `git status`, `git diff --stat`, `git diff`. 커밋할 변경이 없으면 멈추고 알립니다.
2. **검증** — `npm run check:full` 을 실행해 통과를 확인합니다. 계획서 "검증 결과"에 `npm run test`·`npm run test:e2e` 결과가 없거나 그 뒤로 코드가 바뀌었으면 다시 실행합니다.
3. **타입·메시지 결정** — diff 를 읽고 정합니다. 파일 이름만 보고 추측하지 않습니다.
4. **커밋 전 확인** — 다음을 보여 주고 **승인을 기다립니다.**
   ```
   스테이징 대상: <파일 목록>
   커밋 메시지: <type>: <subject>
   Plan: docs/plans/PLAN-….md
   ```
5. **스테이징·커밋** — 파일을 지정해 `git add <paths>`. `git add -A`·`git add .` 금지. `AGENTS.md` 7장의 git 밖 문서(`.env.development`, `QA_SPEC.md`, `RAVVIT_SPEC.md`, 루트 핸드오프 문서)는 넣지 않습니다.
6. **계획서 상태** — 커밋 전에 계획서 `상태` 를 `커밋됨` 으로 바꿔 같은 커밋에 넣습니다. 해시는 계획서에 적지 않습니다(`git log --grep "PLAN-…"` 으로 찾습니다).
7. **푸시 전 확인** — `git rev-parse --abbrev-ref HEAD`, `git remote -v`, `git log origin/main..HEAD --oneline` 을 보여 주고 **푸시 승인을 받습니다.**
8. **푸시** — `git push origin main`.

## 하지 않는 것

- 확인 없이 커밋·푸시.
- 강제 푸시(`--force`·`-f`·`+ref`), 이력 재작성, 이미 푸시한 커밋 amend (`guard-bash` 훅도 막습니다).
- 배포 명령 실행.

## 완료

`verification-before-completion` 을 따릅니다. `git log -1 --stat` 과 푸시 출력(또는 `git status` 의 `up to date with 'origin/main'`)을 근거로 보고합니다.
