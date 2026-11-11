import { useParams } from 'react-router';
import { useSprint } from '@/features/qa/queries';
import { ChecklistPanel } from '@/features/qa/components/ChecklistPanel';
import type { Round } from '@/features/qa/schemas';
export function QaChecklistPage({ round }: { round: Round }) {
  const { data } = useSprint(Number(useParams().sprintId));
  return data ? <ChecklistPanel key={`${data.id}:${round}`} sprint={data} round={round} /> : null;
}
