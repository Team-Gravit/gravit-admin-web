import { parseQaResponse, qaApiClient } from '@/shared/api/qaClient';
import {
  checklistConfirmResponseSchema,
  checklistItemSchema,
  checklistSchema,
  jobSchema,
  sprintListResponseSchema,
  sprintSchema,
  type Checklist,
  type ChecklistConfirmResponse,
  type ChecklistItem,
  type Classification,
  type Job,
  type Part,
  type Sprint,
  type SprintStatus,
  type SprintSummary,
} from '@/features/qa/schemas';

/**
 * QA(gravit-qa) API (decisions D9-2, QA_SPEC A-2). 경로는 Base(`VITE_QA_API_BASE`) 뒤에 붙는다.
 * 응답은 전부 Zod 로 파싱한다(실패 = F-5 DEFAULT). 페이지네이션 없음 — 배열 전체.
 */

/** #1 listSprints — 최신 생성순. status 생략 = 전체. */
export async function listSprints(status?: SprintStatus): Promise<SprintSummary[]> {
  const res = await qaApiClient.get('/sprints', { params: status ? { status } : undefined });
  return parseQaResponse(sprintListResponseSchema, res);
}

/** #2 createSprint — Notion 스프린트 페이지로 등록. 201 = DRAFT 스프린트. */
export async function createSprint(notionPageUrl: string): Promise<Sprint> {
  const res = await qaApiClient.post('/sprints', { notionPageUrl });
  return parseQaResponse(sprintSchema, res);
}

/** #3 getSprint — 스프린트 상세(기준점 포함). */
export async function getSprint(sprintId: number): Promise<Sprint> {
  const res = await qaApiClient.get(`/sprints/${sprintId}`);
  return parseQaResponse(sprintSchema, res);
}

/** #5 startSetupJob — QA 준비하기. 202 + Job(비동기, polling 으로 추적). */
export async function startSetupJob(sprintId: number): Promise<Job> {
  const res = await qaApiClient.post(`/sprints/${sprintId}/setup-jobs`);
  return parseQaResponse(jobSchema, res);
}

/** #6 getJob — 작업 상태(polling). */
export async function getJob(jobId: number): Promise<Job> {
  const res = await qaApiClient.get(`/jobs/${jobId}`);
  return parseQaResponse(jobSchema, res);
}

/** #7 cancelJob — 202. RUNNING 이면 진행 중인 단계 경계에서 멈춘다. */
export async function cancelJob(jobId: number): Promise<Job> {
  const res = await qaApiClient.post(`/jobs/${jobId}/cancel`);
  return parseQaResponse(jobSchema, res);
}

/** #8 getChecklist — 기능별 항목 전체(페이지네이션 없음). */
export async function getChecklist(sprintId: number): Promise<Checklist> {
  const res = await qaApiClient.get(`/sprints/${sprintId}/checklist`);
  return parseQaResponse(checklistSchema, res);
}

/** #9 body */
export interface ChecklistItemCreateBody {
  featureId: number;
  title: string;
  expected: string;
  parts: Part[];
  classification: Classification;
  testRef?: string | null;
  personaKey?: string | null;
}

/** #9 createChecklistItem — 201. 직접 추가한 항목은 HUMAN·CONFIRMED 로 들어온다. */
export async function createChecklistItem(
  sprintId: number,
  body: ChecklistItemCreateBody,
): Promise<ChecklistItem> {
  const res = await qaApiClient.post(`/sprints/${sprintId}/checklist-items`, body);
  return parseQaResponse(checklistItemSchema, res);
}

/** #10 body — 바꿀 필드만 + version 필수. reviewState 는 CONFIRMED·REJECTED 만. */
export interface ChecklistItemUpdateBody {
  title?: string;
  expected?: string;
  parts?: Part[];
  classification?: Classification;
  testRef?: string | null;
  personaKey?: string | null;
  reviewState?: 'CONFIRMED' | 'REJECTED';
  version: number;
}

/** #10 updateChecklistItem */
export async function updateChecklistItem(
  itemId: number,
  body: ChecklistItemUpdateBody,
): Promise<ChecklistItem> {
  const res = await qaApiClient.patch(`/checklist-items/${itemId}`, body);
  return parseQaResponse(checklistItemSchema, res);
}

/** #11 confirmChecklist — startAutoRun 생략 시 서버 기본 true. version = 스프린트 version. */
export async function confirmChecklist(
  sprintId: number,
  body: { startAutoRun?: boolean; version: number },
): Promise<ChecklistConfirmResponse> {
  const res = await qaApiClient.post(`/sprints/${sprintId}/checklist/confirm`, body);
  return parseQaResponse(checklistConfirmResponseSchema, res);
}
