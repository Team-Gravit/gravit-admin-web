import { createBrowserRouter } from 'react-router';
import { ROUTES } from '@/shared/constants/routes';
import { LoginPage } from '@/pages/login/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { UserListPage } from '@/pages/users/UserListPage';
import { UserDetailPage } from '@/pages/users/UserDetailPage';
import { ReportListPage } from '@/pages/reports/ReportListPage';
import { ReportDetailPage } from '@/pages/reports/ReportDetailPage';
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
 * 라우터 빈 셸 (Step 1). 16개 라우트가 404 없이 매칭된다.
 * Step 2 에서 MainLayout/LoginLayout 레이아웃 element 와 protectedLoader 를 부착한다.
 */
export const router = createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    path: '/',
    // element/Component 없는 부모 라우트는 기본 <Outlet /> 을 렌더 → 매칭된 자식 표시
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'users', element: <UserListPage /> },
      { path: 'users/:userId', element: <UserDetailPage /> },
      { path: 'reports', element: <ReportListPage /> },
      { path: 'reports/:reportId', element: <ReportDetailPage /> },
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
