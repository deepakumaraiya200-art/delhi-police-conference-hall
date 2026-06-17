import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { websocketService } from '@/services/websocketService';
import { useRoomStore } from '@/store/roomStore';
import { useBookingStore } from '@/store/bookingStore';
import { useNotificationStore } from '@/store/notificationStore';
import type { RoomStatus, Booking, RoomStatusChangeEvent, NewBookingEvent, BookingCancelledEvent } from '@/types';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const updateRoomStatus = useRoomStore((state) => state.updateRoomStatus);
  const addBooking = useBookingStore((state) => state.addBooking);
  const updateBooking = useBookingStore((state) => state.updateBooking);
  const addNotification = useNotificationStore((state) => state.addNotification);

  useEffect(() => {
    websocketService.connect();
    setIsConnected(true);

    const handleRoomStatusChange = (data: unknown) => {
      const event = data as RoomStatusChangeEvent;
      updateRoomStatus(event.roomId, event.status);
      addNotification({
        id: `notif-ws-${Date.now()}`,
        type: 'room_status_change',
        message: `Room status changed: ${event.roomId} is now ${event.status}.`,
        timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
        read: false,
        userId: 'user-1',
      });
    };

    const handleNewBooking = (data: unknown) => {
      const event = data as NewBookingEvent;
      addBooking(event.booking);
      addNotification({
        id: `notif-ws-${Date.now()}`,
        type: 'new_booking',
        message: `New booking created: "${event.booking.title}".`,
        timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
        read: false,
        userId: 'user-1',
      });
    };

    const handleBookingCancelled = (data: unknown) => {
      const event = data as BookingCancelledEvent;
      updateBooking(event.bookingId, { status: 'cancelled' });
      addNotification({
        id: `notif-ws-${Date.now()}`,
        type: 'booking_cancelled',
        message: `Booking ${event.bookingId} has been cancelled.`,
        timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
        read: false,
        userId: 'user-1',
      });
    };

    websocketService.on('room-status-change', handleRoomStatusChange);
    websocketService.on('new-booking', handleNewBooking);
    websocketService.on('booking-cancelled', handleBookingCancelled);

    return () => {
      websocketService.off('room-status-change', handleRoomStatusChange);
      websocketService.off('new-booking', handleNewBooking);
      websocketService.off('booking-cancelled', handleBookingCancelled);
      websocketService.disconnect();
      setIsConnected(false);
    };
  }, [updateRoomStatus, addBooking, updateBooking, addNotification]);

  return { isConnected };
}
