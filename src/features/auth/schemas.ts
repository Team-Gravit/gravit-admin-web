import { z } from 'zod';

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

export const reissueResponseSchema = z.object({
  accessToken: z.string().min(1),
});

export const adminMeResponseSchema = z.object({
  adminId: z.number(),
  nickname: z.string(),
  email: z.string(),
  profileImgNumber: z.number(),
});
