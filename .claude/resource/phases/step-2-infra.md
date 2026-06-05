# Step 2 — 공통 인프라

## 목적
토큰관리·axios 인터셉터·reissue 큐·에러핸들러·인증 store/API·ProtectedRoute·레이아웃·공용 UI·유틸·상수·이탈보호 훅.

## 선행조건
- step-1 COMPLETED.

## 참조파일
- `.claude/spec/04...` §11-3(작업범위), §6(API client), §7(인증), §9(횡단정책)
- `.claude/spec/01...` §4(레이아웃)
- `.claude/rules/api-contract.md`, `architecture.md`

## 절차
- §11-3 체크리스트 수행. `GET /admin/me` 는 미구현 엔드포인트이므로 **manual-review(D4)** — 사이드바 표시는 가용 정보로 처리하고 패킷에 명시.

## 출력
- 로그인→대시보드(빈) 이동, 사이드바/헤더/breadcrumb 표시, 401→reissue→retry, refresh 만료→/login.

## 실패처리 / 다음 phase
- 동일(자가수정 3회). → `step-3-*` 화면들(implement-one-screen 절차).
