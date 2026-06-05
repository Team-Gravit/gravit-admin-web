import { useCurrentAdmin, useLogout } from '@/features/auth/hooks';
import { MainLayout } from '@/shared/components/layout/MainLayout';

/**
 * 보호 라우트 그룹의 셸 (auth 와이어링).
 * pages 레이어라 features/auth 참조 가능(pages→features 합법) → shared 레이아웃은 순수 유지.
 */
export function AppShell() {
  const admin = useCurrentAdmin();
  const logout = useLogout();
  return <MainLayout admin={admin} onLogout={logout} />;
}
