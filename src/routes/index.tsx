import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardSkeleton } from '@/components/common/LoadingSkeleton';

// Lazy load pages for code splitting
const Login = lazy(() => import('@/pages/Login'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Rooms = lazy(() => import('@/pages/Rooms'));
const RoomDetails = lazy(() => import('@/pages/RoomDetails'));
const Booking = lazy(() => import('@/pages/Booking'));
const CalendarPage = lazy(() => import('@/pages/Calendar'));
const MyBookings = lazy(() => import('@/pages/MyBookings'));
const LiveAvailability = lazy(() => import('@/pages/LiveAvailability'));
const Reports = lazy(() => import('@/pages/Reports'));
const Settings = lazy(() => import('@/pages/Settings'));

function PageLoader() {
  return (
    <div className="p-6">
      <DashboardSkeleton />
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <MainLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: 'rooms',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Rooms />
          </Suspense>
        ),
      },
      {
        path: 'rooms/:id',
        element: (
          <Suspense fallback={<PageLoader />}>
            <RoomDetails />
          </Suspense>
        ),
      },
      {
        path: 'book',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Booking />
          </Suspense>
        ),
      },
      {
        path: 'calendar',
        element: (
          <Suspense fallback={<PageLoader />}>
            <CalendarPage />
          </Suspense>
        ),
      },
      {
        path: 'my-bookings',
        element: (
          <Suspense fallback={<PageLoader />}>
            <MyBookings />
          </Suspense>
        ),
      },
      {
        path: 'live',
        element: (
          <Suspense fallback={<PageLoader />}>
            <LiveAvailability />
          </Suspense>
        ),
      },
      {
        path: 'reports',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Reports />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Settings />
          </Suspense>
        ),
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
