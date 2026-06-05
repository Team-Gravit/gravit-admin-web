import { Link, useMatches } from 'react-router';
import { ChevronRight } from 'lucide-react';

/**
 * Breadcrumb (04 §8-3, DS-01 §5-7). 라우트 handle.breadcrumb 를 순회.
 * 14px text-muted, 마지막 항목만 text-primary(foreground). handle 미정의 라우트는 생략.
 */
interface Crumb {
  label: string;
  href: string;
}
interface CrumbHandle {
  breadcrumb: (data: unknown) => Crumb;
}

function hasBreadcrumb(handle: unknown): handle is CrumbHandle {
  return (
    typeof handle === 'object' &&
    handle !== null &&
    'breadcrumb' in handle &&
    typeof (handle as { breadcrumb: unknown }).breadcrumb === 'function'
  );
}

export function Breadcrumb() {
  const matches = useMatches();
  const crumbs = matches
    .filter((m) => hasBreadcrumb(m.handle))
    .map((m) => (m.handle as CrumbHandle).breadcrumb(m.data));

  if (crumbs.length === 0) return null;

  return (
    <nav className="flex items-center gap-1 text-body text-fg-muted" aria-label="breadcrumb">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={crumb.href} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-4 w-4" />}
            {isLast ? (
              <span className="text-foreground">{crumb.label}</span>
            ) : (
              <Link to={crumb.href} className="hover:text-foreground">
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
