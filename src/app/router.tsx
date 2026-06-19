import { createBrowserRouter, redirect, type LoaderFunction } from 'react-router';
import { ROUTES } from '@/shared/constants/routes';
import { tokenManager } from '@/shared/api/tokenManager';
import { authApi } from '@/features/auth/api';
import { useAuthStore } from '@/features/auth/store';
import { LoginLayout } from '@/shared/components/layout/LoginLayout';
import { AppShell } from '@/pages/AppShell';
import { LoginPage } from '@/pages/login/LoginPage';
import { OAuthCallbackPage } from '@/pages/login/OAuthCallbackPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { UserListPage } from '@/pages/users/UserListPage';
import { UserDetailPage } from '@/pages/users/UserDetailPage';
import { ReportListPage } from '@/pages/reports/ReportListPage';
import { ReportDetailPage } from '@/pages/reports/ReportDetailPage';
import { InquiryListPage } from '@/pages/inquiries/InquiryListPage';
import { InquiryDetailPage } from '@/pages/inquiries/InquiryDetailPage';
import { ChapterListPage } from '@/pages/chapters/ChapterListPage';
import { ChapterDetailPage } from '@/pages/chapters/ChapterDetailPage';
import { UnitDetailPage } from '@/pages/units/UnitDetailPage';
import { LessonDetailPage } from '@/pages/lessons/LessonDetailPage';
import { ProblemDetailPage } from '@/pages/problems/ProblemDetailPage';
import { StagingListPage } from '@/pages/staging/StagingListPage';
import { StagingDetailPage } from '@/pages/staging/StagingDetailPage';
import { NoticeListPage } from '@/pages/notices/NoticeListPage';
import { NoticeNewPage } from '@/pages/notices/NoticeNewPage';
import { NoticeDetailPage } from '@/pages/notices/NoticeDetailPage';

/**
 * ProtectedRoute (04 §7-3, loader 방식). refreshToken 부재 → /login 리다이렉트.
 * 운영자 프로필: access 확보 후 GET /admin/me 1회 fetch → store.setAdmin(BACKEND_ADMIN_API_SPEC §4-0). 비차단.
 *
 * 새로고침 복구: access 토큰은 메모리라 새로고침 시 휘발된다. refresh 는 남아있으므로
 * access 가 없으면 첫 admin 호출(무토큰 → 403) 전에 refresh 로 1회 재발급한다.
 * 재발급 실패(= refresh 만료/무효) → 토큰 정리 후 /login.
 */
const protectedLoader: LoaderFunction = async () => {
  const refreshToken = tokenManager.getRefreshToken();
  if (!refreshToken) {
    throw redirect(ROUTES.LOGIN);
  }
  if (!tokenManager.getAccessToken()) {
    try {
      const accessToken = await authApi.reissue(refreshToken);
      tokenManager.setAccessToken(accessToken);
    } catch {
      tokenManager.clear();
      throw redirect(ROUTES.LOGIN);
    }
  }

  // 운영자 프로필 복구(BACKEND_ADMIN_API_SPEC §4-0). store 가 비었을 때만(세션당 1회) fetch.
  // 비차단 — /me 미배포/일시 실패 시 사이드바는 '운영자' 폴백, 진입은 허용.
  if (!useAuthStore.getState().admin) {
    try {
      const me = await authApi.me();
      useAuthStore.getState().setAdmin(me);
    } catch {
      // ignore — 프로필은 비필수, 게이트는 토큰만으로 통과.
    }
  }
  return null;
};

export const router = createBrowserRouter([
  {
    element: <LoginLayout />,
    children: [
      { path: ROUTES.LOGIN, element: <LoginPage /> },
      { path: ROUTES.OAUTH_CALLBACK_PATTERN, element: <OAuthCallbackPage /> },
    ],
  },
  {
    path: '/',
    element: <AppShell />,
    loader: protectedLoader,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'users', element: <UserListPage /> },
      { path: 'users/:userId', element: <UserDetailPage /> },
      { path: 'reports', element: <ReportListPage /> },
      { path: 'reports/:reportId', element: <ReportDetailPage /> },
      { path: 'inquiries', element: <InquiryListPage /> },
      { path: 'inquiries/:inquiryId', element: <InquiryDetailPage /> },
      { path: 'chapters', element: <ChapterListPage /> },
      { path: 'chapters/:chapterId', element: <ChapterDetailPage /> },
      { path: 'units/:unitId', element: <UnitDetailPage /> },
      { path: 'lessons/:lessonId', element: <LessonDetailPage /> },
      { path: 'problems/:problemId', element: <ProblemDetailPage /> },
      { path: 'staging/labels', element: <StagingListPage /> },
      { path: 'staging/labels/:label', element: <StagingDetailPage /> },
      { path: 'notices', element: <NoticeListPage /> },
      { path: 'notices/new', element: <NoticeNewPage /> },
      { path: 'notices/:noticeId', element: <NoticeDetailPage /> },
    ],
  },
]);
