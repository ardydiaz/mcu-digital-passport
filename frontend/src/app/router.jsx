import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../auth/ProtectedRoute';
import RoleGuard from '../auth/RoleGuard';
import { ROLES } from '../utils/constants';

// Public
import PublicLayout from '../public/layouts/PublicLayout';
import Home from '../public/pages/Home';
import About from '../public/pages/About';
import HowItWorks from '../public/pages/HowItWorks';
import Activities from '../public/pages/Activities';
import ActivityDetails from '../public/pages/ActivityDetails';
import Achievements from '../public/pages/Achievements';
import Leaderboard from '../public/pages/Leaderboard';
import Contact from '../public/pages/Contact';
import PrivacyPolicy from '../public/pages/PrivacyPolicy';
import NotFound from '../public/pages/NotFound';
import NoAccess from '../public/pages/NoAccess';

// Admin
import AdminLogin from '../admin/auth/AdminLogin';
import AdminAccessDenied from '../admin/auth/AdminAccessDenied';
import AdminProtectedRoute from '../admin/auth/AdminProtectedRoute';
import AdminLayout from '../admin/layouts/AdminLayout';
import Dashboard from '../admin/pages/Dashboard';
import Profile from '../admin/pages/Profile';
import Settings from '../admin/pages/Settings';

// Student
import StudentLayout from '../student/layouts/StudentLayout';
import StudentDashboard from '../student/pages/StudentDashboard';
import MyPassport from '../student/pages/MyPassport';
import MyQR from '../student/pages/MyQR';
import StudentActivities from '../student/pages/MyActivities';
import MyAchievements from '../student/pages/MyAchievements';
import MyPoints from '../student/pages/MyPoints';

// Organizer
import OrganizerLayout from '../organizer/layouts/OrganizerLayout';
import OrganizerDashboard from '../organizer/pages/OrganizerDashboard';
import OrganizerActivities from '../organizer/pages/MyActivities';
import ScanAttendance from '../organizer/pages/ScanAttendance';
import AttendanceRecords from '../organizer/pages/AttendanceRecords';

export const router = createBrowserRouter([
  // Landing page = Microsoft 365 sign-in (full screen, no public header/footer)
  { path: '/', element: <Home /> },
  // Signed in with an MCU account that has no role yet (e.g. staff without Organizer/Admin)
  { path: '/no-access', element: <NoAccess /> },

  {
    element: <PublicLayout />,
    children: [
      { path: 'about', element: <About /> },
      { path: 'how-it-works', element: <HowItWorks /> },
      { path: 'activities', element: <Activities /> },
      { path: 'activities/:id', element: <ActivityDetails /> },
      { path: 'achievements', element: <Achievements /> },
      { path: 'leaderboard', element: <Leaderboard /> },
      { path: 'contact', element: <Contact /> },
      { path: 'privacy-policy', element: <PrivacyPolicy /> },
    ],
  },

  { path: '/admin/login', element: <AdminLogin /> },
  { path: '/admin/access-denied', element: <AdminAccessDenied /> },
  {
    path: '/admin',
    element: <AdminProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'profile', element: <Profile /> },
          { path: 'settings', element: <Settings /> },
        ],
      },
    ],
  },

  {
    path: '/student',
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleGuard allowedRoles={[ROLES.STUDENT]} />,
        children: [
          {
            element: <StudentLayout />,
            children: [
              { index: true, element: <StudentDashboard /> },
              { path: 'passport', element: <MyPassport /> },
              { path: 'qr', element: <MyQR /> },
              { path: 'activities', element: <StudentActivities /> },
              { path: 'achievements', element: <MyAchievements /> },
              { path: 'points', element: <MyPoints /> },
            ],
          },
        ],
      },
    ],
  },

  {
    path: '/organizer',
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleGuard allowedRoles={[ROLES.ORGANIZER]} />,
        children: [
          {
            element: <OrganizerLayout />,
            children: [
              { index: true, element: <OrganizerDashboard /> },
              { path: 'activities', element: <OrganizerActivities /> },
              { path: 'scan', element: <ScanAttendance /> },
              { path: 'attendance', element: <AttendanceRecords /> },
            ],
          },
        ],
      },
    ],
  },

  { path: '*', element: <NotFound /> },
]);
