import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Users, MapPin, Clock, Layers, Wrench, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Room, RoomStatus, Booking } from '@/types';
import { useRooms } from '@/hooks/useRooms';
import { useUpcomingBookings } from '@/hooks/useBookings';
import { format } from 'date-fns';

// ── helpers ──────────────────────────────────────────────────────────────────

function toMins(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function fmtTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const s = h >= 12 ? 'PM' : 'AM';
  const dh = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${dh}:${String(m).padStart(2, '0')} ${s}`;
}

interface RoomSnapshot {
  room: Room;
  status: RoomStatus;
  activeBooking?: Booking;
  nextBooking?: Booking;
}

function computeSnapshot(room: Room, bookings: Booking[], date: string, time: string): RoomSnapshot {
  if (room.status === 'under_maintenance') return { room, status: 'under_maintenance' };

  const t = toMins(time);
  const dayBookings = bookings
    .filter((b) => b.roomId === room.id && b.date === date && b.status !== 'cancelled')
    .sort((a, b) => toMins(a.startTime) - toMins(b.startTime));

  const active = dayBookings.find((b) => toMins(b.startTime) <= t && t < toMins(b.endTime));
  if (active) return { room, status: 'occupied', activeBooking: active };

  const next = dayBookings.find((b) => toMins(b.startTime) > t);
  if (next) return { room, status: 'reserved', nextBooking: next };

  return { room, status: 'available' };
}

// ── status config ─────────────────────────────────────────────────────────────

const STATUS: Record<RoomStatus, { bg: string; dot: string; text: string; label: string; cardBg: string; ring: string }> = {
  available: {
    bg: 'bg-emerald-500', dot: 'bg-emerald-500', text: 'text-emerald-700',
    label: 'Available', cardBg: 'bg-emerald-50 border-emerald-200', ring: 'ring-emerald-500/20',
  },
  occupied: {
    bg: 'bg-red-500', dot: 'bg-red-500', text: 'text-red-700',
    label: 'Occupied', cardBg: 'bg-red-50 border-red-200', ring: 'ring-red-500/20',
  },
  reserved: {
    bg: 'bg-amber-500', dot: 'bg-amber-500', text: 'text-amber-700',
    label: 'Reserved', cardBg: 'bg-amber-50 border-amber-200', ring: 'ring-amber-500/20',
  },
  under_maintenance: {
    bg: 'bg-slate-500', dot: 'bg-slate-400', text: 'text-slate-600',
    label: 'Maintenance', cardBg: 'bg-slate-50 border-slate-200', ring: 'ring-slate-400/20',
  },
};

// ── main component ─────────────────────────────────────────────────────────────

export default function LiveAvailabilityPage() {
  const { data: rooms = [], isLoading: roomsLoading } = useRooms();
  const { data: upcomingBookings = [] } = useUpcomingBookings();

  // Time-picker state
  const [timeMode, setTimeMode] = useState<'live' | 'custom'>('live');
  const [pickerDate, setPickerDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [pickerTime, setPickerTime] = useState(format(new Date(), 'HH:mm'));

  // Current live time (for "now" label)
  const nowDate = format(new Date(), 'yyyy-MM-dd');
  const nowTime = format(new Date(), 'HH:mm');

  const displayDate = timeMode === 'live' ? nowDate : pickerDate;
  const displayTime = timeMode === 'live' ? nowTime : pickerTime;

  // Build snapshots
  const snapshots: RoomSnapshot[] = useMemo(() => {
    if (timeMode === 'live') {
      // Live mode: use actual DB room status, but enrich with booking context
      return rooms.map((room) => {
        if (room.status === 'under_maintenance') return { room, status: 'under_maintenance' };
        // Show any active booking for context
        const t = toMins(nowTime);
        const dayBkgs = upcomingBookings
          .filter((b) => b.roomId === room.id && b.date === nowDate && b.status !== 'cancelled')
          .sort((a, b2) => toMins(a.startTime) - toMins(b2.startTime));
        const active = dayBkgs.find((b) => toMins(b.startTime) <= t && t < toMins(b.endTime));
        const next   = dayBkgs.find((b) => toMins(b.startTime) > t);
        return { room, status: room.status, activeBooking: active, nextBooking: next };
      });
    }
    // Custom time: compute from bookings
    return rooms.map((room) => computeSnapshot(room, upcomingBookings, displayDate, displayTime));
  }, [rooms, upcomingBookings, timeMode, displayDate, displayTime, nowDate, nowTime]);

  const counts = useMemo(() => ({
    available:         snapshots.filter((s) => s.status === 'available').length,
    occupied:          snapshots.filter((s) => s.status === 'occupied').length,
    reserved:          snapshots.filter((s) => s.status === 'reserved').length,
    under_maintenance: snapshots.filter((s) => s.status === 'under_maintenance').length,
  }), [snapshots]);

  const isProjected = timeMode === 'custom';

  return (
    <div className="space-y-6">
      <PageHeader title="Live Availability" description="">
        <div className="flex items-center gap-2">
          {!isProjected && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              Live
            </div>
          )}
        </div>
      </PageHeader>

      {/* Controls bar */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Legend + counts */}
            <div className="flex flex-wrap items-center gap-4">
              {(Object.entries(STATUS) as [RoomStatus, typeof STATUS.available][]).map(([s, cfg]) => (
                <div key={s} className="flex items-center gap-1.5">
                  <span className={cn('w-2.5 h-2.5 rounded-full', cfg.dot)} />
                  <span className="text-xs font-semibold" style={{ color: 'inherit' }}>
                    <span className={cn('font-bold', cfg.text)}>
                      {counts[s]}
                    </span>
                    <span className="text-muted-foreground ml-1">{cfg.label}</span>
                  </span>
                </div>
              ))}
            </div>

            {/* Time picker toggle */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex rounded-lg border border-neutral-200 overflow-hidden text-xs font-semibold">
                <button
                  onClick={() => setTimeMode('live')}
                  className={cn(
                    'px-3 py-1.5 flex items-center gap-1.5 transition',
                    timeMode === 'live' ? 'bg-emerald-600 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50'
                  )}
                >
                  <span className="relative flex h-2 w-2">
                    {timeMode === 'live' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />}
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
                  </span>
                  Now
                </button>
                <button
                  onClick={() => setTimeMode('custom')}
                  className={cn(
                    'px-3 py-1.5 flex items-center gap-1.5 transition',
                    timeMode === 'custom' ? 'bg-violet-600 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50'
                  )}
                >
                  <Calendar className="w-3 h-3" />
                  Time View
                </button>
              </div>

              {timeMode === 'custom' && (
                <div className="flex items-center gap-1.5">
                  <input
                    type="date"
                    value={pickerDate}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    onChange={(e) => setPickerDate(e.target.value)}
                    className="text-xs border border-neutral-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <input
                    type="time"
                    value={pickerTime}
                    onChange={(e) => setPickerTime(e.target.value)}
                    className="text-xs border border-neutral-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              )}
            </div>
          </div>

          {isProjected && (
            <p className="text-xs text-violet-700 bg-violet-50 border border-violet-200 rounded-lg px-3 py-1.5 mt-3 flex items-center gap-1.5">
              <Clock className="w-3 h-3 shrink-0" />
              Showing projected room status at <strong className="ml-1">{fmtTime(pickerTime)}</strong>
              <span className="mx-1">on</span>
              <strong>{format(new Date(pickerDate + 'T00:00:00'), 'dd MMM yyyy')}</strong>
              &nbsp;— based on confirmed bookings.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Room Grid */}
      {roomsLoading ? (
        <div className="text-sm text-muted-foreground text-center py-12">Loading rooms…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {snapshots.map(({ room, status, activeBooking, nextBooking }) => {
            const cfg = STATUS[status];
            return (
              <Card
                key={room.id}
                className={cn('relative overflow-hidden border-2 transition-all duration-300 hover:shadow-md', cfg.cardBg)}
              >
                <CardContent className="p-4 space-y-3">
                  {/* Status indicator */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{room.name}</h3>
                      {room.roomNumber && (
                        <p className="text-xs text-muted-foreground mt-0.5">Room {room.roomNumber}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {status === 'available' && !isProjected ? (
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                        </span>
                      ) : (
                        <span className={cn('h-3 w-3 rounded-full', cfg.dot)} />
                      )}
                      <span className={cn('text-xs font-semibold', cfg.text)}>{cfg.label}</span>
                    </div>
                  </div>

                  {/* Room details */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Building2 className="w-3 h-3 shrink-0" />
                      <span>{room.tower}</span>
                      <span className="opacity-40">·</span>
                      <Layers className="w-3 h-3 shrink-0" />
                      <span>{room.floor}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="w-3 h-3 shrink-0" />
                      <span>{room.capacity.min}–{room.capacity.max} people</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span>Managed by {room.managedBy}</span>
                    </div>
                  </div>

                  {/* Booking context */}
                  {status === 'under_maintenance' && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 rounded-lg px-2.5 py-1.5 border border-slate-200">
                      <Wrench className="w-3 h-3 shrink-0" />
                      Under maintenance
                    </div>
                  )}
                  {status === 'occupied' && activeBooking && (
                    <div className="rounded-lg bg-red-100/60 border border-red-200 px-2.5 py-1.5 space-y-0.5">
                      <p className="text-[10px] font-semibold text-red-700 truncate">"{activeBooking.title}"</p>
                      <p className="text-[10px] text-red-600 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {fmtTime(activeBooking.startTime)} – {fmtTime(activeBooking.endTime)}
                      </p>
                      <p className="text-[10px] text-red-500">{activeBooking.organizer}</p>
                    </div>
                  )}
                  {status === 'reserved' && nextBooking && (
                    <div className="rounded-lg bg-amber-100/60 border border-amber-200 px-2.5 py-1.5 space-y-0.5">
                      <p className="text-[10px] font-semibold text-amber-700 truncate">Next: "{nextBooking.title}"</p>
                      <p className="text-[10px] text-amber-600 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {fmtTime(nextBooking.startTime)} – {fmtTime(nextBooking.endTime)}
                      </p>
                    </div>
                  )}
                  {status === 'available' && nextBooking && (
                    <div className="rounded-lg bg-neutral-100/60 border border-neutral-200 px-2.5 py-1.5 space-y-0.5">
                      <p className="text-[10px] text-neutral-500 truncate">Next: "{nextBooking.title}"</p>
                      <p className="text-[10px] text-neutral-400 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {fmtTime(nextBooking.startTime)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
