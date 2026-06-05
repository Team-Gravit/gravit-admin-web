import { Link, useLocation } from 'react-router';
import {
  AlertTriangle,
  BookOpen,
  FlaskConical,
  LayoutDashboard,
  Megaphone,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { ROUTES } from '@/shared/constants/routes';

/**
 * Sidebar (DS-00 §7, DS-01 §7, 04 §10-6). 240px, 우측 1px border, 활성 메뉴 좌측 3px Primary.
 * presentational — 운영자 정보는 prop 으로 주입(shared→features 금지). 메뉴는 ROUTES 참조.
 */
interface OperatorInfo {
  nickname: string;
  email: string;
}
interface SidebarProps {
  admin: OperatorInfo | null;
}

interface MenuItem {
  label: string;
  to: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
}

const MENU: MenuItem[] = [
  { label: '대시보드', to: ROUTES.DASHBOARD, icon: LayoutDashboard, isActive: (p) => p === '/' },
  { label: '유저 관리', to: ROUTES.USERS, icon: Users, isActive: (p) => p.startsWith('/users') },
  {
    label: '신고 관리',
    to: ROUTES.REPORTS,
    icon: AlertTriangle,
    isActive: (p) => p.startsWith('/reports'),
  },
  {
    label: '학습 컨텐츠',
    to: ROUTES.CHAPTERS,
    icon: BookOpen,
    isActive: (p) => /^\/(chapters|units|lessons|problems)/.test(p),
  },
  {
    label: '스테이징',
    to: ROUTES.STAGING_LABELS,
    icon: FlaskConical,
    isActive: (p) => p.startsWith('/staging'),
  },
  {
    label: '공지 관리',
    to: ROUTES.NOTICES,
    icon: Megaphone,
    isActive: (p) => p.startsWith('/notices'),
  },
];

export function Sidebar({ admin }: SidebarProps) {
  const { pathname } = useLocation();

  return (
    <aside className="sticky top-0 flex h-screen w-sidebar flex-col border-r border-border bg-surface">
      <div className="flex h-header items-center px-4">
        <span className="text-h3 font-semibold text-foreground">Gravit Admin</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
        {MENU.map((item) => {
          const active = item.isActive(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 rounded-md border-l-3 px-3 py-2 text-body transition-colors',
                active
                  ? 'border-primary bg-primary-subtle font-medium text-primary'
                  : 'border-transparent text-fg-secondary hover:bg-hover',
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* 운영자 영역 (04 §10-6). GET /admin/me 미구현(D4) → 가용 정보/대체 표시. */}
      <div className="flex items-center gap-3 border-t border-border p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-hover">
          <User className="h-5 w-5 text-fg-muted" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-body text-foreground">{admin?.nickname ?? '운영자'}</p>
          {admin?.email && <p className="truncate text-caption text-fg-muted">{admin.email}</p>}
        </div>
      </div>
    </aside>
  );
}
