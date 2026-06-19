import { Outlet } from 'react-router';

export function LoginLayout() {
  return (
    <div className="flex min-h-screen min-w-viewport items-center justify-center bg-page">
      <Outlet />
    </div>
  );
}
