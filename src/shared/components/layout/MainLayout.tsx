import { Outlet } from 'react-router';
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
  return (
    <BreadcrumbProvider>
      <div className="flex min-h-screen min-w-viewport bg-page">
        <Sidebar admin={admin} />
        <div className="flex flex-1 flex-col">
          <Header onLogout={onLogout} />
          <main className="flex-1">
            <div className="mx-auto w-full max-w-content px-8 pb-12 pt-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </BreadcrumbProvider>
  );
}
