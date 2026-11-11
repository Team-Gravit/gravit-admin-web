import { createBrowserRouter, redirect, type LoaderFunction } from 'react-router';
import { isAxiosError } from 'axios';
import { ROUTES } from '@/shared/constants/routes';
import { tokenManager } from '@/shared/api/tokenManager';
import { refreshAccessToken } from '@/shared/api/client';
import { authApi } from '@/features/auth/api';
import { useAuthStore } from '@/features/auth/store';
import { LoginLayout } from '@/shared/components/layout/LoginLayout';
import { AppShell } from '@/pages/AppShell';
import { LoginPage } from '@/pages/login/LoginPage';
import { OAuthCallbackPage } from '@/pages/login/OAuthCallbackPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { RavvitPage } from '@/pages/ravvit/RavvitPage';
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
import { QaSprintListPage } from '@/pages/qa/QaSprintListPage';
import { QaSprintLayout } from '@/pages/qa/QaSprintLayout';
import { QaSprintIndexPage } from '@/pages/qa/QaSprintIndexPage';
import { QaSetupPage } from '@/pages/qa/QaSetupPage';
import { QaReviewPage } from '@/pages/qa/QaReviewPage';
import { QaChecklistPage } from '@/pages/qa/QaChecklistPage';

const protectedLoader: LoaderFunction = async () => {
  if (!tokenManager.getAccessToken()) {
    if (!tokenManager.hasSession() || !(await refreshAccessToken())) {
      tokenManager.clear();
      useAuthStore.getState().reset();
      throw redirect(ROUTES.LOGIN);
    }
  }

  if (!useAuthStore.getState().admin) {
    try {
      const me = await authApi.me();
      useAuthStore.getState().setAdmin(me);
    } catch (error) {
      const status = isAxiosError(error) ? error.response?.status : undefined;
      if (status === 401 || status === 403) {
        tokenManager.clear();
        useAuthStore.getState().reset();
        throw redirect(`${ROUTES.LOGIN}?error=${status === 403 ? 'forbidden' : 'failed'}`);
      }
      // 프로필의 일시적인 조회 실패는 기존 운영자 폴백으로 표시한다.
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
      { path: 'ravvit', element: <RavvitPage /> },
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
      { path: 'qa/sprints', element: <QaSprintListPage /> },
      {
        path: 'qa/sprints/:sprintId',
        element: <QaSprintLayout />,
        children: [
          { index: true, element: <QaSprintIndexPage /> },
          { path: 'setup', element: <QaSetupPage /> },
          { path: 'review', element: <QaReviewPage /> },
          { path: 'checklist', element: <QaChecklistPage /> },
        ],
      },
    ],
  },
]);
