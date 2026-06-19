import { z } from 'zod';

/** 문의 유형 (inquiry-handoff A-1). */
export const inquiryTypeSchema = z.enum([
  'BUG_REPORT',
  'CONTENT_ERROR',
  'FEATURE_SUGGESTION',
  'OTHER',
]);

/** 문의 처리상태 (inquiry-handoff A-1). 값 2개뿐. */
export const inquiryStatusSchema = z.enum(['PENDING', 'RESOLVED']);

/** 문의 목록 아이템 (inquiry-handoff A-2-1). 작성자 닉네임은 탈퇴 시 null. */
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

/** 답변 객체 (inquiry-handoff A-2-2). 답변 없으면 상세의 answer = null. */
export const inquiryAnswerSchema = z.object({
  answerId: z.number(),
  content: z.string(),
  adminId: z.number(),
  answeredAt: z.string(),
  updatedAt: z.string(),
});

/** 문의 상세 (inquiry-handoff A-2-2). 작성자 닉네임/이메일은 탈퇴 시 null. */
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

/** 답변 등록/수정 폼 (inquiry-handoff A-2-4). 백엔드 @NotBlank 만 — 빈/공백 거부, 상한 없음. */
export const inquiryAnswerFormSchema = z.object({
  content: z.string().trim().min(1, '답변 내용을 입력해주세요.'),
});

export type InquiryListItem = z.infer<typeof inquiryListItemSchema>;
export type InquiryListResponse = z.infer<typeof inquiryListResponseSchema>;
export type InquiryAnswer = z.infer<typeof inquiryAnswerSchema>;
export type InquiryDetail = z.infer<typeof inquiryDetailSchema>;
export type InquiryAnswerFormValues = z.infer<typeof inquiryAnswerFormSchema>;
