import { Outlet, useLocation } from 'react-router';
import { Sidebar } from '@/shared/components/layout/Sidebar';
import { Header } from '@/shared/components/layout/Header';
import { BreadcrumbProvider } from '@/shared/hooks/useBreadcrumb';
import { ROUTES } from '@/shared/constants/routes';
import { cn } from '@/shared/lib/cn';

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
  // RAVVIT 만 뷰포트를 채우고 내부에서 스크롤한다 (decisions D8-5). 나머지 화면은 기존 페이지 스크롤 유지.
  const fullHeight = pathname === ROUTES.RAVVIT;

  return (
    <BreadcrumbProvider>
      <div
        className={cn(
          'flex min-w-viewport bg-page',
          fullHeight ? 'h-screen overflow-hidden' : 'min-h-screen',
        )}
      >
        <Sidebar admin={admin} />
        <div className="flex flex-1 flex-col">
          <Header onLogout={onLogout} />
          <main className={cn('flex-1', fullHeight && 'min-h-0')}>
            {/* key=pathname: 라우트 전환마다 본문을 짧게 페이드인해 즉시 교체의 끊김 완화 */}
            <div
              key={pathname}
              className={cn(
                'mx-auto w-full max-w-content animate-in fade-in px-8 duration-200',
                fullHeight ? 'flex h-full flex-col py-6' : 'pb-12 pt-6',
              )}
            >
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </BreadcrumbProvider>
  );
}
