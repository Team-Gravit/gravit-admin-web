import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/components/ui/button';

/**
 * Pagination (04 §10-8, DS-01 §5-3). 응답이 { page, totalPages, hasNext } 구조.
 * 숫자 페이지 + 이전/다음. 1페이지면 미표시.
 */
interface PaginationControlProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function getPageItems(page: number, totalPages: number): Array<number | 'ellipsis'> {
  const pages = new Set<number>([1, totalPages]);
  for (let p = page - 1; p <= page + 1; p += 1) {
    if (p >= 1 && p <= totalPages) pages.add(p);
  }
  const sorted = [...pages].sort((a, b) => a - b);
  const items: Array<number | 'ellipsis'> = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) items.push('ellipsis');
    items.push(p);
    prev = p;
  }
  return items;
}

export function PaginationControl({
  page,
  totalPages,
  onPageChange,
  className,
}: PaginationControlProps) {
  if (totalPages <= 1) return null;
  const items = getPageItems(page, totalPages);

  return (
    <nav className={cn('flex items-center justify-center gap-1', className)} aria-label="페이지네이션">
      <Button
        variant="ghost"
        size="icon"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="이전 페이지"
      >
        <ChevronLeft />
      </Button>
      {items.map((item, idx) =>
        item === 'ellipsis' ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-fg-muted">
            …
          </span>
        ) : (
          <Button
            key={item}
            variant={item === page ? 'default' : 'ghost'}
            size="icon"
            aria-current={item === page ? 'page' : undefined}
            onClick={() => onPageChange(item)}
          >
            {item}
          </Button>
        ),
      )}
      <Button
        variant="ghost"
        size="icon"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="다음 페이지"
      >
        <ChevronRight />
      </Button>
    </nav>
  );
}
