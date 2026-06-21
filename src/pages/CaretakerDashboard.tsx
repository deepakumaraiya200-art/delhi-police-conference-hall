import React, { useMemo } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/common/EmptyState';
import { BookingModal } from '@/components/booking/BookingModal';
import {
  Calendar, CheckCircle2, Clock, MapPin, Users, Building2, CalendarCheck, Home,
} from 'lucide-react';
import { useBookings } from '@/hooks/useBookings';
import { useUserStore } from '@/store/userStore';
import { rooms as allRoomsData } from '@/data/rooms';
import type { Booking, Room } from '@/types';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

function timeDisplay(t: string) {
  const [h, m] = t.split(':').map(Number);
  const s = h >= 12 ? 'PM' : 'AM';
  const dh = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${dh}:${String(m).padStart(2, '0')} ${s}`;
}

function RoomMeetingCard({ booking, room, onView }: { booking: Booking; room?: Room; onView: () => void }) {
  const isToday = booking.date === format(new Date(), 'yyyy-MM-dd');
  const statusColors: Record<string, string> = {
    confirmed: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    pending: 'bg-amber-50 border-amber-200 text-amber-700',
    completed: 'bg-gray-50 border-gray-200 text-gray-600',
    cancelled: 'bg-red-50 border-red-200 text-red-600',
  };
  return (
    <div
      className="rounded-xl border bg-white p-4 space-y-2 hover:shadow-md transition cursor-pointer"
      onClick={onView}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-sm text-neutral-800 leading-tight line-clamp-2">{booking.title}</p>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', statusColors[booking.status])}>
            {booking.status}
          </span>
          {isToday && <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-full">Today</span>}
        </div>
      </div>
      {room && (
        <div className="flex items-center gap-1 text-xs text-neutral-500">
          <MapPin className="w-3 h-3" />
          {room.name} · {room.floor}
        </div>
      )}
      <div className="flex items-center gap-3 text-xs text-neutral-500">
        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(parseISO(booking.date), 'dd MMM yyyy')}</span>
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeDisplay(booking.startTime)} – {timeDisplay(booking.endTime)}</span>
      </div>
      <div className="flex items-center gap-1 text-xs text-neutral-500">
        <Users className="w-3 h-3" /> {booking.participantsCount} participants · {booking.organizer}
      </div>
      {booking.mom && (
        <div className="text-xs bg-blue-50 border border-blue-100 rounded-lg px-2 py-1 text-blue-700">
          MOM submitted
        </div>
      )}
    </div>
  );
}

function CaretakerHeroBanner({ name, roomCount }: { name: string; roomCount: number }) {
  return (
    <div className="relative overflow-hidden rounded-2xl mb-6"
      style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 45%, #047857 100%)' }}>
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="ctGrid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
              <rect x="14" y="14" width="4" height="4" rx="1" fill="#6ee7b7" />
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#ffffff" strokeWidth="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ctGrid)" />
        </svg>
      </div>
      <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full border-4 border-emerald-300/20" />
      <div className="absolute -right-4 -top-4 w-40 h-40 rounded-full border-2 border-emerald-200/10" />
      <div className="absolute -left-8 -bottom-8 w-36 h-36 rounded-full border border-white/10" />

      <div className="relative z-10 px-6 py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-300/20 border border-emerald-300/40 backdrop-blur-sm">
            <Home className="w-7 h-7 text-emerald-300" />
          </div>
          <div>
            <p className="text-emerald-300 text-xs font-semibold tracking-widest uppercase mb-0.5">Facilities Management</p>
            <h2 className="text-white text-xl font-bold leading-tight">Welcome, {name}</h2>
            <p className="text-emerald-100/70 text-sm mt-0.5">Room Caretaker · Delhi Police PHQ</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="flex flex-col items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2.5 min-w-[70px]">
            <span className="text-emerald-300 font-bold text-lg leading-none">{roomCount}</span>
            <span className="text-white/60 text-[10px] mt-0.5">My Rooms</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CaretakerDashboard() {
  const { currentUser } = useUserStore();
  const { data: allBookings, isLoading } = useBookings();
  const [selectedBooking, setSelectedBooking] = React.useState<Booking | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  const assignedRoomIds = currentUser?.assignedRooms ?? [];
  const myRooms = useMemo(
    () => allRoomsData.filter((r) => assignedRoomIds.includes(r.id)),
    [assignedRoomIds]
  );

  const roomMap = useMemo(() => {
    const map = new Map<string, Room>();
    myRooms.forEach((r) => map.set(r.id, r));
    return map;
  }, [myRooms]);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const { upcoming, completed } = useMemo(() => {
    if (!allBookings) return { upcoming: [], completed: [] };
    const mine = allBookings.filter((b) => assignedRoomIds.includes(b.roomId));
    const upcoming = mine
      .filter((b) => (b.status === 'confirmed' || b.status === 'pending') && b.date >= todayStr)
      .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`));
    const completed = mine
      .filter((b) => b.status === 'completed' || (b.status === 'cancelled'))
      .sort((a, b) => `${b.date}T${b.startTime}`.localeCompare(`${a.date}T${a.startTime}`));
    return { upcoming, completed };
  }, [allBookings, assignedRoomIds, todayStr]);

  const roomStatusCounts = useMemo(() => {
    const available = myRooms.filter((r) => r.status === 'available').length;
    const occupied = myRooms.filter((r) => r.status === 'occupied').length;
    const reserved = myRooms.filter((r) => r.status === 'reserved').length;
    return { available, occupied, reserved };
  }, [myRooms]);

  return (
    <div className="space-y-6">
      <CaretakerHeroBanner name={currentUser?.name ?? 'Caretaker'} roomCount={myRooms.length} />
      <PageHeader
        title="Caretaker Portal"
        description={`Managing ${myRooms.length} conference halls — see upcoming meetings and room status`}
      />

      {/* Room overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <p className="text-2xl font-bold text-neutral-800">{myRooms.length}</p>
          <p className="text-xs text-neutral-500 mt-1">Rooms Assigned</p>
        </Card>
        <Card className="text-center p-4">
          <p className="text-2xl font-bold text-emerald-600">{roomStatusCounts.available}</p>
          <p className="text-xs text-neutral-500 mt-1">Available</p>
        </Card>
        <Card className="text-center p-4">
          <p className="text-2xl font-bold text-red-600">{roomStatusCounts.occupied}</p>
          <p className="text-xs text-neutral-500 mt-1">Occupied</p>
        </Card>
        <Card className="text-center p-4">
          <p className="text-2xl font-bold text-amber-600">{roomStatusCounts.reserved}</p>
          <p className="text-xs text-neutral-500 mt-1">Reserved</p>
        </Card>
      </div>

      {/* Room status grid */}
      <div>
        <h2 className="text-base font-semibold mb-3">My Rooms Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {myRooms.map((room) => {
            const statusColors = {
              available: 'border-l-emerald-500 bg-emerald-50/30',
              occupied: 'border-l-red-500 bg-red-50/30',
              reserved: 'border-l-amber-500 bg-amber-50/30',
            };
            return (
              <div key={room.id} className={cn('rounded-xl border border-l-4 bg-white p-3 space-y-1', statusColors[room.status])}>
                <div className="flex items-start justify-between">
                  <p className="font-semibold text-sm text-neutral-800 leading-tight">{room.name}</p>
                  <Badge
                    variant={room.status === 'available' ? 'success' : room.status === 'occupied' ? 'destructive' : 'warning'}
                    className="text-[10px] shrink-0"
                  >
                    {room.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-xs text-neutral-500">
                  <Building2 className="w-3 h-3" /> {room.tower} · {room.floor}
                </div>
                <div className="flex items-center gap-1 text-xs text-neutral-500">
                  <Users className="w-3 h-3" /> {room.capacity.min}–{room.capacity.max} pax
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Meetings tabs */}
      <Tabs defaultValue="upcoming">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-semibold">Meetings in My Rooms</h2>
          <TabsList>
            <TabsTrigger value="upcoming" className="gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Upcoming
              {upcoming.length > 0 && (
                <span className="ml-1 text-xs bg-primary/10 text-primary rounded-full px-1.5">{upcoming.length}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-1.5">
              <CalendarCheck className="w-3.5 h-3.5" />
              Past
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="upcoming" className="mt-0">
          {isLoading ? (
            <div className="text-sm text-neutral-400 p-4">Loading...</div>
          ) : upcoming.length === 0 ? (
            <EmptyState icon={Calendar} title="No upcoming meetings" description="No meetings scheduled in your rooms." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {upcoming.map((b) => (
                <RoomMeetingCard key={b.id} booking={b} room={roomMap.get(b.roomId)} onView={() => { setSelectedBooking(b); setModalOpen(true); }} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-0">
          {isLoading ? (
            <div className="text-sm text-neutral-400 p-4">Loading...</div>
          ) : completed.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="No past meetings" description="Completed meetings will appear here." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {completed.map((b) => (
                <RoomMeetingCard key={b.id} booking={b} room={roomMap.get(b.roomId)} onView={() => { setSelectedBooking(b); setModalOpen(true); }} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <BookingModal
        booking={selectedBooking}
        room={selectedBooking ? roomMap.get(selectedBooking.roomId) : undefined}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
