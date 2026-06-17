import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { AvailabilityBadge } from '@/components/common/AvailabilityBadge';
import { BookingCard } from '@/components/booking/BookingCard';
import { BookingModal } from '@/components/booking/BookingModal';
import { EmptyState } from '@/components/common/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Users,
  User,
  Tag,
  Layers,
  CalendarPlus,
  Calendar,
  Wifi,
  Monitor,
  Mic,
  Volume2,
  Tv,
  Cable,
  Snowflake,
  Presentation,
  Clipboard,
  CheckCircle2,
} from 'lucide-react';
import { useRoom } from '@/hooks/useRooms';
import { useRoomBookings } from '@/hooks/useBookings';
import { rooms as roomsData } from '@/data/rooms';
import { format } from 'date-fns';
import type { Booking, Room } from '@/types';
import { cn } from '@/lib/utils';

// ── Amenity Icon Mapping ─────────────────────────────────────────────────────

const amenityIconMap: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="w-4 h-4" />,
  Projector: <Monitor className="w-4 h-4" />,
  Microphone: <Mic className="w-4 h-4" />,
  'Sound System': <Volume2 className="w-4 h-4" />,
  'Smart TV': <Tv className="w-4 h-4" />,
  'HDMI Ports': <Cable className="w-4 h-4" />,
  AC: <Snowflake className="w-4 h-4" />,
  'Video Conferencing': <Presentation className="w-4 h-4" />,
  Whiteboard: <Clipboard className="w-4 h-4" />,
  Stage: <Layers className="w-4 h-4" />,
  Podium: <Layers className="w-4 h-4" />,
  'Press Podium': <Layers className="w-4 h-4" />,
  'Recording Equipment': <Monitor className="w-4 h-4" />,
};

// ── Timeline Component ──────────────────────────────────────────────────────

interface TimelineSlot {
  startHour: number;
  endHour: number;
  title: string;
}

function AvailabilityTimeline({ bookings }: { bookings: Booking[] }) {
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const todaysBookings = React.useMemo(() => {
    return bookings
      .filter((b) => b.date === todayStr && b.status !== 'cancelled')
      .map((b) => ({
        startHour: parseInt(b.startTime.split(':')[0], 10) + parseInt(b.startTime.split(':')[1], 10) / 60,
        endHour: parseInt(b.endTime.split(':')[0], 10) + parseInt(b.endTime.split(':')[1], 10) / 60,
        title: b.title,
      }));
  }, [bookings, todayStr]);

  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8am to 8pm
  const timelineStart = 8;
  const timelineEnd = 20;
  const totalHours = timelineEnd - timelineStart;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>8:00 AM</span>
        <span>12:00 PM</span>
        <span>4:00 PM</span>
        <span>8:00 PM</span>
      </div>
      <div className="relative h-12 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg overflow-hidden border">
        {/* Hour markers */}
        {hours.map((hour) => (
          <div
            key={hour}
            className="absolute top-0 bottom-0 border-l border-dashed border-border/50"
            style={{ left: `${((hour - timelineStart) / totalHours) * 100}%` }}
          />
        ))}
        {/* Booked slots */}
        {todaysBookings.map((slot, index) => {
          const left = Math.max(((slot.startHour - timelineStart) / totalHours) * 100, 0);
          const width = Math.min(((slot.endHour - slot.startHour) / totalHours) * 100, 100 - left);
          return (
            <div
              key={index}
              className="absolute top-1 bottom-1 bg-red-400/80 dark:bg-red-600/70 rounded-md flex items-center justify-center px-2 overflow-hidden"
              style={{ left: `${left}%`, width: `${width}%` }}
              title={`${slot.title} (${Math.floor(slot.startHour)}:${String(Math.round((slot.startHour % 1) * 60)).padStart(2, '0')} - ${Math.floor(slot.endHour)}:${String(Math.round((slot.endHour % 1) * 60)).padStart(2, '0')})`}
            >
              <span className="text-[10px] text-white font-medium truncate">{slot.title}</span>
            </div>
          );
        })}
        {/* Current time indicator */}
        {(() => {
          const now = new Date();
          const currentHour = now.getHours() + now.getMinutes() / 60;
          if (currentHour >= timelineStart && currentHour <= timelineEnd) {
            const position = ((currentHour - timelineStart) / totalHours) * 100;
            return (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-blue-600 z-10"
                style={{ left: `${position}%` }}
              >
                <div className="w-2 h-2 bg-blue-600 rounded-full -translate-x-[3px] -translate-y-0.5" />
              </div>
            );
          }
          return null;
        })()}
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30" />
          Available
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-400/80" />
          Booked
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1 bg-blue-600 rounded" />
          Current Time
        </div>
      </div>
    </div>
  );
}

// ── Loading Skeleton ─────────────────────────────────────────────────────────

function RoomDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-[200px] rounded-xl" />
          <Skeleton className="h-[160px] rounded-xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-[300px] rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function RoomDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: room, isLoading: roomLoading } = useRoom(id || '');
  const { data: roomBookings, isLoading: bookingsLoading } = useRoomBookings(id || '');
  const [selectedBooking, setSelectedBooking] = React.useState<Booking | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  const isLoading = roomLoading || bookingsLoading;

  // Fallback to static data if hook hasn't resolved
  const currentRoom = room || roomsData.find((r) => r.id === id);
  const allBookings = roomBookings || [];

  const upcomingBookings = React.useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return allBookings
      .filter((b) => b.date >= today && b.status !== 'cancelled')
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
  }, [allBookings]);

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setModalOpen(true);
  };

  if (isLoading && !currentRoom) {
    return (
      <div className="space-y-6">
        <RoomDetailsSkeleton />
      </div>
    );
  }

  if (!currentRoom) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" className="gap-2" onClick={() => navigate('/rooms')}>
          <ArrowLeft className="w-4 h-4" /> Back to Rooms
        </Button>
        <EmptyState
          icon={Building2}
          title="Room not found"
          description="The conference room you're looking for doesn't exist or has been removed."
          actionLabel="View All Rooms"
          onAction={() => navigate('/rooms')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="ghost" size="sm" className="gap-2 w-fit" onClick={() => navigate('/rooms')}>
          <ArrowLeft className="w-4 h-4" /> Back to Rooms
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'w-14 h-14 rounded-xl flex items-center justify-center shrink-0',
              currentRoom.type === 'Auditorium'
                ? 'bg-gradient-to-br from-violet-500 to-purple-700'
                : currentRoom.type === 'Mini Auditorium'
                ? 'bg-gradient-to-br from-blue-500 to-indigo-700'
                : 'bg-gradient-to-br from-primary to-indigo-600'
            )}
          >
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{currentRoom.name}</h1>
              <AvailabilityBadge status={currentRoom.status} />
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {currentRoom.tower} • {currentRoom.floor}
              {currentRoom.roomNumber && ` • Room ${currentRoom.roomNumber}`}
            </p>
          </div>
        </div>
        <Button className="gap-2 w-fit" onClick={() => navigate(`/book?room=${currentRoom.id}`)}>
          <CalendarPlus className="w-4 h-4" />
          Book This Room
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Room Information */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-base">Room Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {currentRoom.description}
              </p>
              <Separator />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    Tower
                  </div>
                  <p className="text-sm font-medium">{currentRoom.tower}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Layers className="w-3.5 h-3.5" />
                    Floor
                  </div>
                  <p className="text-sm font-medium">{currentRoom.floor}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Tag className="w-3.5 h-3.5" />
                    Room Number
                  </div>
                  <p className="text-sm font-medium">{currentRoom.roomNumber || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="w-3.5 h-3.5" />
                    Capacity
                  </div>
                  <p className="text-sm font-medium">{currentRoom.capacity.min} – {currentRoom.capacity.max} people</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="w-3.5 h-3.5" />
                    Managed By
                  </div>
                  <p className="text-sm font-medium">{currentRoom.managedBy}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Building2 className="w-3.5 h-3.5" />
                    Type
                  </div>
                  <Badge variant="outline" className="mt-0.5">{currentRoom.type}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Today's Availability Timeline */}
          <Card className="animate-fade-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Today's Availability</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {format(new Date(), 'MMM d, yyyy')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <AvailabilityTimeline bookings={allBookings} />
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-base">Amenities & Facilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {currentRoom.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/50 border"
                  >
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                      {amenityIconMap[amenity] || <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <span className="text-sm font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Upcoming Bookings */}
        <div className="space-y-6">
          <Card className="animate-fade-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Upcoming Bookings</CardTitle>
                <Badge variant="secondary">{upcomingBookings.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {bookingsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-lg" />
                  ))}
                </div>
              ) : upcomingBookings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">No upcoming bookings</p>
                  <p className="text-xs text-muted-foreground mt-1">This room is free to book</p>
                </div>
              ) : (
                upcomingBookings.slice(0, 8).map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    room={currentRoom}
                    showActions={true}
                    onView={() => handleViewBooking(booking)}
                  />
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-base">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Bookings</span>
                <span className="font-semibold">{allBookings.length}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Upcoming</span>
                <span className="font-semibold text-emerald-600">{upcomingBookings.length}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-semibold">
                  {allBookings.filter((b) => b.status === 'completed').length}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Cancelled</span>
                <span className="font-semibold text-red-600">
                  {allBookings.filter((b) => b.status === 'cancelled').length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        booking={selectedBooking}
        room={currentRoom}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
