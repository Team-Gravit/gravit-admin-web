# 규칙 — 권장 패턴 (이렇게 할 것)

> 근거: `04 §6,§7,§9,§10`. 상세 의사코드는 거기서 Read. 안티패턴은 [antipatterns](antipatterns.md).

## 데이터·타입
- 응답마다 Zod 스키마 정의 → `z.infer` 타입 사용(수기 타입 중복 금지). 위치 `features/{domain}/schemas.ts`.
- TanStack Query: 도메인별 **queryKey 팩토리**, 변경 후 관련 키 invalidation, **window focus refetch 비활성**.

## 인증·에러
- axios 인스턴스 2개(`apiClient`/`authApiClient`). 401 → **reissue 단일비행 큐**로 토큰 갱신 후 원요청 retry, refresh 만료면 `/login`.
- 에러 → 토스트 우선순위: ① 응답 `message` → ② HTTP 상태별 기본 메시지 → ③ 네트워크 메시지. (401 은 토스트 없이 인터셉터가 처리)

## 폼·검증
- React Hook Form + `zodResolver`. 트리거: onChange 검증 안 함, onBlur 단일 필드, **제출 시 전체 검증**(실패 토스트).
- 글자 수 제한 등은 `shared/constants/fieldLimits.ts`.

## 이탈 보호 (편집·dirty 화면)
- `beforeunload`(브라우저 닫기/새로고침) + `useBlocker`(라우터 내부 이동) 이중 보호. `shared/hooks/useUnsavedChangesGuard.ts`.

## STAGING_DETAIL (04 §10, 9 하위단계)
- **항목별 독립 form 인스턴스** + 비활성 항목은 hidden(미저장 상태 보존). dirty = `formState.isDirty`, 변경 필드 좌측 Primary border, 좌측 리스트 ●.
- 저장: 변경된 필드만 다중 PATCH + `Promise.allSettled` → 전체/부분/전체실패 분류 토스트. 성공 PATCH 는 baseline 갱신, 실패는 입력값·표시 유지.
- 객관식 정답 변경 시 **이전 정답 옵션도 PATCH 대상에 포함**.
- promote: Strict-Match 모달(라벨명 정확 일치) → **비가역이므로 코드 구조만**, 실제 실행은 사람. (AGENTS.md 불변 제약)

## 흐름
- 변경 하나 = 계획서 하나. 계획(`write-plan`, 사용자 승인) → 구현(`implement`, `npm run check`) → 테스트(`write-test`·`verify-ui`) → 커밋·푸시(`commit-push`, 푸시 전 사용자 확인). → `AGENTS.md` 2장

관련: [architecture](architecture.md) · [api-contract](api-contract.md) · [ui-conventions](ui-conventions.md) · [decisions](decisions.md)
