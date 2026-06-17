import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventClickArg, EventDropArg } from '@fullcalendar/core';
import type { EventResizeDoneArg, DateClickArg } from '@fullcalendar/interaction';
import { PageHeader } from '@/components/common/PageHeader';
import { BookingModal } from '@/components/booking/BookingModal';
import { CalendarSkeleton } from '@/components/common/LoadingSkeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBookings } from '@/hooks/useBookings';
import { rooms } from '@/data/rooms';
import type { Booking } from '@/types';

const statusColors: Record<Booking['status'], string> = {
  confirmed: '#4f46e5',
  pending: '#f59e0b',
  cancelled: '#9ca3af',
  completed: '#10b981',
};

const statusLabels: { status: Booking['status']; color: string; label: string }[] = [
  { status: 'confirmed', color: '#4f46e5', label: 'Confirmed' },
  { status: 'pending', color: '#f59e0b', label: 'Pending' },
  { status: 'completed', color: '#10b981', label: 'Completed' },
  { status: 'cancelled', color: '#9ca3af', label: 'Cancelled' },
];

function CalendarPage() {
  const navigate = useNavigate();
  const { data: bookings, isLoading } = useBookings();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const roomMap = useMemo(() => {
    const map = new Map<string, (typeof rooms)[0]>();
    rooms.forEach((room) => map.set(room.id, room));
    return map;
  }, []);

  const events = useMemo(() => {
    if (!bookings) return [];
    return bookings.map((b) => {
      const room = roomMap.get(b.roomId);
      return {
        id: b.id,
        title: `${b.title}${room ? ` — ${room.name}` : ''}`,
        start: `${b.date}T${b.startTime}`,
        end: `${b.date}T${b.endTime}`,
        backgroundColor: statusColors[b.status],
        borderColor: statusColors[b.status],
        extendedProps: { booking: b },
      };
    });
  }, [bookings, roomMap]);

  const handleEventClick = (info: EventClickArg) => {
    const booking = info.event.extendedProps.booking as Booking;
    setSelectedBooking(booking);
    setModalOpen(true);
  };

  const handleDateClick = (info: DateClickArg) => {
    navigate(`/book?date=${info.dateStr}`);
  };

  const handleEventDrop = (_info: EventDropArg) => {
    // In a real app, this would update the booking date/time via API
  };

  const handleEventResize = (_info: EventResizeDoneArg) => {
    // In a real app, this would update the booking end time via API
  };

  const selectedRoom = selectedBooking
    ? roomMap.get(selectedBooking.roomId)
    : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        description="View and manage all bookings in a calendar view"
      >
        <div className="flex items-center gap-3 flex-wrap">
          {statusLabels.map((s) => (
            <div key={s.status} className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-xs text-muted-foreground font-medium">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </PageHeader>

      {isLoading ? (
        <CalendarSkeleton />
      ) : (
        <Card className="shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="fc-wrapper">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay',
                }}
                events={events}
                editable={true}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={3}
                weekends={true}
                eventClick={handleEventClick}
                dateClick={handleDateClick}
                eventDrop={handleEventDrop}
                eventResize={handleEventResize}
                height="auto"
                eventDisplay="block"
                eventTimeFormat={{
                  hour: '2-digit',
                  minute: '2-digit',
                  meridiem: 'short',
                }}
                slotMinTime="08:00:00"
                slotMaxTime="20:00:00"
                allDaySlot={false}
                nowIndicator={true}
                stickyHeaderDates={true}
                buttonText={{
                  today: 'Today',
                  month: 'Month',
                  week: 'Week',
                  day: 'Day',
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <BookingModal
        booking={selectedBooking}
        room={selectedRoom}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}

export default CalendarPage;
