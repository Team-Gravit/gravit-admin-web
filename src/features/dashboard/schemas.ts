import { z } from 'zod';

/** GET /dashboard/summary 응답 (03 §4-1). */
export const dashboardSummarySchema = z.object({
  totalUsers: z.number(),
  pendingLabelsCount: z.number(),
  unresolvedReportsCount: z.number(),
});

export type DashboardSummary = z.infer<typeof dashboardSummarySchema>;
