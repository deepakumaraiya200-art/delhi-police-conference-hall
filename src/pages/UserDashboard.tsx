import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { StatisticsCard } from '@/components/common/StatisticsCard';
import { BookingCard } from '@/components/booking/BookingCard';
import { BookingModal } from '@/components/booking/BookingModal';
import { EmptyState } from '@/components/common/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CalendarCheck, CheckCircle2, Clock, Plus, ArrowRight, Building2, FileText,
} from 'lucide-react';
import { rooms as allRoomsData } from '@/data/rooms';
import { useUserBookings, useUpcomingBookings } from '@/hooks/useBookings';
import { useUserStore } from '@/store/userStore';
import type { Booking, Room } from '@/types';
import { getRankLabel, RANK_COLORS, isOfficerRank, type OfficerRank } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function UserDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useUserStore();
  const { data: myBookings, isLoading } = useUserBookings(currentUser?.id ?? '');
  const [selectedBooking, setSelectedBooking] = React.useState<Booking | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const roomMap = useMemo(() => {
    const map = new Map<string, Room>();
    allRoomsData.forEach((r) => map.set(r.id, r));
    return map;
  }, []);

  const { upcoming, completed, cancelled } = useMemo(() => {
    if (!myBookings) return { upcoming: [], completed: [], cancelled: [] };
    const upcoming = myBookings
      .filter((b) => (b.status === 'confirmed' || b.status === 'pending') && (b.date > todayStr || (b.date === todayStr && b.startTime > currentTime)))
      .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`));
    const completed = myBookings
      .filter((b) => b.status === 'completed' || (b.date < todayStr && (b.status === 'confirmed' || b.status === 'pending')))
      .sort((a, b) => `${b.date}T${b.startTime}`.localeCompare(`${a.date}T${a.startTime}`));
    const cancelled = myBookings
      .filter((b) => b.status === 'cancelled')
      .sort((a, b) => `${b.date}T${b.startTime}`.localeCompare(`${a.date}T${a.startTime}`));
    return { upcoming, completed, cancelled };
  }, [myBookings, todayStr, currentTime]);

  const completedWithoutMOM = completed.filter((b) => b.status === 'completed' && !b.mom);

  const rankBadge = isOfficerRank(currentUser?.role ?? 'user')
    ? RANK_COLORS[currentUser!.role as OfficerRank]
    : 'bg-gray-100 text-gray-700 border-gray-200';

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${currentUser?.name}`}
        description={
          <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border', rankBadge)}>
            {getRankLabel(currentUser?.role ?? 'user')}
          </span>
        }
      >
        <Button onClick={() => navigate('/book')} className="gap-2 border border-neutral-500/20 text-[#535bad]">
          <Plus className="w-4 h-4" /> Book a Hall
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatisticsCard
          title="Upcoming Meetings"
          value={upcoming.length}
          description="Confirmed & pending"
          icon={CalendarCheck}
          iconColor="text-violet-600"
          iconBg="bg-violet-50"
        />
        <StatisticsCard
          title="Completed Meetings"
          value={completed.length}
          description="Past meetings"
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatisticsCard
          title="Pending MOM"
          value={completedWithoutMOM.length}
          description="Minutes not yet submitted"
          icon={FileText}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
      </div>

      {/* MOM reminder */}
      {completedWithoutMOM.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <FileText className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">Minutes of Meeting pending</p>
            <p className="text-xs text-amber-700 mt-0.5">
              You have {completedWithoutMOM.length} completed meeting{completedWithoutMOM.length > 1 ? 's' : ''} without submitted minutes.
            </p>
          </div>
          <Button size="sm" variant="outline" className="shrink-0 border-amber-300 text-amber-800 hover:bg-amber-100" onClick={() => navigate('/my-bookings')}>
            Submit MOM
          </Button>
        </div>
      )}

      {/* Upcoming meetings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">My Upcoming Meetings</h2>
            <p className="text-sm text-neutral-400">Your scheduled conference hall bookings</p>
          </div>
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate('/my-bookings')}>
            View All <ArrowRight className="w-3 h-3" />
          </Button>
        </div>

        {isLoading ? (
          <div className="text-sm text-neutral-400 p-4">Loading your bookings...</div>
        ) : upcoming.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="No upcoming bookings"
            description="You haven't booked any hall yet. Book one of the 14 available halls."
            actionLabel="Book a Hall"
            onAction={() => navigate('/book')}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcoming.slice(0, 6).map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                room={roomMap.get(b.roomId)}
                showActions={true}
                onView={() => { setSelectedBooking(b); setModalOpen(true); }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Available Halls Right Now</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {allRoomsData.filter((r) => r.status === 'available').slice(0, 4).map((r) => (
                <div key={r.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-neutral-700">
                    <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                    {r.name}
                  </span>
                  <span className="text-xs text-neutral-400">{r.tower}</span>
                </div>
              ))}
              {allRoomsData.filter((r) => r.status === 'available').length > 4 && (
                <Button variant="ghost" size="sm" className="w-full mt-1 text-xs" onClick={() => navigate('/rooms')}>
                  View All Available Halls <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">My Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Upcoming</span>
              <Badge variant="secondary">{upcoming.length}</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Completed</span>
              <Badge variant="success">{completed.length}</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Cancelled</span>
              <Badge variant="destructive">{cancelled.length}</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">MOM Submitted</span>
              <Badge variant="secondary">{completed.filter((b) => b.mom).length}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <BookingModal
        booking={selectedBooking}
        room={selectedBooking ? roomMap.get(selectedBooking.roomId) : undefined}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
