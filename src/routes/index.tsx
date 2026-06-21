import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardSkeleton } from '@/components/common/LoadingSkeleton';

const Login            = lazy(() => import('@/pages/Login'));
const Dashboard        = lazy(() => import('@/pages/Dashboard'));
const CaretakerDashboard = lazy(() => import('@/pages/CaretakerDashboard'));
const UserDashboard    = lazy(() => import('@/pages/UserDashboard'));
const AdminBookings    = lazy(() => import('@/pages/AdminBookings'));
const Rooms            = lazy(() => import('@/pages/Rooms'));
const RoomDetails      = lazy(() => import('@/pages/RoomDetails'));
const Booking          = lazy(() => import('@/pages/Booking'));
const CalendarPage     = lazy(() => import('@/pages/Calendar'));
const MyBookings       = lazy(() => import('@/pages/MyBookings'));
const LiveAvailability = lazy(() => import('@/pages/LiveAvailability'));
const Reports          = lazy(() => import('@/pages/Reports'));
const Settings         = lazy(() => import('@/pages/Settings'));

function PageLoader() {
  return <div className="p-6"><DashboardSkeleton /></div>;
}

function Wrap({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

const OFFICER_ROLES = ['cp', 'special_cp', 'joint_cp', 'additional_cp', 'dcp', 'acp', 'si', 'user'] as const;

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Suspense fallback={<div className="min-h-screen bg-slate-50" />}><Login /></Suspense>,
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <MainLayout />
      </AuthGuard>
    ),
    children: [
      // ── Shared root: each role sees their own dashboard ──────────────────
      {
        index: true,
        element: <Wrap><Dashboard /></Wrap>,
      },

      // ── Admin-only routes ────────────────────────────────────────────────
      {
        path: 'admin/bookings',
        element: (
          <AuthGuard allowedRoles={['admin']}>
            <Wrap><AdminBookings /></Wrap>
          </AuthGuard>
        ),
      },
      {
        path: 'reports',
        element: (
          <AuthGuard allowedRoles={['admin']}>
            <Wrap><Reports /></Wrap>
          </AuthGuard>
        ),
      },

      // ── Caretaker-only routes ────────────────────────────────────────────
      {
        path: 'caretaker',
        element: (
          <AuthGuard allowedRoles={['caretaker']}>
            <Wrap><CaretakerDashboard /></Wrap>
          </AuthGuard>
        ),
      },

      // ── Officer + Admin routes ───────────────────────────────────────────
      {
        path: 'book',
        element: (
          <AuthGuard allowedRoles={['admin', ...OFFICER_ROLES]}>
            <Wrap><Booking /></Wrap>
          </AuthGuard>
        ),
      },
      {
        path: 'my-bookings',
        element: (
          <AuthGuard allowedRoles={['admin', ...OFFICER_ROLES]}>
            <Wrap><MyBookings /></Wrap>
          </AuthGuard>
        ),
      },

      // ── Shared routes (admin + officers) ────────────────────────────────
      {
        path: 'rooms',
        element: <Wrap><Rooms /></Wrap>,
      },
      {
        path: 'rooms/:id',
        element: <Wrap><RoomDetails /></Wrap>,
      },
      {
        path: 'calendar',
        element: <Wrap><CalendarPage /></Wrap>,
      },
      {
        path: 'live',
        element: <Wrap><LiveAvailability /></Wrap>,
      },
      {
        path: 'settings',
        element: <Wrap><Settings /></Wrap>,
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
