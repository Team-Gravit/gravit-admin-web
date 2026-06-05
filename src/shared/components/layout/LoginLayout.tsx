import { Outlet } from 'react-router';

/** Login Layout (DS-00). 사이드바 없는 독립 레이아웃, 중앙 정렬, bg-page. */
export function LoginLayout() {
  return (
    <div className="flex min-h-screen min-w-viewport items-center justify-center bg-page">
      <Outlet />
    </div>
  );
}
