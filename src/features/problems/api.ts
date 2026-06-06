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
 * PATCH /problems/{id}/subjective 본문 (D1 단일 객체 모델, decisions.md 단일 권위).
 * 단일 `answer` 객체 { answerId, content(콤마 구분 단일 텍스트), explanation }. (03 §7-14 answers 배열 표기는 stale.)
 */
export interface UpdateSubjectiveBody {
  instruction: string;
  content: string;
  answer: { answerId: number; content: string; explanation: string };
}

export async function updateSubjectiveProblem(
  problemId: number,
  body: UpdateSubjectiveBody,
): Promise<void> {
  await apiClient.patch(`/problems/${problemId}/subjective`, body);
}
