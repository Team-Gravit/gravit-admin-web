import { useParams } from 'react-router';
import { useSprint } from '@/features/qa/queries';
import { SetupPanel } from '@/features/qa/components/SetupPanel';

/** QA_SETUP (QA_SPEC B-2). 스프린트 로딩·오류는 레이아웃이 처리한다. */
export function QaSetupPage() {
  const { sprintId } = useParams();
  const { data: sprint } = useSprint(Number(sprintId));
  if (!sprint) return null;
  return <SetupPanel sprint={sprint} />;
}
