import { Outlet, useLocation } from 'react-router';
import { Sidebar } from '@/shared/components/layout/Sidebar';
import { Header } from '@/shared/components/layout/Header';
import { BreadcrumbProvider } from '@/shared/hooks/useBreadcrumb';

interface OperatorInfo {
  nickname: string;
  email: string;
}
interface MainLayoutProps {
  admin: OperatorInfo | null;
  onLogout: () => void;
}

export function MainLayout({ admin, onLogout }: MainLayoutProps) {
  const { pathname } = useLocation();

  return (
    <BreadcrumbProvider>
      <div className="flex min-h-screen min-w-viewport bg-page">
        <Sidebar admin={admin} />
        <div className="flex flex-1 flex-col">
          <Header onLogout={onLogout} />
          <main className="flex-1">
            {/* key=pathname: 라우트 전환마다 본문을 짧게 페이드인해 즉시 교체의 끊김 완화 */}
            <div
              key={pathname}
              className="mx-auto w-full max-w-content animate-in fade-in px-8 pb-12 pt-6 duration-200"
            >
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </BreadcrumbProvider>
  );
}
