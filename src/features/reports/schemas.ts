import { z } from 'zod';

/** 신고 유형 (03 §5/§6-1). */
export const reportTypeSchema = z.enum([
  'TYPO_ERROR',
  'CONTENT_ERROR',
  'ANSWER_ERROR',
  'OTHER_ERROR',
]);

/** 신고 목록 아이템 (03 §6-1). reporter 정보 미포함(v1.1 확정). */
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
  hasNextPage: z.boolean(),
  content: z.array(reportListItemSchema),
});

export type ReportListItem = z.infer<typeof reportListItemSchema>;
export type ReportListResponse = z.infer<typeof reportListResponseSchema>;

/** 신고 상세 (03 §6-2). content 추가, reporter 미포함. */
export const reportDetailSchema = z.object({
  reportId: z.number(),
  reportType: reportTypeSchema,
  problemId: z.number(),
  content: z.string(),
  isResolved: z.boolean(),
  submittedAt: z.string(),
});

export type ReportDetail = z.infer<typeof reportDetailSchema>;
