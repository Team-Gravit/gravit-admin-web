import { NavLink, useLocation } from 'react-router';
import { StageStepper } from '@/features/qa/components/StageStepper';
import { SprintStatusBadge } from '@/features/qa/components/SprintStatusBadge';
import { SPRINT_SCREENS } from '@/features/qa/screens';
import type { Sprint } from '@/features/qa/schemas';

export function SprintHeader({ sprint }: { sprint: Sprint }) {
  const { search } = useLocation();
  return (
    <header className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-h1 text-foreground">{sprint.sprintKey}</h1>
          <p className="text-body text-fg-muted">{sprint.summary || '-'}</p>
        </div>
        <SprintStatusBadge status={sprint.status} />
      </div>
      <StageStepper sprint={sprint} />
      <nav aria-label="QA 탭" className="flex gap-6 border-b border-border">
        {SPRINT_SCREENS.map((screen) => (
          <NavLink
            key={screen.key}
            to={{ pathname: screen.to(sprint.id), search }}
            className={({ isActive }) =>
              `-mb-px border-b-2 px-1 pb-2.5 text-body transition-colors ${isActive ? 'border-primary font-medium text-primary' : 'border-transparent text-fg-secondary hover:text-foreground'}`
            }
          >
            {screen.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
