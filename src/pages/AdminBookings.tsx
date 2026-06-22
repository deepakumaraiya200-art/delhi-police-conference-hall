import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  Search, Calendar, Clock, MapPin, Users, Edit, XCircle, CheckCircle2,
  AlertTriangle, RefreshCw, ShieldAlert,
} from 'lucide-react';
import { useBookings, useCancelBooking, useUpdateBooking } from '@/hooks/useBookings';
import { rooms as allRoomsData } from '@/data/rooms';
import { users } from '@/data/users';
import type { Booking, Room } from '@/types';
import { getRankLabel, getRankShort, RANK_COLORS, isOfficerRank, type OfficerRank } from '@/types';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

function timeDisplay(t: string) {
  const [h, m] = t.split(':').map(Number);
  const s = h >= 12 ? 'PM' : 'AM';
  const dh = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${dh}:${String(m).padStart(2, '0')} ${s}`;
}

const STATUS_BADGE: Record<string, string> = {
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ongoing:   'bg-blue-50 text-blue-700 border-blue-200',
  reserved:  'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-gray-50 text-gray-600 border-gray-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
};

interface RescheduleState {
  booking: Booking;
  date: string;
  startTime: string;
  endTime: string;
}

export default function AdminBookings() {
  const { data: allBookings, isLoading } = useBookings();
  const cancelMutation = useCancelBooking();
  const updateMutation = useUpdateBooking();

  const [search, setSearch] = useState('');
  const [reschedule, setReschedule] = useState<RescheduleState | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const roomMap = useMemo(() => {
    const map = new Map<string, Room>();
    allRoomsData.forEach((r) => map.set(r.id, r));
    return map;
  }, []);

  const userMap = useMemo(() => {
    const map = new Map<string, typeof users[0]>();
    users.forEach((u) => map.set(u.id, u));
    return map;
  }, []);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const filtered = useMemo(() => {
    if (!allBookings) return { upcoming: [], past: [], all: [] };
    const q = search.toLowerCase();
    const matching = allBookings.filter((b) => {
      const room = roomMap.get(b.roomId);
      const user = userMap.get(b.userId);
      return (
        !q ||
        b.title.toLowerCase().includes(q) ||
        room?.name.toLowerCase().includes(q) ||
        user?.name.toLowerCase().includes(q) ||
        b.organizer.toLowerCase().includes(q)
      );
    });

    const upcoming = matching
      .filter((b) => b.date >= todayStr && b.status !== 'cancelled')
      .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`));
    const past = matching
      .filter((b) => b.date < todayStr || b.status === 'cancelled' || b.status === 'completed')
      .sort((a, b) => `${b.date}T${b.startTime}`.localeCompare(`${a.date}T${a.startTime}`));
    return { upcoming, past, all: matching };
  }, [allBookings, search, todayStr, roomMap, userMap]);

  const handleRescheduleOpen = (b: Booking) => {
    setReschedule({ booking: b, date: b.date, startTime: b.startTime, endTime: b.endTime });
  };

  const handleRescheduleConfirm = async () => {
    if (!reschedule) return;
    try {
      await updateMutation.mutateAsync({
        id: reschedule.booking.id,
        data: { date: reschedule.date, startTime: reschedule.startTime, endTime: reschedule.endTime },
      });
      toast.success('Booking rescheduled successfully.');
      setReschedule(null);
    } catch {
      toast.error('Failed to reschedule. Please try again.');
    }
  };

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    try {
      await cancelMutation.mutateAsync({ id: cancelTarget.id, reason: 'Cancelled by Admin' });
      toast.success(`"${cancelTarget.title}" has been cancelled.`);
      setCancelDialogOpen(false);
      setCancelTarget(null);
    } catch {
      toast.error('Failed to cancel booking.');
    }
  };

  const BookingRow = ({ booking }: { booking: Booking }) => {
    const room = roomMap.get(booking.roomId);
    const user = userMap.get(booking.userId);
    const isUpcoming = booking.date >= todayStr && booking.status !== 'cancelled' && booking.status !== 'completed';

    const rankBadge = user && isOfficerRank(user.role) ? RANK_COLORS[user.role as OfficerRank] : 'bg-gray-100 text-gray-700 border-gray-200';

    return (
      <div className="rounded-xl border bg-white p-4 space-y-3 hover:shadow-sm transition">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="space-y-0.5 flex-1 min-w-0">
            <p className="font-semibold text-sm text-neutral-800 truncate">{booking.title}</p>
            <p className="text-xs text-neutral-500">by {booking.organizer}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {booking.overriddenBy && (
              <span className="flex items-center gap-1 text-[10px] bg-orange-50 text-orange-700 border border-orange-200 px-1.5 py-0.5 rounded-full">
                <ShieldAlert className="w-2.5 h-2.5" /> Overridden
              </span>
            )}
            {booking.cancelReason && (
              <span className="text-[10px] bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 rounded-full truncate max-w-[140px]" title={booking.cancelReason}>
                {booking.cancelReason}
              </span>
            )}
            <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', STATUS_BADGE[booking.status])}>
              {booking.status}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-neutral-500">
          {room && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{room.name} ({room.tower})</span>}
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(parseISO(booking.date), 'dd MMM yyyy')}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeDisplay(booking.startTime)} – {timeDisplay(booking.endTime)}</span>
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{booking.participantsCount} pax</span>
        </div>

        {user && (
          <div className="flex items-center gap-2">
            <img src={user.avatar} className="w-5 h-5 rounded-full" alt={user.name} />
            <span className="text-xs text-neutral-700">{user.name}</span>
            <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', rankBadge)}>
              {getRankShort(user.role)}
            </span>
          </div>
        )}

        {booking.mom && (
          <div className="text-xs bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-1 text-emerald-700 line-clamp-2">
            MOS: {booking.mom}
          </div>
        )}

        {isUpcoming && (
          <div className="flex gap-2 pt-1 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs h-7 border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={() => handleRescheduleOpen(booking)}
            >
              <RefreshCw className="w-3 h-3" /> Reschedule
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs h-7 border-red-200 text-red-700 hover:bg-red-50"
              onClick={() => { setCancelTarget(booking); setCancelDialogOpen(true); }}
            >
              <XCircle className="w-3 h-3" /> Cancel
            </Button>
          </div>
        )}
      </div>
    );
  };

  const stats = useMemo(() => {
    if (!allBookings) return { total: 0, upcoming: 0, completed: 0, cancelled: 0 };
    return {
      total: allBookings.length,
      upcoming: allBookings.filter((b) => b.date >= todayStr && (b.status === 'confirmed' || b.status === 'reserved' || b.status === 'ongoing')).length,
      completed: allBookings.filter((b) => b.status === 'completed').length,
      cancelled: allBookings.filter((b) => b.status === 'cancelled').length,
    };
  }, [allBookings, todayStr]);

  return (
    <div className="space-y-6">
      <PageHeader title="All Bookings" description="Admin view — manage, reschedule, or override any booking" />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-neutral-800' },
          { label: 'Upcoming', value: stats.upcoming, color: 'text-blue-600' },
          { label: 'Completed', value: stats.completed, color: 'text-emerald-600' },
          { label: 'Cancelled', value: stats.cancelled, color: 'text-red-600' },
        ].map((s) => (
          <Card key={s.label} className="text-center p-4">
            <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
            <p className="text-xs text-neutral-500 mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <Input
          placeholder="Search by title, room, officer..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming" className="gap-1.5">
            Upcoming
            <span className="ml-1 text-xs bg-primary/10 text-primary rounded-full px-1.5">{filtered.upcoming.length}</span>
          </TabsTrigger>
          <TabsTrigger value="past">Past / Cancelled</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="mt-6 text-sm text-neutral-400">Loading all bookings...</div>
        ) : (
          <>
            <TabsContent value="upcoming" className="mt-4">
              {filtered.upcoming.length === 0 ? (
                <div className="text-sm text-neutral-400 py-8 text-center">No upcoming bookings matching search.</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {filtered.upcoming.map((b) => <BookingRow key={b.id} booking={b} />)}
                </div>
              )}
            </TabsContent>
            <TabsContent value="past" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {filtered.past.map((b) => <BookingRow key={b.id} booking={b} />)}
              </div>
            </TabsContent>
            <TabsContent value="all" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {filtered.all.map((b) => <BookingRow key={b.id} booking={b} />)}
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Reschedule Dialog */}
      <Dialog open={!!reschedule} onOpenChange={(open) => !open && setReschedule(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-blue-600" /> Reschedule Booking
            </DialogTitle>
          </DialogHeader>
          {reschedule && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-sm font-semibold">{reschedule.booking.title}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{roomMap.get(reschedule.booking.roomId)?.name}</p>
              </div>

              <div className="space-y-2">
                <Label>New Date</Label>
                <Input
                  type="date"
                  min={format(new Date(), 'yyyy-MM-dd')}
                  value={reschedule.date}
                  onChange={(e) => setReschedule((s) => s ? { ...s, date: e.target.value } : s)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>New Start Time</Label>
                  <Input
                    type="time"
                    value={reschedule.startTime}
                    onChange={(e) => setReschedule((s) => s ? { ...s, startTime: e.target.value } : s)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>New End Time</Label>
                  <Input
                    type="time"
                    value={reschedule.endTime}
                    onChange={(e) => setReschedule((s) => s ? { ...s, endTime: e.target.value } : s)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-100 text-xs text-amber-700">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                Admin reschedule overrides the 30-minute buffer rule. Please verify manually.
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReschedule(null)}>Cancel</Button>
            <Button onClick={handleRescheduleConfirm} disabled={updateMutation.isPending} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              {updateMutation.isPending ? 'Rescheduling...' : 'Confirm Reschedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" /> Cancel Booking
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-neutral-700">
            Are you sure you want to cancel <span className="font-semibold">"{cancelTarget?.title}"</span>?
            This will notify the booking officer.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>Keep Booking</Button>
            <Button variant="destructive" onClick={handleCancelConfirm} disabled={cancelMutation.isPending}>
              {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
