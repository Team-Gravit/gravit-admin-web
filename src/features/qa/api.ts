import { qaApiClient } from '@/shared/api/qaClient';
import {
  sprintListResponseSchema,
  sprintSchema,
  type Sprint,
  type SprintStatus,
  type SprintSummary,
} from '@/features/qa/schemas';

/**
 * QA(gravit-qa) API (decisions D9-2, QA_SPEC A-2). 경로는 Base(`VITE_QA_API_BASE`) 뒤에 붙는다.
 * 응답은 전부 Zod 로 파싱한다. 페이지네이션 없음 — 배열 전체.
 */

/** #1 listSprints — 최신 생성순. status 생략 = 전체. */
export async function listSprints(status?: SprintStatus): Promise<SprintSummary[]> {
  const { data } = await qaApiClient.get('/sprints', { params: status ? { status } : undefined });
  return sprintListResponseSchema.parse(data);
}

/** #2 createSprint — Notion 스프린트 페이지로 등록. 201 = DRAFT 스프린트. */
export async function createSprint(notionPageUrl: string): Promise<Sprint> {
  const { data } = await qaApiClient.post('/sprints', { notionPageUrl });
  return sprintSchema.parse(data);
}
