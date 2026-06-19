import { apiClient } from '@/shared/api/client';
import {
  problemDetailSchema,
  type ProblemDetail,
  type ProblemOption,
} from '@/features/problems/schemas';

export async function getProblem(problemId: number): Promise<ProblemDetail> {
  const { data } = await apiClient.get(`/problems/${problemId}`);
  return problemDetailSchema.parse(data);
}

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
