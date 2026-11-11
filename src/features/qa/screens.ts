import { ROUTES } from '@/shared/constants/routes';
import type { Sprint } from '@/features/qa/schemas';

export type SprintScreen = 'setup' | 'design' | 'first' | 'second';
export const SPRINT_SCREENS = [
  { key: 'setup', label: '연결 현황', to: ROUTES.QA_SPRINT_SETUP },
  { key: 'design', label: '디자인 검수', to: ROUTES.QA_SPRINT_DESIGN },
  { key: 'first', label: '1차 체크리스트', to: ROUTES.QA_SPRINT_CHECKLIST_FIRST },
  { key: 'second', label: '2차 체크리스트', to: ROUTES.QA_SPRINT_CHECKLIST_SECOND },
] as const;
export function screenForSprint(sprint: Sprint): SprintScreen {
  if (sprint.pendingReflectionCount > 0 || sprint.latestJob?.status === 'FAILED') return 'setup';
  if (sprint.status === 'DESIGN_REVIEW') return 'design';
  if (sprint.status === 'AUTO_REVIEW') return 'first';
  if (sprint.status === 'MANUAL_REVIEW' || sprint.status === 'CLOSED') return 'second';
  return 'setup';
}
export function screenPath(screen: SprintScreen, id: number) {
  return SPRINT_SCREENS.find((s) => s.key === screen)!.to(id);
}
