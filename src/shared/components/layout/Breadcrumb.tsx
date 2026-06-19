import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { useBreadcrumbCrumbs } from '@/shared/hooks/useBreadcrumb';

export function Breadcrumb() {
  const crumbs = useBreadcrumbCrumbs();
  if (crumbs.length === 0) return null;

  return (
    <nav className="flex items-center gap-1 text-body text-fg-muted" aria-label="breadcrumb">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={`${i}-${crumb.label}`} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-4 w-4" />}
            {isLast || !crumb.href ? (
              <span className={isLast ? 'text-foreground' : undefined}>{crumb.label}</span>
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
