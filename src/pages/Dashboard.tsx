import React, { lazy, Suspense } from 'react';
import { useUserStore } from '@/store/userStore';
import { DashboardSkeleton } from '@/components/common/LoadingSkeleton';

const AdminDashboard    = lazy(() => import('./AdminDashboard'));
const CaretakerDashboard = lazy(() => import('./CaretakerDashboard'));
const UserDashboard     = lazy(() => import('./UserDashboard'));

export default function Dashboard() {
  const { currentUser } = useUserStore();

  return (
    <Suspense fallback={<div className="p-6"><DashboardSkeleton /></div>}>
      {currentUser?.role === 'admin' ? (
        <AdminDashboard />
      ) : currentUser?.role === 'caretaker' ? (
        <CaretakerDashboard />
      ) : (
        <UserDashboard />
      )}
    </Suspense>
  );
}
