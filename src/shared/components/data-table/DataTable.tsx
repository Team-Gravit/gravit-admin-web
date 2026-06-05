import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { EmptyState } from '@/shared/components/states/EmptyState';
import { ErrorState } from '@/shared/components/states/ErrorState';
import { LoadingSkeleton } from '@/shared/components/states/LoadingSkeleton';

/**
 * Data Table (DS-01 §5-3, 04 §10-7). 컬럼 정의 + 4상태(Empty/Loading/Error/Data) 통합.
 * 페이지당 20행은 서버 고정. 행 hover/클릭은 onRowClick 시 cursor-pointer + 이동.
 */
export interface Column<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: Array<Column<T>>;
  data: T[];
  rowKey: (row: T) => string | number;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  emptyMessage?: string;
  emptyIcon?: LucideIcon;
  emptyAction?: ReactNode;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  isLoading = false,
  isError = false,
  onRetry,
  emptyMessage = '데이터가 없습니다.',
  emptyIcon,
  emptyAction,
  onRowClick,
}: DataTableProps<T>) {
  const body = () => {
    if (isLoading) return <LoadingSkeleton />;
    if (isError) return <ErrorState onRetry={onRetry} />;
    if (data.length === 0) {
      return <EmptyState message={emptyMessage} icon={emptyIcon} action={emptyAction} />;
    }
    return (
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key} className={col.headerClassName}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow
              key={rowKey(row)}
              className={cn(onRowClick && 'cursor-pointer')}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((col) => (
                <TableCell key={col.key} className={col.className}>
                  {col.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="rounded-lg border border-border bg-surface">{body()}</div>
  );
}
