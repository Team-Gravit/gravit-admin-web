import { z } from 'zod';

export const providerIdSchema = z.enum(['GOOGLE', 'KAKAO', 'NAVER']);

export const loginUrlResponseSchema = z.object({
  loginUrl: z.string().url(),
  state: z.string().min(1),
});
export type LoginUrlResponse = z.infer<typeof loginUrlResponseSchema>;

/** 웹 로그인은 accessToken + role을 반환하고 refreshToken은 HttpOnly 쿠키로 발급한다. */
export const oauthLoginResponseSchema = z.object({
  accessToken: z.string().min(1),
  isOnboarded: z.boolean().optional(),
  role: z.enum(['ADMIN', 'USER']),
});
export type OAuthLoginResponse = z.infer<typeof oauthLoginResponseSchema>;

export const adminMeResponseSchema = z.object({
  adminId: z.number(),
  nickname: z.string(),
  email: z.string(),
  profileImgNumber: z.number(),
});
