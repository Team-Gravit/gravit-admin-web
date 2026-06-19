import { useCurrentAdmin, useLogout } from '@/features/auth/hooks';
import { MainLayout } from '@/shared/components/layout/MainLayout';

export function AppShell() {
  const admin = useCurrentAdmin();
  const logout = useLogout();
  return <MainLayout admin={admin} onLogout={logout} />;
}
