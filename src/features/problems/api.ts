import { apiClient } from '@/shared/api/client';
import {
  problemDetailSchema,
  type ProblemDetail,
  type ProblemOption,
} from '@/features/problems/schemas';

/** GET /problems/{problemId} — 문제 상세 (03 §7-12). problemType 분기(객관식 options / 주관식 answers). */
export async function getProblem(problemId: number): Promise<ProblemDetail> {
  const { data } = await apiClient.get(`/problems/${problemId}`);
  return problemDetailSchema.parse(data);
}

/** PATCH /problems/{id}/objective 본문 (03 §7-13). options 전체 교체(4개 고정, isAnswer 1개). */
export interface UpdateObjectiveBody {
  instruction: string;
  content: string;
  options: ProblemOption[];
}

export async function updateObjectiveProblem(
  problemId: number,
  body: UpdateObjectiveBody,
): Promise<void> {
  await apiClient.patch(`/problems/${problemId}/objective`, body);
}

/**
 * PATCH /problems/{id}/subjective 본문 (03 §7-14, D1 B-single-comma).
 * answers 전체 교체하되 개수 고정(D2) — 단일 정답 객체 1개 유지. 개수 불일치 시 백엔드 400 SUBJECTIVE_ANSWER_COUNT_FIXED.
 */
export interface UpdateSubjectiveBody {
  instruction: string;
  content: string;
  answers: Array<{ answerId: number; content: string; explanation: string }>;
}

export async function updateSubjectiveProblem(
  problemId: number,
  body: UpdateSubjectiveBody,
): Promise<void> {
  await apiClient.patch(`/problems/${problemId}/subjective`, body);
}
