import { useParams } from 'react-router';
import { useSprint } from '@/features/qa/queries';
import { ChecklistPanel } from '@/features/qa/components/ChecklistPanel';

/** QA_CHECKLIST (QA_SPEC B-4). 스프린트 로딩·오류는 레이아웃이 처리한다. */
export function QaChecklistPage() {
  const { sprintId } = useParams();
  const { data: sprint } = useSprint(Number(sprintId));
  if (!sprint) return null;
  return <ChecklistPanel sprint={sprint} />;
}
