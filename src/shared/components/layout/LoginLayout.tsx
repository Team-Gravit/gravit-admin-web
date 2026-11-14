import { Outlet } from 'react-router';

export function LoginLayout() {
  return (
    <div className="login-theme flex min-h-screen min-w-viewport items-center justify-center bg-page">
      <Outlet />
    </div>
  );
}
