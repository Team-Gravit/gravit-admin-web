import { Navigate, useParams } from 'react-router';
import { useSprint } from '@/features/qa/queries';
import { screenForStage, screenPath } from '@/features/qa/screens';

/** `/qa/sprints/:sprintId` 진입 → guide.stage 에 맞는 하위 화면으로 replace 이동 (QA_SPEC B-1). */
export function QaSprintIndexPage() {
  const { sprintId } = useParams();
  const id = Number(sprintId);
  const { data: sprint } = useSprint(id);

  // 로딩·오류 표시는 레이아웃(QaSprintLayout)이 맡는다.
  if (!sprint) return null;
  return <Navigate replace to={screenPath(screenForStage(sprint.guide.stage), id)} />;
}
