import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Calendar, Clock, CalendarCheck, CalendarX, CalendarClock, FileText, Send } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { BookingCard } from '@/components/booking/BookingCard';
import { BookingModal } from '@/components/booking/BookingModal';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { BookingListSkeleton } from '@/components/common/LoadingSkeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useUserBookings, useCancelBooking, useSubmitMOM } from '@/hooks/useBookings';
import { useUserStore } from '@/store/userStore';
import { rooms } from '@/data/rooms';
import type { Booking, Room } from '@/types';
import { cn } from '@/lib/utils';

function MyBookingsPage() {
  const navigate = useNavigate();
  const currentUser = useUserStore((state) => state.currentUser);
  const { data: bookings, isLoading } = useUserBookings(currentUser?.id ?? '');
  const cancelMutation = useCancelBooking();
  const momMutation = useSubmitMOM();

  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [viewBooking, setViewBooking] = useState<Booking | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // MOM dialog state
  const [momTarget, setMomTarget] = useState<Booking | null>(null);
  const [momDialogOpen, setMomDialogOpen] = useState(false);
  const [momText, setMomText] = useState('');

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
      } else {
        completed.push(b);
      }
    }

    upcoming.sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`));
    completed.sort((a, b) => `${b.date}T${b.startTime}`.localeCompare(`${a.date}T${a.startTime}`));
    cancelled.sort((a, b) => `${b.date}T${b.startTime}`.localeCompare(`${a.date}T${a.startTime}`));

    return { upcoming, ongoing, completed, cancelled };
  }, [bookings, todayStr, currentTime]);

  const handleCancelClick = (booking: Booking) => {
    setCancelTarget(booking);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = () => {
    if (!cancelTarget) return;
    cancelMutation.mutate(
      { id: cancelTarget.id, reason: 'Cancelled by user' },
      {
        onSuccess: () => {
          toast.success('Booking cancelled', { description: `"${cancelTarget.title}" has been cancelled.` });
          setCancelDialogOpen(false);
          setCancelTarget(null);
        },
        onError: () => toast.error('Failed to cancel booking'),
      }
    );
  };

  const handleMOMClick = (booking: Booking) => {
    setMomTarget(booking);
    setMomText(booking.mom ?? '');
    setMomDialogOpen(true);
  };

  const handleSubmitMOM = () => {
    if (!momTarget || !momText.trim()) return;
    momMutation.mutate(
      { id: momTarget.id, mom: momText.trim() },
      {
        onSuccess: () => {
          toast.success('Minutes of Meeting submitted!');
          setMomDialogOpen(false);
          setMomTarget(null);
          setMomText('');
        },
        onError: () => toast.error('Failed to submit MOM'),
      }
    );
  };

  const renderBookingList = (items: Booking[], emptyTitle: string, emptyDesc: string, emptyIcon: any, showMOM = false) => {
    if (isLoading) return <BookingListSkeleton />;
    if (items.length === 0) {
      return (
        <EmptyState
          icon={emptyIcon as any}
          title={emptyTitle}
          description={emptyDesc}
          actionLabel="Book a Room"
          onAction={() => navigate('/book')}
        />
      );
    }
    return (
      <div className="space-y-3">
        {items.map((booking) => (
          <div key={booking.id}>
            <BookingCard
              booking={booking}
              room={roomMap.get(booking.roomId)}
              onView={() => { setViewBooking(booking); setViewModalOpen(true); }}
              onCancel={booking.status !== 'cancelled' && booking.status !== 'completed' ? () => handleCancelClick(booking) : undefined}
              showActions={true}
            />
            {/* MOM section for completed bookings */}
            {showMOM && (booking.status === 'completed' || (booking.date < todayStr && booking.status === 'confirmed')) && (
              <div className={cn(
                'mx-0 mt-1 rounded-b-lg border border-t-0 px-4 py-2 flex items-center justify-between',
                booking.mom ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'
              )}>
                <div className="flex items-center gap-2">
                  <FileText className={cn('w-3.5 h-3.5', booking.mom ? 'text-emerald-600' : 'text-amber-600')} />
                  <span className={cn('text-xs font-medium', booking.mom ? 'text-emerald-700' : 'text-amber-700')}>
                    {booking.mom ? 'MOM submitted' : 'Minutes of Meeting not submitted'}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className={cn(
                    'h-6 text-[10px] px-2',
                    booking.mom
                      ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                      : 'border-amber-200 text-amber-700 hover:bg-amber-100'
                  )}
                  onClick={() => handleMOMClick(booking)}
                >
                  {booking.mom ? 'View / Edit MOM' : 'Submit MOM'}
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="My Bookings" description="Manage your conference hall reservations">
        <Button onClick={() => navigate('/book')} className="gap-2">
          <Calendar className="w-4 h-4" /> New Booking
        </Button>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="gap-1.5 py-1 px-3">
          <CalendarClock className="w-3.5 h-3.5" /> {categorized.upcoming.length} Upcoming
        </Badge>
        <Badge variant="success" className="gap-1.5 py-1 px-3">
          <Clock className="w-3.5 h-3.5" /> {categorized.ongoing.length} Ongoing
        </Badge>
        <Badge variant="secondary" className="gap-1.5 py-1 px-3">
          <CalendarCheck className="w-3.5 h-3.5" /> {categorized.completed.length} Completed
        </Badge>
        <Badge variant="destructive" className="gap-1.5 py-1 px-3">
          <CalendarX className="w-3.5 h-3.5" /> {categorized.cancelled.length} Cancelled
        </Badge>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="upcoming" className="gap-1.5">
            <CalendarClock className="w-3.5 h-3.5 hidden sm:block" /> Upcoming
            {categorized.upcoming.length > 0 && (
              <span className="ml-1 text-xs bg-primary/10 text-primary rounded-full px-1.5">{categorized.upcoming.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="ongoing" className="gap-1.5">
            <Clock className="w-3.5 h-3.5 hidden sm:block" /> Ongoing
            {categorized.ongoing.length > 0 && (
              <span className="ml-1 text-xs bg-emerald-100 text-emerald-700 rounded-full px-1.5">{categorized.ongoing.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-1.5">
            <CalendarCheck className="w-3.5 h-3.5 hidden sm:block" /> Completed
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="gap-1.5">
            <CalendarX className="w-3.5 h-3.5 hidden sm:block" /> Cancelled
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4">
          {renderBookingList(categorized.upcoming, 'No Upcoming Bookings', "You don't have any upcoming reservations.", CalendarClock)}
        </TabsContent>
        <TabsContent value="ongoing" className="mt-4">
          {renderBookingList(categorized.ongoing, 'No Ongoing Meetings', "No meetings happening right now.", Clock)}
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          {renderBookingList(categorized.completed, 'No Completed Bookings', 'Completed bookings appear here.', CalendarCheck, true)}
        </TabsContent>
        <TabsContent value="cancelled" className="mt-4">
          {renderBookingList(categorized.cancelled, 'No Cancelled Bookings', "You haven't cancelled any bookings.", CalendarX)}
        </TabsContent>
      </Tabs>

      {/* MOM Dialog */}
      <Dialog open={momDialogOpen} onOpenChange={setMomDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#535bad]" />
              Minutes of Meeting
            </DialogTitle>
          </DialogHeader>
          {momTarget && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-sm font-semibold text-neutral-800">{momTarget.title}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{momTarget.date} · {momTarget.startTime}–{momTarget.endTime}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Minutes / Notes</label>
                <Textarea
                  placeholder="Write the minutes of the meeting, key decisions, action items, and follow-ups..."
                  rows={8}
                  value={momText}
                  onChange={(e) => setMomText(e.target.value)}
                  className="resize-none"
                />
                <p className="text-xs text-neutral-400">{momText.length} characters</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setMomDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSubmitMOM}
              disabled={!momText.trim() || momMutation.isPending}
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              {momMutation.isPending ? 'Submitting...' : 'Submit MOM'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BookingModal
        booking={viewBooking}
        room={viewBooking ? roomMap.get(viewBooking.roomId) : undefined}
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
      />

      <ConfirmationDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        title="Cancel Booking"
        description={cancelTarget ? `Are you sure you want to cancel "${cancelTarget.title}"? This cannot be undone.` : ''}
        confirmLabel="Cancel Booking"
        cancelLabel="Keep Booking"
        onConfirm={handleConfirmCancel}
        variant="destructive"
      />
    </div>
  );
}

export default MyBookingsPage;
