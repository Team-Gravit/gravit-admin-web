import type { ProviderId } from '@/features/auth/types';

/**
 * OAuth 미배선 신호 (가짜 idToken 생성 금지 — 03 §3-1 계약 보호).
 */
export class OAuthNotWiredError extends Error {
  constructor(public readonly provider: ProviderId) {
    super(`OAuth(${provider}) 연동이 아직 배선되지 않았습니다.`);
    this.name = 'OAuthNotWiredError';
  }
}

/**
 * OAuth idToken 취득 경계 (manual-review — 통합 단계 연동 지점).
 *
 * 03 §3-1 계약: provider SDK 팝업 → idToken(JWT) 반환 → POST /auth/login { providerId, idToken }.
 *   - Google: @react-oauth/google (idToken = credential)
 *   - Kakao/Naver: CDN SDK (04 §3-3)
 * 앱 키(VITE_GOOGLE_CLIENT_ID 등)·provider 콘솔 설정·CDN 스크립트(index.html)는 사람 위임.
 * 키·콘솔·백엔드 없이는 런타임 검증 불가하므로, 현재는 미배선으로 신호한다.
 * 연동 시 이 함수만 각 provider SDK 호출로 교체하면 LoginPage/OAuthButtons 변경 불필요.
 */
export function acquireOAuthIdToken(provider: ProviderId): Promise<string> {
  // dev: MSW 목으로 로컬 로그인 흐름 동작(가짜 idToken). 프로덕션은 미배선 경계 유지.
  if (import.meta.env.DEV) {
    return Promise.resolve(`mock-id-token-${provider}`);
  }
  return Promise.reject(new OAuthNotWiredError(provider));
}
