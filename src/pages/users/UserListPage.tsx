import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { Search } from 'lucide-react';
import { ROUTES } from '@/shared/constants/routes';
import { formatDate } from '@/shared/lib/formatDate';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { DataTable, type Column } from '@/shared/components/data-table/DataTable';
import { PaginationControl } from '@/shared/components/data-table/PaginationControl';
import type { UserRole, UserStatus } from '@/shared/constants/enums';
import { useUsers } from '@/features/users/queries';
import { UserStatusBadge } from '@/features/users/components/UserStatusBadge';
import { UserRoleBadge } from '@/features/users/components/UserRoleBadge';
import type { UserListItem } from '@/features/users/schemas';

type StatusFilter = UserStatus | 'ALL';
type RoleFilter = UserRole | 'ALL';

export function UserListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');

  const { data, isLoading, isError, refetch } = useUsers({
    page,
    search: search || undefined,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    role: roleFilter === 'ALL' ? undefined : roleFilter,
  });

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value as StatusFilter);
    setPage(1);
  };
  const handleRoleChange = (value: string) => {
    setRoleFilter(value as RoleFilter);
    setPage(1);
  };

  const columns: Array<Column<UserListItem>> = [
    {
      key: 'email',
      header: '이메일',
      cell: (user) => <span className="line-clamp-1">{user.email}</span>,
    },
    {
      key: 'nickname',
      header: '닉네임',
      headerClassName: 'w-32',
      className: 'w-32',
      cell: (user) => <span className="line-clamp-1">{user.nickname}</span>,
    },
    {
      key: 'handle',
      header: 'handle',
      headerClassName: 'w-36',
      className: 'w-36',
      cell: (user) =>
        user.handle ? (
          <span className="text-fg-secondary">@{user.handle}</span>
        ) : (
          <span className="text-fg-muted">—</span>
        ),
    },
    {
      key: 'role',
      header: '역할',
      headerClassName: 'w-24',
      className: 'w-24',
      cell: (user) => <UserRoleBadge role={user.role} />,
    },
    {
      key: 'status',
      header: '상태',
      headerClassName: 'w-28',
      className: 'w-28',
      cell: (user) => <UserStatusBadge status={user.status} />,
    },
    {
      key: 'createdAt',
      header: '가입일',
      headerClassName: 'w-32',
      className: 'w-32',
      cell: (user) => formatDate(user.createdAt),
    },
  ];

  const isFiltered = search !== '' || statusFilter !== 'ALL' || roleFilter !== 'ALL';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-h1 text-foreground">유저 관리</h1>
        <p className="text-body text-fg-muted">유저의 상태와 권한을 관리합니다.</p>
      </div>

      <div className="flex items-center gap-3">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-muted" />
            <Input
              className="w-80 pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="이메일/닉네임/handle 검색"
            />
          </div>
          <Button type="submit" variant="outline">
            검색
          </Button>
        </form>

        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="상태" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">상태 전체</SelectItem>
            <SelectItem value="ACTIVE">활성</SelectItem>
            <SelectItem value="SUSPENDED">정지</SelectItem>
            <SelectItem value="DELETED">삭제됨</SelectItem>
          </SelectContent>
        </Select>

        <Select value={roleFilter} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="역할" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">역할 전체</SelectItem>
            <SelectItem value="ADMIN">관리자</SelectItem>
            <SelectItem value="USER">일반</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={data?.contents ?? []}
        rowKey={(user) => user.userId}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        emptyMessage={isFiltered ? '조건에 맞는 유저가 없습니다.' : '유저가 없습니다.'}
        onRowClick={(user) => navigate(ROUTES.USER_DETAIL(user.userId))}
      />

      {data && data.totalPages > 1 && (
        <PaginationControl page={page} totalPages={data.totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
