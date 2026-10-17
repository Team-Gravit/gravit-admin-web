import { parseQaResponse, qaApiClient } from '@/shared/api/qaClient';
import {
  jobSchema,
  sprintListResponseSchema,
  sprintSchema,
  type Job,
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
