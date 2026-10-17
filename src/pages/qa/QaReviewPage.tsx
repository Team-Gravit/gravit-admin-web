import { useParams } from 'react-router';
import { useSprint } from '@/features/qa/queries';
import { ReviewPanel } from '@/features/qa/components/ReviewPanel';

/** QA_REVIEW (QA_SPEC B-3). 스프린트 로딩·오류는 레이아웃이 처리한다. */
export function QaReviewPage() {
  const { sprintId } = useParams();
  const { data: sprint } = useSprint(Number(sprintId));
  if (!sprint) return null;
  // 상태가 바뀌면(확정 등) 필터 기본값을 새로 잡도록 key 로 다시 마운트한다
  return <ReviewPanel key={sprint.status} sprint={sprint} />;
}
