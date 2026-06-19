import { z } from 'zod';

export const reportTypeSchema = z.enum([
  'TYPO_ERROR',
  'CONTENT_ERROR',
  'ANSWER_ERROR',
  'OTHER_ERROR',
]);

export const reportListItemSchema = z.object({
  reportId: z.number(),
  reportType: reportTypeSchema,
  problemId: z.number(),
  isResolved: z.boolean(),
  submittedAt: z.string(),
});

export const reportListResponseSchema = z.object({
  page: z.number(),
  totalPages: z.number(),
  hasNext: z.boolean(),
  contents: z.array(reportListItemSchema),
});

export type ReportListItem = z.infer<typeof reportListItemSchema>;
export type ReportListResponse = z.infer<typeof reportListResponseSchema>;

export const reportDetailSchema = z.object({
  reportId: z.number(),
  reportType: reportTypeSchema,
  problemId: z.number(),
  content: z.string(),
  isResolved: z.boolean(),
  submittedAt: z.string(),
});

export type ReportDetail = z.infer<typeof reportDetailSchema>;
