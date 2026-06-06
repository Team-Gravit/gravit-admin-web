import { z } from 'zod';

/**
 * 인증 응답 스키마 (백엔드 기존 OAuth 재사용, BACKEND_ADMIN_API_SPEC §8).
 * 응답은 항상 Zod 파싱 후 사용.
 */

/** GET /oauth/login-url/{provider} → provider 인가 URL. */
export const loginUrlResponseSchema = z.object({
  loginUrl: z.string().min(1),
});

/**
 * POST /oauth/{provider} → 토큰 + role.
 * ⚠️ 백엔드가 LoginResponse 에 role 추가 필요(§8). role 로 USER 화면진입 차단.
 */
export const oauthLoginResponseSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  isOnboarded: z.boolean().optional(),
  role: z.enum(['ADMIN', 'USER']),
});
export type OAuthLoginResponse = z.infer<typeof oauthLoginResponseSchema>;

/** POST /auth/reissue → access 만(로테이션 없음, 기존 사용자앱과 동일). */
export const reissueResponseSchema = z.object({
  accessToken: z.string().min(1),
});
