import { z } from 'zod';

/** 로그인/재발급 응답 = 토큰 쌍 (03 §3-1, §3-2). 응답은 항상 Zod 파싱 후 사용. */
export const tokenPairSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});

export type TokenPairResponse = z.infer<typeof tokenPairSchema>;
