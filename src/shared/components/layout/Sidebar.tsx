import { Link, useLocation } from 'react-router';
import {
  AlarmClock,
  BarChart3,
  Calendar,
  FileText,
  Globe,
  User,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { ROUTES } from '@/shared/constants/routes';

/**
 * Sidebar (DS-00 §7, DS-01 §7, 04 §10-6). 240px, 우측 1px border.
 * 메뉴 구성은 피그마(node 8720:4149) 따름: 대시보드 → [서비스 관리] 컨텐츠 관리·스테이징
 *   → [운영] 유저 관리·신고 관리·공지 관리. 섹션 헤더는 텍스트(아이콘 없음).
 * 활성 = 행 전체폭 bg-primary-subtle + 우측 2px primary(피그마 우측 강조선을 DS primary 토큰으로 매핑).
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
interface NavSection {
  heading?: string;
  items: MenuItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    items: [{ label: '대시보드', to: ROUTES.DASHBOARD, icon: BarChart3, isActive: (p) => p === '/' }],
  },
  {
    heading: '서비스 관리',
    items: [
      {
        label: '컨텐츠 관리',
        to: ROUTES.CHAPTERS,
        icon: FileText,
        isActive: (p) => /^\/(chapters|units|lessons|problems)/.test(p),
      },
      {
        label: '스테이징',
        to: ROUTES.STAGING_LABELS,
        icon: Globe,
        isActive: (p) => p.startsWith('/staging'),
      },
    ],
  },
  {
    heading: '운영',
    items: [
      { label: '유저 관리', to: ROUTES.USERS, icon: User, isActive: (p) => p.startsWith('/users') },
      {
        label: '신고 관리',
        to: ROUTES.REPORTS,
        icon: AlarmClock,
        isActive: (p) => p.startsWith('/reports'),
      },
      {
        label: '공지 관리',
        to: ROUTES.NOTICES,
        icon: Calendar,
        isActive: (p) => p.startsWith('/notices'),
      },
    ],
  },
];

export function Sidebar({ admin }: SidebarProps) {
  const { pathname } = useLocation();

  return (
    <aside className="sticky top-0 flex h-screen w-sidebar flex-col border-r border-border bg-surface">
      <div className="flex h-header items-center px-4">
        <span className="text-h3 font-semibold text-foreground">Gravit Admin</span>
      </div>

      <nav className="flex flex-1 flex-col py-2">
        {NAV_SECTIONS.map((section, si) => (
          <div key={section.heading ?? `section-${si}`} className="flex flex-col">
            {section.heading && (
              <p className="px-4 pb-1 pt-4 text-caption font-medium text-fg-secondary">
                {section.heading}
              </p>
            )}
            {section.items.map((item) => {
              const active = item.isActive(pathname);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'flex w-full items-center gap-2.5 border-r-2 px-4 py-2.5 text-body transition-colors',
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
          </div>
        ))}
      </nav>

      {/* 운영자 영역 (04 §10-6). GET /admin/me 미구현(D4) → 가용 정보/대체 표시. */}
      <div className="flex items-center gap-3 border-t border-border p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-hover text-body font-medium text-fg-secondary">
          {admin?.nickname ? (
            admin.nickname.trim().charAt(0)
          ) : (
            <User className="h-5 w-5 text-fg-muted" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-body text-foreground">{admin?.nickname ?? '운영자'}</p>
          {admin?.email && <p className="truncate text-caption text-fg-muted">{admin.email}</p>}
        </div>
      </div>
    </aside>
  );
}
