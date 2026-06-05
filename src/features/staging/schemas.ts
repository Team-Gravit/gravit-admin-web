import { z } from 'zod';

/** 스테이징 라벨 상태 (03 §5, enums StagingStatus). */
export const stagingStatusSchema = z.enum(['PENDING', 'COMPLETED']);

/** 스테이징 라벨 목록 아이템 (03 §8-1). */
export const stagingLabelListItemSchema = z.object({
  label: z.string(),
  unitId: z.number(),
  description: z.string(),
  status: stagingStatusSchema,
  createdAt: z.string(),
});

export const stagingLabelListResponseSchema = z.object({
  page: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
  content: z.array(stagingLabelListItemSchema),
});

export type StagingLabelListItem = z.infer<typeof stagingLabelListItemSchema>;
export type StagingLabelListResponse = z.infer<typeof stagingLabelListResponseSchema>;
