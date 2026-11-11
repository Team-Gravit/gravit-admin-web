import { Navigate, useLocation, useParams } from 'react-router';
import { useSprint } from '@/features/qa/queries';
import { screenForSprint, screenPath } from '@/features/qa/screens';
export function QaSprintIndexPage() {
  const id = Number(useParams().sprintId);
  const { search } = useLocation();
  const { data } = useSprint(id);
  return data ? (
    <Navigate replace to={{ pathname: screenPath(screenForSprint(data), id), search }} />
  ) : null;
}
