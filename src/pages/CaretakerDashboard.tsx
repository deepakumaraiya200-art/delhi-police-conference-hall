import React, { useMemo, useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/common/EmptyState';
import { BookingModal } from '@/components/booking/BookingModal';
import {
  Calendar, CheckCircle2, Clock, MapPin, Users, Building2, CalendarCheck,
  Home, Wrench, ChevronDown, AlertCircle, X, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useBookings, useMarkBookingComplete, useMarkBookingOngoing, useSubmitMOS } from '@/hooks/useBookings';
import { useRooms, useUpdateRoomStatus } from '@/hooks/useRooms';
import { useUserStore } from '@/store/userStore';
import type { Booking, Room, RoomStatus } from '@/types';
import {
  format, parseISO,
  startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  addDays, addWeeks, addMonths, subDays, subWeeks, subMonths,
  eachDayOfInterval, isToday as dateFnsIsToday,
} from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

function timeDisplay(t: string) {
  const [h, m] = t.split(':').map(Number);
  const s = h >= 12 ? 'PM' : 'AM';
  const dh = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${dh}:${String(m).padStart(2, '0')} ${s}`;
}

const ROOM_STATUS_OPTIONS: { value: RoomStatus; label: string; color: string }[] = [
  { value: 'available',         label: 'Available',         color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { value: 'occupied',          label: 'Occupied',          color: 'text-red-700 bg-red-50 border-red-200' },
  { value: 'reserved',          label: 'Reserved',          color: 'text-amber-700 bg-amber-50 border-amber-200' },
  { value: 'under_maintenance', label: 'Under Maintenance', color: 'text-slate-700 bg-slate-100 border-slate-300' },
];

function roomStatusColor(status: RoomStatus) {
  return ROOM_STATUS_OPTIONS.find((o) => o.value === status)?.color ?? 'text-neutral-600 bg-neutral-50 border-neutral-200';
}

function roomBorderColor(status: RoomStatus) {
  if (status === 'available') return 'border-l-emerald-500';
  if (status === 'occupied') return 'border-l-red-500';
  if (status === 'reserved') return 'border-l-amber-500';
  return 'border-l-slate-400';
}

const BOOKING_STATUS_COLORS: Record<string, string> = {
  confirmed:  'bg-emerald-50 border-emerald-200 text-emerald-700',
  ongoing:    'bg-blue-50 border-blue-200 text-blue-700',
  reserved:   'bg-amber-50 border-amber-200 text-amber-700',
  completed:  'bg-gray-50 border-gray-200 text-gray-600',
  cancelled:  'bg-red-50 border-red-200 text-red-600',
};

// ── Meeting Completion Popup ──────────────────────────────────────────────────

interface CompletionPopupProps {
  booking: Booking;
  room?: Room;
  onComplete: () => void;
  onOngoing: () => void;
  onDismiss: () => void;
}

function CompletionPopup({ booking, room, onComplete, onOngoing, onDismiss }: CompletionPopupProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-[420px] max-w-full overflow-hidden">
        <div className="bg-[#065f46] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-emerald-300" />
            <p className="text-white font-semibold text-sm">Meeting Status Update</p>
          </div>
          <button onClick={onDismiss} className="text-white/60 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <p className="text-sm font-semibold text-neutral-800">{booking.title}</p>
            <p className="text-xs text-neutral-500">
              {room?.name} · {format(parseISO(booking.date), 'dd MMM yyyy')} · {timeDisplay(booking.startTime)} – {timeDisplay(booking.endTime)}
            </p>
          </div>
          <p className="text-sm text-neutral-700">
            The scheduled end time for this meeting has passed. Please update its status:
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onComplete}
              className="flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition"
            >
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700">Yes, Completed</span>
              <span className="text-[10px] text-emerald-600 text-center">Meeting ended successfully</span>
            </button>
            <button
              onClick={onOngoing}
              className="flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 transition"
            >
              <Clock className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">No, Still Ongoing</span>
              <span className="text-[10px] text-blue-600 text-center">Meeting is still in progress</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Room Status Control ───────────────────────────────────────────────────────

function RoomStatusControl({ room, onUpdate }: { room: Room; onUpdate: (status: RoomStatus) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className={cn(
          'flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-full border transition',
          roomStatusColor(room.status)
        )}
      >
        {ROOM_STATUS_OPTIONS.find((o) => o.value === room.status)?.label ?? room.status}
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-7 z-20 bg-white border border-neutral-100 rounded-xl shadow-xl overflow-hidden min-w-[170px]">
            {ROOM_STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onUpdate(opt.value); setOpen(false); }}
                className={cn(
                  'w-full text-left px-3 py-2 text-xs font-medium transition hover:bg-neutral-50',
                  room.status === opt.value ? 'bg-neutral-50 font-semibold' : ''
                )}
              >
                <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-semibold', opt.color)}>
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Caretaker Hero Banner ─────────────────────────────────────────────────────

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
        <div className="flex gap-2">
          <div className="flex flex-col items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2.5 min-w-[70px]">
            <span className="text-emerald-300 font-bold text-lg leading-none">{roomCount}</span>
            <span className="text-white/60 text-[10px] mt-0.5">My Rooms</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function CaretakerDashboard() {
  const { currentUser } = useUserStore();
  const { data: allBookings, isLoading } = useBookings();
  const { data: allRooms } = useRooms();
  const markCompleteMutation = useMarkBookingComplete();
  const markOngoingMutation = useMarkBookingOngoing();
  const updateRoomStatusMutation = useUpdateRoomStatus();

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [completionTarget, setCompletionTarget] = useState<Booking | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [editingMosId, setEditingMosId] = useState<string | null>(null);
  const [mosText, setMosText] = useState('');
  const submitMosMutation = useSubmitMOS();

  const [scheduleView, setScheduleView] = useState<'day' | 'week' | 'month'>('week');
  const [scheduleRef, setScheduleRef] = useState(new Date());

  const assignedRoomIds = currentUser?.assignedRooms ?? [];

  const myRooms = useMemo(() => {
    const source = allRooms ?? [];
    return source.filter((r) => assignedRoomIds.includes(r.id));
  }, [allRooms, assignedRoomIds]);

  const roomMap = useMemo(() => {
    const map = new Map<string, Room>();
    myRooms.forEach((r) => map.set(r.id, r));
    return map;
  }, [myRooms]);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const nowStr = format(new Date(), 'HH:mm');

  const { upcoming, past, pendingCompletion } = useMemo(() => {
    if (!allBookings) return { upcoming: [], past: [], pendingCompletion: [] };

    const mine = allBookings.filter((b) => assignedRoomIds.includes(b.roomId));

    // Meetings that need caretaker to mark complete/ongoing
    const pendingCompletion = mine.filter((b) =>
      !dismissedIds.has(b.id) &&
      (b.status === 'confirmed' || b.status === 'ongoing' || b.status === 'reserved') &&
      (b.date < todayStr || (b.date === todayStr && b.endTime < nowStr))
    );

    const upcoming = mine
      .filter((b) =>
        (b.status === 'confirmed' || b.status === 'reserved' || b.status === 'ongoing') &&
        (b.date > todayStr || (b.date === todayStr && b.endTime >= nowStr))
      )
      .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`));

    const past = mine
      .filter((b) => b.status === 'completed' || b.status === 'cancelled')
      .sort((a, b) => `${b.date}T${b.startTime}`.localeCompare(`${a.date}T${a.startTime}`));

    return { upcoming, past, pendingCompletion };
  }, [allBookings, assignedRoomIds, todayStr, nowStr, dismissedIds]);

  // Auto-show first pending completion popup
  const activeCompletion = completionTarget ?? (pendingCompletion.length > 0 ? pendingCompletion[0] : null);

  const handleRoomStatusUpdate = (roomId: string, status: RoomStatus) => {
    updateRoomStatusMutation.mutate(
      { roomId, status },
      {
        onSuccess: () => toast.success(`Room status updated to "${status.replace('_', ' ')}"`),
        onError: () => toast.error('Failed to update room status'),
      }
    );
  };

  const handleMarkComplete = (booking: Booking) => {
    markCompleteMutation.mutate(booking.id, {
      onSuccess: () => {
        toast.success(`"${booking.title}" marked as completed`);
        setCompletionTarget(null);
        setDismissedIds((p) => new Set([...p, booking.id]));
      },
      onError: () => toast.error('Failed to update booking'),
    });
  };

  const handleMarkOngoing = (booking: Booking) => {
    markOngoingMutation.mutate(booking.id, {
      onSuccess: () => {
        toast.info(`"${booking.title}" marked as ongoing`);
        setCompletionTarget(null);
        setDismissedIds((p) => new Set([...p, booking.id]));
      },
      onError: () => toast.error('Failed to update booking'),
    });
  };

  const roomStatusCounts = useMemo(() => ({
    available:          myRooms.filter((r) => r.status === 'available').length,
    occupied:           myRooms.filter((r) => r.status === 'occupied').length,
    reserved:           myRooms.filter((r) => r.status === 'reserved').length,
    under_maintenance:  myRooms.filter((r) => r.status === 'under_maintenance').length,
  }), [myRooms]);

  const scheduleRange = useMemo(() => {
    if (scheduleView === 'day') {
      const d = format(scheduleRef, 'yyyy-MM-dd');
      return { rangeStart: d, rangeEnd: d, label: format(scheduleRef, 'EEEE, d MMM yyyy') };
    }
    if (scheduleView === 'week') {
      const start = startOfWeek(scheduleRef, { weekStartsOn: 1 });
      const end   = endOfWeek(scheduleRef,   { weekStartsOn: 1 });
      return {
        rangeStart: format(start, 'yyyy-MM-dd'),
        rangeEnd:   format(end,   'yyyy-MM-dd'),
        label: `${format(start, 'd MMM')} – ${format(end, 'd MMM yyyy')}`,
      };
    }
    const start = startOfMonth(scheduleRef);
    const end   = endOfMonth(scheduleRef);
    return {
      rangeStart: format(start, 'yyyy-MM-dd'),
      rangeEnd:   format(end,   'yyyy-MM-dd'),
      label: format(scheduleRef, 'MMMM yyyy'),
    };
  }, [scheduleView, scheduleRef]);

  const scheduleByRoom = useMemo(() => {
    const { rangeStart, rangeEnd } = scheduleRange;
    return myRooms.map((room) => ({
      room,
      bookings: (allBookings ?? [])
        .filter((b) =>
          b.roomId === room.id &&
          b.date >= rangeStart &&
          b.date <= rangeEnd &&
          b.status !== 'cancelled'
        )
        .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`)),
    }));
  }, [allBookings, myRooms, scheduleRange]);

  const navigateSchedule = (direction: -1 | 1) => {
    setScheduleRef((prev) => {
      if (scheduleView === 'day')   return direction === 1 ? addDays(prev, 1)   : subDays(prev, 1);
      if (scheduleView === 'week')  return direction === 1 ? addWeeks(prev, 1)  : subWeeks(prev, 1);
      return direction === 1 ? addMonths(prev, 1) : subMonths(prev, 1);
    });
  };

  return (
    <div className="space-y-6">
      {/* Completion popup — show the first pending one */}
      {activeCompletion && (
        <CompletionPopup
          booking={activeCompletion}
          room={roomMap.get(activeCompletion.roomId)}
          onComplete={() => handleMarkComplete(activeCompletion)}
          onOngoing={() => handleMarkOngoing(activeCompletion)}
          onDismiss={() => {
            setCompletionTarget(null);
            setDismissedIds((p) => new Set([...p, activeCompletion.id]));
          }}
        />
      )}

      <CaretakerHeroBanner name={currentUser?.name ?? 'Caretaker'} roomCount={myRooms.length} />

      <PageHeader
        title="Caretaker Portal"
        description={`Managing ${myRooms.length} conference hall${myRooms.length !== 1 ? 's' : ''} — update room status and track meetings`}
      >
        {pendingCompletion.length > 0 && (
          <button
            onClick={() => setCompletionTarget(pendingCompletion[0])}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold hover:bg-amber-100 transition animate-pulse"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            {pendingCompletion.length} meeting{pendingCompletion.length > 1 ? 's need' : ' needs'} status update
          </button>
        )}
      </PageHeader>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Rooms',             value: myRooms.length,                   color: 'text-neutral-700' },
          { label: 'Available',         value: roomStatusCounts.available,         color: 'text-emerald-600' },
          { label: 'Occupied',          value: roomStatusCounts.occupied,          color: 'text-red-600' },
          { label: 'Maintenance',       value: roomStatusCounts.under_maintenance, color: 'text-slate-600' },
        ].map(({ label, value, color }) => (
          <Card key={label} className="text-center p-4">
            <p className={cn('text-2xl font-bold', color)}>{value}</p>
            <p className="text-xs text-neutral-500 mt-1">{label}</p>
          </Card>
        ))}
      </div>

      {/* Room status grid with controls */}
      <div>
        <h2 className="text-base font-semibold mb-3">My Rooms — Status Control</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {myRooms.map((room) => (
            <div
              key={room.id}
              className={cn('rounded-xl border border-l-4 bg-white p-3 space-y-2', roomBorderColor(room.status))}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-sm text-neutral-800 leading-tight">{room.name}</p>
                <RoomStatusControl room={room} onUpdate={(s) => handleRoomStatusUpdate(room.id, s)} />
              </div>
              <div className="flex items-center gap-1 text-xs text-neutral-500">
                <Building2 className="w-3 h-3" /> {room.tower} · {room.floor}
              </div>
              <div className="flex items-center gap-1 text-xs text-neutral-500">
                <Users className="w-3 h-3" /> {room.capacity.min}–{room.capacity.max} pax
              </div>
              {room.status === 'under_maintenance' && (
                <div className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-50 rounded px-1.5 py-0.5">
                  <Wrench className="w-3 h-3" /> Under maintenance
                </div>
              )}
            </div>
          ))}
          {myRooms.length === 0 && (
            <p className="col-span-full text-sm text-neutral-400 text-center py-8">No rooms assigned to your account.</p>
          )}
        </div>
      </div>

      {/* Meetings tabs */}
      <Tabs defaultValue="upcoming">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-semibold">Meetings in My Rooms</h2>
          <TabsList>
            <TabsTrigger value="upcoming" className="gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Upcoming
              {upcoming.length > 0 && (
                <span className="ml-1 text-xs bg-primary/10 text-primary rounded-full px-1.5">{upcoming.length}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="schedule" className="gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Schedule
            </TabsTrigger>
            <TabsTrigger value="past" className="gap-1.5">
              <CalendarCheck className="w-3.5 h-3.5" /> Past
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
              {upcoming.map((b) => {
                const room = roomMap.get(b.roomId);
                const isToday = b.date === todayStr;
                return (
                  <div
                    key={b.id}
                    className="rounded-xl border bg-white p-4 space-y-2 hover:shadow-md transition cursor-pointer"
                    onClick={() => { setSelectedBooking(b); setModalOpen(true); }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-sm text-neutral-800 leading-tight line-clamp-2">{b.title}</p>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize', BOOKING_STATUS_COLORS[b.status])}>
                          {b.status}
                        </span>
                        {isToday && <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-full">Today</span>}
                      </div>
                    </div>
                    {room && (
                      <div className="flex items-center gap-1 text-xs text-neutral-500">
                        <MapPin className="w-3 h-3" /> {room.name} · {room.floor}
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-xs text-neutral-500">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(parseISO(b.date), 'dd MMM yyyy')}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeDisplay(b.startTime)} – {timeDisplay(b.endTime)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-neutral-500">
                      <Users className="w-3 h-3" /> {b.participantsCount} participants · {b.organizer}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── Schedule Tab ─────────────────────────────────────────── */}
        <TabsContent value="schedule" className="mt-0">
          {/* View toggle + date navigator */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            <div className="flex rounded-lg border border-neutral-200 overflow-hidden text-xs font-semibold">
              {(['day', 'week', 'month'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => { setScheduleView(v); setScheduleRef(new Date()); }}
                  className={cn(
                    'px-3 py-1.5 capitalize transition',
                    scheduleView === v
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-neutral-600 hover:bg-neutral-50'
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateSchedule(-1)}
                className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition"
              >
                <ChevronLeft className="w-4 h-4 text-neutral-600" />
              </button>
              <span className="text-sm font-semibold text-neutral-700 min-w-[180px] text-center">
                {scheduleRange.label}
              </span>
              <button
                onClick={() => navigateSchedule(1)}
                className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition"
              >
                <ChevronRight className="w-4 h-4 text-neutral-600" />
              </button>
              <button
                onClick={() => setScheduleRef(new Date())}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-neutral-200 hover:bg-neutral-50 transition text-neutral-600"
              >
                Today
              </button>
            </div>
          </div>

          {/* Per-room schedule */}
          {myRooms.length === 0 ? (
            <EmptyState icon={Building2} title="No rooms assigned" description="No rooms are assigned to your account." />
          ) : (
            <div className="space-y-4">
              {scheduleByRoom.map(({ room, bookings: roomBkgs }) => (
                <div key={room.id} className={cn('rounded-xl border border-l-4 bg-white overflow-hidden', roomBorderColor(room.status))}>
                  {/* Room header */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-50 border-b">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                      <span className="text-sm font-semibold text-neutral-800">{room.name}</span>
                      <span className="text-xs text-neutral-400">· {room.floor} · {room.tower}</span>
                    </div>
                    <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize', roomStatusColor(room.status))}>
                      {room.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Bookings list */}
                  {roomBkgs.length === 0 ? (
                    <p className="text-xs text-neutral-400 text-center py-4">No meetings scheduled</p>
                  ) : (
                    <div className="divide-y">
                      {roomBkgs.map((b) => {
                        const isCurrentDay = b.date === todayStr;
                        return (
                          <div
                            key={b.id}
                            className={cn(
                              'flex items-start gap-3 px-4 py-3 hover:bg-neutral-50 transition cursor-pointer',
                              isCurrentDay && 'bg-blue-50/40'
                            )}
                            onClick={() => { setSelectedBooking(b); setModalOpen(true); }}
                          >
                            {/* Date column */}
                            <div className="w-14 shrink-0 text-center">
                              <p className="text-[10px] text-neutral-400 uppercase">{format(parseISO(b.date), 'EEE')}</p>
                              <p className={cn('text-base font-bold leading-tight', isCurrentDay ? 'text-blue-600' : 'text-neutral-700')}>
                                {format(parseISO(b.date), 'd')}
                              </p>
                              <p className="text-[10px] text-neutral-400">{format(parseISO(b.date), 'MMM')}</p>
                            </div>
                            {/* Divider */}
                            <div className="w-px self-stretch bg-neutral-200 shrink-0" />
                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-semibold text-neutral-800 leading-tight line-clamp-1">{b.title}</p>
                                <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize shrink-0', BOOKING_STATUS_COLORS[b.status])}>
                                  {b.status}
                                </span>
                              </div>
                              <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1">
                                <Clock className="w-3 h-3 shrink-0" />
                                {timeDisplay(b.startTime)} – {timeDisplay(b.endTime)}
                              </p>
                              <p className="text-xs text-neutral-500 flex items-center gap-1">
                                <Users className="w-3 h-3 shrink-0" />
                                {b.organizer} · {b.participantsCount} participants
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-0">
          {isLoading ? (
            <div className="text-sm text-neutral-400 p-4">Loading...</div>
          ) : past.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="No past meetings" description="Completed and cancelled meetings appear here." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {past.map((b) => {
                const room = roomMap.get(b.roomId);
                const isEditing = editingMosId === b.id;
                return (
                  <div
                    key={b.id}
                    className="rounded-xl border bg-white p-4 space-y-2 hover:shadow-md transition opacity-90"
                  >
                    <div
                      className="cursor-pointer"
                      onClick={() => { setSelectedBooking(b); setModalOpen(true); }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-sm text-neutral-800 leading-tight line-clamp-2">{b.title}</p>
                        <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize shrink-0', BOOKING_STATUS_COLORS[b.status])}>
                          {b.status}
                        </span>
                      </div>
                      {room && (
                        <div className="flex items-center gap-1 text-xs text-neutral-500 mt-1">
                          <MapPin className="w-3 h-3" /> {room.name}
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(parseISO(b.date), 'dd MMM yyyy')}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeDisplay(b.startTime)} – {timeDisplay(b.endTime)}</span>
                      </div>
                    </div>

                    {/* MOS — Meeting Notes (caretaker only, completed meetings) */}
                    {b.status === 'completed' && (
                      <div className="pt-2 border-t border-neutral-100">
                        {b.mom ? (
                          <div className="space-y-1">
                            <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">Meeting Notes (MOS)</p>
                            <p className="text-xs text-neutral-700 leading-relaxed whitespace-pre-wrap">{b.mom}</p>
                          </div>
                        ) : isEditing ? (
                          <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                            <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">Add Meeting Notes (MOS)</p>
                            <textarea
                              value={mosText}
                              onChange={(e) => setMosText(e.target.value)}
                              placeholder="Summarise what was discussed, decisions made, action items…"
                              rows={3}
                              className="w-full text-xs border border-neutral-200 rounded-lg px-2.5 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                            <div className="flex gap-2">
                              <button
                                disabled={!mosText.trim() || submitMosMutation.isPending}
                                onClick={() => submitMosMutation.mutate(
                                  { id: b.id, mom: mosText },
                                  {
                                    onSuccess: () => { toast.success('Meeting notes saved'); setEditingMosId(null); setMosText(''); },
                                    onError: () => toast.error('Failed to save notes'),
                                  }
                                )}
                                className="flex-1 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50 transition"
                              >
                                {submitMosMutation.isPending ? 'Saving…' : 'Save Notes'}
                              </button>
                              <button
                                onClick={() => { setEditingMosId(null); setMosText(''); }}
                                className="px-3 py-1.5 rounded-lg border border-neutral-200 text-xs text-neutral-600 hover:bg-neutral-50 transition"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingMosId(b.id); setMosText(''); }}
                            className="w-full text-xs py-1.5 rounded-lg border border-dashed border-emerald-300 text-emerald-700 hover:bg-emerald-50 transition font-medium"
                          >
                            + Add Meeting Notes (MOS)
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
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
