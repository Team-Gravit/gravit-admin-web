import { z } from 'zod';
import { NOTICE_COPY } from '@/features/qa/copy';

/** D11 / SESSION_E1 + P1~P10. Nullable keys are present in the JSON contract. */
export const sprintStatusSchema = z.enum([
  'DRAFT',
  'SPEC_LOAD',
  'CHECKLIST',
  'DESIGN_REVIEW',
  'AUTO_REVIEW',
  'MANUAL_REVIEW',
  'CLOSED',
]);
export const partSchema = z.enum(['SERVER', 'WEB', 'APP']);
export const progressPartSchema = z.enum(['DESIGN', 'WEB', 'APP', 'SERVER']);
export const cellStateSchema = z.enum(['UNCHECKED', 'PASS', 'FAIL', 'NOT_APPLICABLE']);
export const manualCellStateSchema = cellStateSchema.exclude(['NOT_APPLICABLE']);
export const evidenceSchema = z.object({
  path: z.string(),
  startLine: z.number().int(),
  endLine: z.number().int(),
});
const cellEvidenceSchema = z.array(evidenceSchema).optional().default([]);
export const cellSourceSchema = z.enum(['MANUAL', 'AUTO']);
export const classificationSchema = z.enum(['AUTO', 'MANUAL']);
export const jobStatusSchema = z.enum(['QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELLED']);
export const stepStatusSchema = z.enum(['PENDING', 'RUNNING', 'DONE', 'FAILED', 'SKIPPED']);
export const jobStepSchema = z.object({
  seq: z.number(),
  name: z.string(),
  status: stepStatusSchema,
  message: z.string().nullable(),
  startedAt: z.string().nullable(),
  finishedAt: z.string().nullable(),
});
/** JobResponse is unchanged (P1). */
export const jobSchema = z.object({
  id: z.number(),
  type: z.enum(['SPEC_LOAD', 'QA_PREPARE']),
  sprintId: z.number().nullable(),
  status: jobStatusSchema,
  attempt: z.number(),
  maxAttempts: z.number(),
  nextRunAt: z.string().nullable(),
  cancelRequested: z.boolean(),
  lastError: z.string().nullable(),
  steps: z.array(jobStepSchema),
  createdAt: z.string(),
  finishedAt: z.string().nullable(),
});
export const connectionSchema = z.object({
  target: z.enum(['NOTION', 'FIGMA', 'SERVER', 'WEB', 'APP']),
  connected: z.boolean(),
  ref: z.string().nullable(),
  message: z.string().nullable(),
});
export const partProgressSchema = z.object({
  part: progressPartSchema,
  total: z.number().nonnegative(),
  checked: z.number().nonnegative(),
  pass: z.number().nonnegative(),
  fail: z.number().nonnegative(),
});
export const setupStepKeySchema = z.enum([
  'CONNECT',
  'SPEC_COLLECT',
  'CHECKLIST_GENERATE',
  'DESIGN_REVIEW',
  'AUTO_REVIEW',
]);
export const setupStepStatusSchema = z.enum(['PENDING', 'RUNNING', 'DONE', 'FAILED', 'WAITING']);
export const setupStepSchema = z.object({
  key: setupStepKeySchema,
  status: setupStepStatusSchema,
  attempt: z.number(),
  message: z.string().nullable(),
});
export const sprintSummarySchema = z.object({
  id: z.number(),
  sprintKey: z.string(),
  summary: z.string().nullable(),
  status: sprintStatusSchema,
});
export const sprintListResponseSchema = z.array(sprintSummarySchema);
export const sprintSchema = sprintSummarySchema.extend({
  version: z.number(),
  connections: z.array(connectionSchema),
  progress: z.array(partProgressSchema),
  setupSteps: z.array(setupStepSchema),
  latestJob: jobSchema.nullable(),
  pendingReflectionCount: z.number(),
});
export const setupJobResponseSchema = z.object({ jobId: z.number() });
export const reflectionStateSchema = z.enum([
  'PENDING',
  'APPROVED',
  'REJECTED',
  'APPLIED',
  'FAILED',
]);
export const reflectionSchema = z.object({
  id: z.number(),
  featureId: z.number(),
  screenId: z.string(),
  screenName: z.string(),
  historyRows: z.array(z.object({ sprint: z.string(), change: z.string() })),
  before: z.string(),
  after: z.string(),
  state: reflectionStateSchema,
  message: z.string().nullable(),
  version: z.number(),
});
export const reflectionsSchema = z.array(reflectionSchema);
export const checkCellSchema = z.object({
  part: partSchema,
  state: cellStateSchema,
  source: cellSourceSchema,
  reason: z.string().nullable(),
  evidence: cellEvidenceSchema,
  editable: z.boolean(),
  version: z.number(),
});
export const checkCellHistorySchema = z.object({
  fromState: cellStateSchema,
  toState: cellStateSchema,
  source: cellSourceSchema,
  changedBy: z.number().nullable(),
  changedAt: z.string(),
  reason: z.string().nullable(),
  evidence: cellEvidenceSchema,
});
export const checkCellHistoryListSchema = z.array(checkCellHistorySchema);
export const checklistItemSchema = z.object({
  id: z.number(),
  featureId: z.number(),
  title: z.string(),
  expected: z.string(),
  parts: z.array(partSchema),
  classification: classificationSchema,
  origin: z.enum(['LLM', 'HUMAN']),
  cells: z.array(checkCellSchema),
  version: z.number(),
});
const featureFields = {
  featureId: z.number(),
  screenId: z.string(),
  screenName: z.string(),
  changed: z.boolean(),
  completionRate: z.number().int().min(0).max(100),
};
export const checklistFeatureSchema = z.object({
  ...featureFields,
  items: z.array(checklistItemSchema),
});
export const checklistSchema = z.object({
  sprintId: z.number(),
  sprintStatus: sprintStatusSchema,
  features: z.array(checklistFeatureSchema),
});
export const designItemSchema = z.object({
  id: z.number(),
  featureId: z.number(),
  platform: z.enum(['WEB', 'APP']),
  title: z.string(),
  expected: z.string(),
  specRowIds: z.array(z.string()),
  state: cellStateSchema,
  source: cellSourceSchema,
  reason: z.string().nullable(),
  editable: z.boolean(),
  version: z.number(),
});
export const designReviewSchema = z.object({
  sprintId: z.number(),
  sprintStatus: sprintStatusSchema,
  features: z.array(z.object({ ...featureFields, items: z.array(designItemSchema) })),
});
export const designHistorySchema = z.array(
  z.object({
    state: cellStateSchema,
    source: cellSourceSchema,
    reason: z.string().nullable(),
    updatedBy: z.number().nullable(),
    updatedAt: z.string(),
  }),
);
export const sprintCreateFormSchema = z.object({
  notionPageUrl: z
    .string()
    .trim()
    .min(1, NOTICE_COPY.VALIDATION_URL_REQUIRED)
    .url(NOTICE_COPY.VALIDATION_URL_FORMAT),
});
export const checklistItemFormSchema = z.object({
  title: z.string().trim().min(1, NOTICE_COPY.VALIDATION_TITLE),
  expected: z.string().trim().min(1, NOTICE_COPY.VALIDATION_EXPECTED),
  parts: z.array(partSchema).min(1, NOTICE_COPY.VALIDATION_PARTS),
  classification: classificationSchema,
});
export const designItemFormSchema = checklistItemFormSchema.pick({ title: true, expected: true });
export type SprintStatus = z.infer<typeof sprintStatusSchema>;
export type Part = z.infer<typeof partSchema>;
export type ProgressPart = z.infer<typeof progressPartSchema>;
export type PartProgress = z.infer<typeof partProgressSchema>;
export type CellState = z.infer<typeof cellStateSchema>;
export type ManualCellState = z.infer<typeof manualCellStateSchema>;
export type CellSource = z.infer<typeof cellSourceSchema>;
export type Classification = z.infer<typeof classificationSchema>;
export type JobStatus = z.infer<typeof jobStatusSchema>;
export type Job = z.infer<typeof jobSchema>;
export type Sprint = z.infer<typeof sprintSchema>;
export type SprintSummary = z.infer<typeof sprintSummarySchema>;
export type Connection = z.infer<typeof connectionSchema>;
export type SetupStep = z.infer<typeof setupStepSchema>;
export type SetupStepKey = z.infer<typeof setupStepKeySchema>;
export type Reflection = z.infer<typeof reflectionSchema>;
export type CheckCell = z.infer<typeof checkCellSchema>;
export type CheckCellHistory = z.infer<typeof checkCellHistorySchema>;
export type ChecklistItem = z.infer<typeof checklistItemSchema>;
export type ChecklistFeature = z.infer<typeof checklistFeatureSchema>;
export type Checklist = z.infer<typeof checklistSchema>;
export type DesignItem = z.infer<typeof designItemSchema>;
export type DesignReview = z.infer<typeof designReviewSchema>;
export type DesignHistory = z.infer<typeof designHistorySchema>;
export type SprintCreateFormValues = z.infer<typeof sprintCreateFormSchema>;
export type ChecklistItemFormValues = z.infer<typeof checklistItemFormSchema>;
export type DesignItemFormValues = z.infer<typeof designItemFormSchema>;
export type Round = 1 | 2;
