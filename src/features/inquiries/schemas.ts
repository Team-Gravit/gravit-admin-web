import { z } from 'zod';

export const inquiryTypeSchema = z.enum([
  'BUG_REPORT',
  'CONTENT_ERROR',
  'FEATURE_SUGGESTION',
  'OTHER',
]);

export const inquiryStatusSchema = z.enum(['PENDING', 'RESOLVED']);

export const inquiryListItemSchema = z.object({
  inquiryId: z.number(),
  title: z.string(),
  type: inquiryTypeSchema,
  status: inquiryStatusSchema,
  submitterId: z.number(),
  submitterNickname: z.string().nullable(),
  createdAt: z.string(),
});

/** ⚠️ 페이지네이션 래퍼: hasNext / contents / 1-base page (백오피스 공통, inquiry-handoff A-0). */
export const inquiryListResponseSchema = z.object({
  page: z.number(),
  totalPages: z.number(),
  hasNext: z.boolean(),
  contents: z.array(inquiryListItemSchema),
});

export const inquiryAnswerSchema = z.object({
  answerId: z.number(),
  content: z.string(),
  adminId: z.number(),
  answeredAt: z.string(),
  updatedAt: z.string(),
});

export const inquiryDetailSchema = z.object({
  inquiryId: z.number(),
  title: z.string(),
  type: inquiryTypeSchema,
  content: z.string(),
  status: inquiryStatusSchema,
  submitterId: z.number(),
  submitterNickname: z.string().nullable(),
  submitterEmail: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  answer: inquiryAnswerSchema.nullable(),
});

export const inquiryAnswerFormSchema = z.object({
  content: z.string().trim().min(1, '답변 내용을 입력해주세요.'),
});

export type InquiryListItem = z.infer<typeof inquiryListItemSchema>;
export type InquiryListResponse = z.infer<typeof inquiryListResponseSchema>;
export type InquiryAnswer = z.infer<typeof inquiryAnswerSchema>;
export type InquiryDetail = z.infer<typeof inquiryDetailSchema>;
export type InquiryAnswerFormValues = z.infer<typeof inquiryAnswerFormSchema>;
