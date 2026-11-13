# 남은 작업 (구 빌드 하네스에서 이관)

Claude 빌드 하네스의 `build-state.json`(삭제, 마지막 상태는 커밋 `d5dba74`)에 남아 있던 **미완료 항목과 사람 확인 항목**입니다. 하나씩 `write-plan` 으로 계획서를 만들어 진행하고, 끝나면 이 표에서 지웁니다.

> 이관 시점(2026-11-13)의 기록을 옮긴 것이며, 각 항목이 지금도 유효한지는 다시 확인하지 않았습니다. 계획서를 쓸 때 현재 코드로 먼저 확인합니다.

## 미완료 작업

| ID | 내용 | 근거 |
|---|---|---|
| `fix:H1-CN_FONT_SIZE` | `src/shared/lib/cn.ts`(twMerge)가 `text-caption`·`text-body` 를 지워 배지·사이드바 글자가 커짐. 고치면 기존 16화면과 QA 화면이 함께 바뀌고, QA 컴포넌트의 "크기 토큰을 cn 밖에 두는" 우회도 일반 `cn` 으로 되돌림 | `docs/conventions/decisions.md` D9-7 H1 |
| `fix:H2-MSW_BOOT_REISSUE` | 개발 모드 새 탭 첫 로드에서 MSW 가 켜지기 전에 로그인 로더의 토큰 재발급이 실서버로 나감 | D9-7 H2 |

## 의존성

| 내용 | 근거 |
|---|---|
| Vite 5 → 6 이상 업그레이드 후 Vitest 4.1.12 이상으로 올려 보안 권고(tinypool critical 2·@vitest/mocker moderate 1) 해소 | PLAN-20261113-codex-harness §11-1 |

## 명세 정리 (이전에는 명세가 읽기 전용이라 사람 몫이었음 — D14 로 계획서에서 처리 가능)

| 내용 | 근거 |
|---|---|
| `03 §7-12·§7-14·§8-2·§8-6` 의 주관식 `answers` 배열 표기를 단일 `answer` 객체로 정정 | D1·D2 |
| 대시보드 활성 유저 추이 API 2종(`/dashboard/active-users/daily`·`monthly`)을 `03 §4` 에 반영 | D7 |
| `decisions.md` 에만 있는 별도 서비스 계약(D8 Ravvit, D9·D11·D12 QA, D10 OAuth)을 명세 문서로 옮길지 결정 | `docs/spec/00_INDEX.md` §4 |

## 실서버·배포 후 사람 확인

| 내용 | 근거 |
|---|---|
| QA 실서버: 401 → 공유 재발급 → 1회 재시도, 403 종착, 503 은 재발급·로그아웃 없이 안내, 실제 응답의 nullable·enum, 오류 본문 `{error, message}` | D9-3, D11 |
| QA v2 실서버: 두 round 셀 분리, Job polling·WAITING 재수집, `REFLECTION_5021`·`REFLECTION_4091`, 수동 이력의 원래 AUTO 사유, 항목 수정 초기화 | D11 |
| QA 파트별 수정사항(G1·G2·G3) 실서버 동작과 옛 서버의 unknown-field 처리, TXT 본문 예시 대조 | D12 |
| 운영 배포에서 `/qa-api` rewrite 가 `Authorization: Bearer` 헤더를 전달하는지, 목록 200·등록 201/409 | D9-4 |
| `.env.example` 이 없음 — 필요하면 사람이 만들거나 훅 예외를 결정(현재 훅은 `.env*` 수정을 막음) | AGENTS.md 6장 |
