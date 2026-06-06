import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { useBreadcrumbCrumbs } from '@/shared/hooks/useBreadcrumb';

/**
 * Breadcrumb (04 §8-3, DS-01 §5-7). 현재 상세 페이지가 발행한 trail 을 구독해 렌더.
 * text-fg-muted(=text-muted), 마지막(현재 페이지)만 text-foreground. 발행 없으면(목록 등) 미표시.
 */
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
