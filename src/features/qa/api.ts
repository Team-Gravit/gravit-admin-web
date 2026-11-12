import { z } from 'zod';
import { parseQaResponse, qaApiClient } from '@/shared/api/qaClient';
import {
  checkCellHistoryListSchema,
  checkCellSchema,
  checklistItemSchema,
  checklistSchema,
  designHistorySchema,
  designItemSchema,
  designReviewSchema,
  fixReportsSchema,
  jobSchema,
  reflectionSchema,
  reflectionsSchema,
  setupJobResponseSchema,
  sprintListResponseSchema,
  sprintSchema,
  verdictUpdateSchema,
  type CellState,
  type ChecklistItemFormValues,
  type DesignItemFormValues,
  type ManualCellState,
  type Part,
  type ProgressPart,
  type Round,
} from '@/features/qa/schemas';

/** D11 / SESSION_E1. No implicit filters, rounds, or legacy fields. */
export async function listSprints() {
  return parseQaResponse(sprintListResponseSchema, await qaApiClient.get('/sprints'));
}
export async function createSprint(notionPageUrl: string) {
  return parseQaResponse(sprintSchema, await qaApiClient.post('/sprints', { notionPageUrl }));
}
export async function getSprint(sprintId: number) {
  return parseQaResponse(sprintSchema, await qaApiClient.get(`/sprints/${sprintId}`));
}
export async function getFixReports(sprintId: number) {
  return parseQaResponse(
    fixReportsSchema,
    await qaApiClient.get(`/sprints/${sprintId}/fix-reports`),
  );
}
export async function getFixReportFile(sprintId: number, part: ProgressPart) {
  return parseQaResponse(
    z.instanceof(Blob),
    await qaApiClient.get(`/sprints/${sprintId}/fix-reports/${part}`, { responseType: 'blob' }),
  );
}
export async function startSetupJob(sprintId: number, version: number) {
  return parseQaResponse(
    setupJobResponseSchema,
    await qaApiClient.post(`/sprints/${sprintId}/setup-jobs`, { version }),
  );
}
export async function getJob(jobId: number) {
  return parseQaResponse(jobSchema, await qaApiClient.get(`/jobs/${jobId}`));
}
export async function cancelJob(jobId: number) {
  return parseQaResponse(jobSchema, await qaApiClient.post(`/jobs/${jobId}/cancel`));
}
export async function getReflections(sprintId: number) {
  return parseQaResponse(
    reflectionsSchema,
    await qaApiClient.get(`/sprints/${sprintId}/reflections`),
  );
}
export async function decideReflection(id: number, action: 'approve' | 'reject', version: number) {
  return parseQaResponse(
    reflectionSchema,
    await qaApiClient.post(`/reflections/${id}/${action}`, { version }),
  );
}
export async function getChecklist(sprintId: number, round: Round) {
  return parseQaResponse(
    checklistSchema,
    await qaApiClient.get(`/sprints/${sprintId}/checklist`, { params: { round } }),
  );
}
export async function getDesignReview(sprintId: number) {
  return parseQaResponse(
    designReviewSchema,
    await qaApiClient.get(`/sprints/${sprintId}/design-review`),
  );
}
export async function updateDesignItem(
  id: number,
  state: CellState,
  version: number,
  reason?: string,
) {
  return parseQaResponse(
    designItemSchema,
    await qaApiClient.put(
      `/design-review-items/${id}`,
      verdictUpdateSchema.parse({ state, version, ...(state === 'FAIL' ? { reason } : {}) }),
    ),
  );
}
export async function getDesignHistory(id: number) {
  return parseQaResponse(
    designHistorySchema,
    await qaApiClient.get(`/design-review-items/${id}/history`),
  );
}
export type DesignItemUpdateBody = Partial<DesignItemFormValues> & { version: number };
export async function editDesignItem(id: number, body: DesignItemUpdateBody) {
  return parseQaResponse(
    designItemSchema,
    await qaApiClient.patch(`/design-review-items/${id}`, body),
  );
}
export async function deleteDesignItem(id: number, version: number): Promise<void> {
  await qaApiClient.delete(`/design-review-items/${id}`, { params: { version } });
}
export type ChecklistItemCreateBody = Omit<ChecklistItemFormValues, 'classification'> & {
  featureId: number;
  classification: 'MANUAL';
};
export type ChecklistItemUpdateBody = Partial<Omit<ChecklistItemFormValues, 'classification'>> & {
  classification?: 'MANUAL';
  version: number;
};
export async function createChecklistItem(sprintId: number, body: ChecklistItemCreateBody) {
  return parseQaResponse(
    checklistItemSchema,
    await qaApiClient.post(`/sprints/${sprintId}/checklist-items`, {
      ...body,
      classification: 'MANUAL',
    }),
  );
}
export async function updateChecklistItem(id: number, body: ChecklistItemUpdateBody) {
  return parseQaResponse(
    checklistItemSchema,
    await qaApiClient.patch(`/checklist-items/${id}`, body),
  );
}
export async function deleteChecklistItem(id: number, version: number): Promise<void> {
  await qaApiClient.delete(`/checklist-items/${id}`, { params: { version } });
}
export async function updateCheckCell(
  itemId: number,
  part: Part,
  state: ManualCellState,
  version: number,
  reason?: string,
) {
  return parseQaResponse(
    checkCellSchema,
    await qaApiClient.put(
      `/checklist-items/${itemId}/cells/${part}`,
      verdictUpdateSchema.parse({ state, version, ...(state === 'FAIL' ? { reason } : {}) }),
    ),
  );
}
export async function listCheckCellHistory(itemId: number, part: Part) {
  return parseQaResponse(
    checkCellHistoryListSchema,
    await qaApiClient.get(`/checklist-items/${itemId}/cells/${part}/history`),
  );
}
export async function closeSprint(sprintId: number, version: number) {
  return parseQaResponse(
    sprintSchema,
    await qaApiClient.post(`/sprints/${sprintId}/close`, { version }),
  );
}
