import { z } from 'zod';

export const dashboardSummarySchema = z.object({
  totalUsers: z.number(),
  pendingLabelsCount: z.number(),
  unresolvedReportsCount: z.number(),
});

export type DashboardSummary = z.infer<typeof dashboardSummarySchema>;
