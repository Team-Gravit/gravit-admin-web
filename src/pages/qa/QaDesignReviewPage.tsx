import { useParams } from 'react-router';
import { useSprint } from '@/features/qa/queries';
import { DesignReviewPanel } from '@/features/qa/components/DesignReviewPanel';
export function QaDesignReviewPage() {
  const { data } = useSprint(Number(useParams().sprintId));
  return data ? <DesignReviewPanel key={data.id} sprint={data} /> : null;
}
