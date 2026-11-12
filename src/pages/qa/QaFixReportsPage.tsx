import { useParams } from 'react-router';
import { useSprint } from '@/features/qa/queries';
import { FixReportsPanel } from '@/features/qa/components/FixReportsPanel';

export function QaFixReportsPage() {
  const id = Number(useParams().sprintId);
  const { data } = useSprint(id);
  return data ? <FixReportsPanel sprint={data} /> : null;
}
