import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Calendar, Clock, CalendarCheck, CalendarX, CalendarClock } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { BookingCard } from '@/components/booking/BookingCard';
import { BookingModal } from '@/components/booking/BookingModal';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { BookingListSkeleton } from '@/components/common/LoadingSkeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserBookings, useCancelBooking } from '@/hooks/useBookings';
import { useUserStore } from '@/store/userStore';
import { rooms } from '@/data/rooms';
import type { Booking, Room } from '@/types';

function MyBookingsPage() {
  const navigate = useNavigate();
  const currentUser = useUserStore((state) => state.currentUser);
  const { data: bookings, isLoading } = useUserBookings(currentUser?.id ?? '');
  const cancelMutation = useCancelBooking();

  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [viewBooking, setViewBooking] = useState<Booking | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const roomMap = useMemo(() => {
    const map = new Map<string, Room>();
    rooms.forEach((r) => map.set(r.id, r));
    return map;
  }, []);

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const categorized = useMemo(() => {
    if (!bookings) return { upcoming: [], ongoing: [], completed: [], cancelled: [] };

    const upcoming: Booking[] = [];
    const ongoing: Booking[] = [];
    const completed: Booking[] = [];
    const cancelled: Booking[] = [];

    for (const b of bookings) {
      if (b.status === 'cancelled') {
        cancelled.push(b);
      } else if (b.status === 'completed') {
        completed.push(b);
      } else if (
        b.status === 'confirmed' &&
        b.date === todayStr &&
        b.startTime <= currentTime &&
        b.endTime > currentTime
      ) {
        ongoing.push(b);
      } else if (
        (b.status === 'confirmed' || b.status === 'pending') &&
        (b.date > todayStr || (b.date === todayStr && b.startTime > currentTime))
      ) {
        upcoming.push(b);
      } else if (b.status === 'confirmed' || b.status === 'pending') {
        // Past bookings that aren't marked completed — treat as completed
        completed.push(b);
      }
    }

    // Sort upcoming by date/time ascending
    upcoming.sort((a, b) => {
      const da = `${a.date}T${a.startTime}`;
      const db = `${b.date}T${b.startTime}`;
      return da.localeCompare(db);
    });

    // Sort completed by date descending
    completed.sort((a, b) => {
      const da = `${a.date}T${a.startTime}`;
      const db = `${b.date}T${b.startTime}`;
      return db.localeCompare(da);
    });

    // Sort cancelled by date descending
    cancelled.sort((a, b) => {
      const da = `${a.date}T${a.startTime}`;
      const db = `${b.date}T${b.startTime}`;
      return db.localeCompare(da);
    });

    return { upcoming, ongoing, completed, cancelled };
  }, [bookings, todayStr, currentTime]);

  const handleCancelClick = (booking: Booking) => {
    setCancelTarget(booking);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = () => {
    if (!cancelTarget) return;
    cancelMutation.mutate(cancelTarget.id, {
      onSuccess: () => {
        toast.success('Booking cancelled', {
          description: `"${cancelTarget.title}" has been cancelled successfully.`,
        });
        setCancelDialogOpen(false);
        setCancelTarget(null);
      },
      onError: () => {
        toast.error('Failed to cancel booking', {
          description: 'An error occurred. Please try again.',
        });
      },
    });
  };

  const handleViewClick = (booking: Booking) => {
    setViewBooking(booking);
    setViewModalOpen(true);
  };

  const renderBookingList = (items: Booking[], emptyTitle: string, emptyDescription: string, emptyIcon: any) => {
    if (isLoading) return <BookingListSkeleton />;
    if (items.length === 0) {
      return (
        <EmptyState
          icon={emptyIcon as any}
          title={emptyTitle}
          description={emptyDescription}
          actionLabel="Book a Room"
          onAction={() => navigate('/book')}
        />
      );
    }
    return (
      <div className="space-y-3">
        {items.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            room={roomMap.get(booking.roomId)}
            onView={() => handleViewClick(booking)}
            onCancel={() => handleCancelClick(booking)}
            showActions={true}
          />
        ))}
      </div>
    );
  };

  const totalBookings = bookings?.length ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Bookings"
        description={`Manage your conference room reservations`}
      >
        <Button onClick={() => navigate('/book')} className="gap-2">
          <Calendar className="w-4 h-4" />
          New Booking
        </Button>
      </PageHeader>

      {/* Summary Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="gap-1.5 py-1 px-3">
          <CalendarClock className="w-3.5 h-3.5" />
          {categorized.upcoming.length} Upcoming
        </Badge>
        <Badge variant="success" className="gap-1.5 py-1 px-3">
          <Clock className="w-3.5 h-3.5" />
          {categorized.ongoing.length} Ongoing
        </Badge>
        <Badge variant="secondary" className="gap-1.5 py-1 px-3">
          <CalendarCheck className="w-3.5 h-3.5" />
          {categorized.completed.length} Completed
        </Badge>
        <Badge variant="destructive" className="gap-1.5 py-1 px-3">
          <CalendarX className="w-3.5 h-3.5" />
          {categorized.cancelled.length} Cancelled
        </Badge>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="upcoming" className="gap-1.5">
            <CalendarClock className="w-3.5 h-3.5 hidden sm:block" />
            Upcoming
            {categorized.upcoming.length > 0 && (
              <span className="ml-1 text-xs bg-primary/10 text-primary rounded-full px-1.5 py-0.5">
                {categorized.upcoming.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="ongoing" className="gap-1.5">
            <Clock className="w-3.5 h-3.5 hidden sm:block" />
            Ongoing
            {categorized.ongoing.length > 0 && (
              <span className="ml-1 text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-100 rounded-full px-1.5 py-0.5">
                {categorized.ongoing.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-1.5">
            <CalendarCheck className="w-3.5 h-3.5 hidden sm:block" />
            Completed
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="gap-1.5">
            <CalendarX className="w-3.5 h-3.5 hidden sm:block" />
            Cancelled
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4">
          {renderBookingList(
            categorized.upcoming,
            'No Upcoming Bookings',
            'You don\'t have any upcoming room reservations. Book a conference room to get started.',
            CalendarClock,
          )}
        </TabsContent>

        <TabsContent value="ongoing" className="mt-4">
          {renderBookingList(
            categorized.ongoing,
            'No Ongoing Bookings',
            'You don\'t have any meetings happening right now.',
            Clock,
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          {renderBookingList(
            categorized.completed,
            'No Completed Bookings',
            'Your completed bookings will appear here.',
            CalendarCheck,
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="mt-4">
          {renderBookingList(
            categorized.cancelled,
            'No Cancelled Bookings',
            'You haven\'t cancelled any bookings.',
            CalendarX,
          )}
        </TabsContent>
      </Tabs>

      {/* View Booking Modal */}
      <BookingModal
        booking={viewBooking}
        room={viewBooking ? roomMap.get(viewBooking.roomId) : undefined}
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
      />

      {/* Cancel Confirmation Dialog */}
      <ConfirmationDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        title="Cancel Booking"
        description={
          cancelTarget
            ? `Are you sure you want to cancel "${cancelTarget.title}"? This action cannot be undone.`
            : 'Are you sure you want to cancel this booking?'
        }
        confirmLabel="Cancel Booking"
        cancelLabel="Keep Booking"
        onConfirm={handleConfirmCancel}
        variant="destructive"
      />
    </div>
  );
}

export default MyBookingsPage;
