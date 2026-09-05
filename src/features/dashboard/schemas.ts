import { z } from 'zod';

export const dashboardSummarySchema = z.object({
  totalUsers: z.number(),
  pendingLabelsCount: z.number(),
  unresolvedReportsCount: z.number(),
});

export type DashboardSummary = z.infer<typeof dashboardSummarySchema>;

// 활성 유저 추이 (decisions D7 — 배열은 오래된→최신 순, 요청 기간만큼 항상 연속·완전)
export const dailyActiveUsersSchema = z.object({
  points: z.array(
    z.object({
      date: z.string(), // yyyy-MM-dd
      dau: z.number().int().nonnegative(),
    }),
  ),
});

export type DailyActiveUsers = z.infer<typeof dailyActiveUsersSchema>;

export const monthlyActiveUsersSchema = z.object({
  points: z.array(
    z.object({
      month: z.string(), // yyyy-MM (달력 월 기준)
      mau: z.number().int().nonnegative(),
      inProgress: z.boolean(), // 마지막 항목(이번 달)만 true = 부분 집계
    }),
  ),
});

export type MonthlyActiveUsers = z.infer<typeof monthlyActiveUsersSchema>;
export type MonthlyActiveUsersPoint = MonthlyActiveUsers['points'][number];
