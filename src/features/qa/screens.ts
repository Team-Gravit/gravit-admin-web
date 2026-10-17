import { ROUTES } from '@/shared/constants/routes';
import type { SprintStage } from '@/features/qa/schemas';

/** 스프린트 하위 화면 3개 (decisions D9-1). 탭 컴포넌트 없이 링크로 이동한다. */
export type SprintScreen = 'setup' | 'review' | 'checklist';

export const SPRINT_SCREENS: ReadonlyArray<{
  key: SprintScreen;
  label: string;
  to: (sprintId: number) => string;
}> = [
  { key: 'setup', label: '준비', to: ROUTES.QA_SPRINT_SETUP },
  { key: 'review', label: '분류 검토', to: ROUTES.QA_SPRINT_REVIEW },
  { key: 'checklist', label: '체크리스트', to: ROUTES.QA_SPRINT_CHECKLIST },
];

/** `/qa/sprints/:sprintId` 진입 시 단계에 맞는 하위 화면 (QA_SPEC B-1). */
export function screenForStage(stage: SprintStage): SprintScreen {
  if (stage === 'PREPARE') return 'setup';
  if (stage === 'REVIEW') return 'review';
  return 'checklist';
}

export function screenPath(screen: SprintScreen, sprintId: number): string {
  const found = SPRINT_SCREENS.find((s) => s.key === screen);
  return found ? found.to(sprintId) : ROUTES.QA_SPRINT(sprintId);
}

/** 배너의 [체크리스트 확정](다른 하위 화면에서)이 분류 검토 화면의 확정 모달을 열도록 넘기는 라우터 state (F-1). */
export const OPEN_CONFIRM_STATE = { openConfirm: true } as const;
