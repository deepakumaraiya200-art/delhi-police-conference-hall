import { format } from 'date-fns';
import type { RoomStatus, Booking } from '@/types';
import { rooms as mockRooms } from '@/data/rooms';
import { bookings as mockBookings } from '@/data/bookings';

type EventCallback = (data: unknown) => void;

interface EventListeners {
  [event: string]: EventCallback[];
}

const ROOM_STATUSES: RoomStatus[] = ['available', 'occupied', 'reserved'];

class MockWebSocketService {
  private listeners: EventListeners = {};
  private roomStatusInterval: ReturnType<typeof setInterval> | null = null;
  private bookingEventInterval: ReturnType<typeof setInterval> | null = null;
  private connected = false;

  connect(): void {
    if (this.connected) return;
    this.connected = true;

    // Simulate random room status changes every 5-10 seconds
    this.roomStatusInterval = setInterval(() => {
      if (!this.connected) return;

      const randomRoom = mockRooms[Math.floor(Math.random() * mockRooms.length)];
      const currentStatusIndex = ROOM_STATUSES.indexOf(randomRoom.status);
      const newStatusIndex = (currentStatusIndex + 1 + Math.floor(Math.random() * 2)) % ROOM_STATUSES.length;
      const newStatus = ROOM_STATUSES[newStatusIndex];

      this.emit('room-status-change', {
        roomId: randomRoom.id,
        status: newStatus,
        timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
      });
    }, 5000 + Math.random() * 5000);

    // Simulate occasional booking events every 15-25 seconds
    this.bookingEventInterval = setInterval(() => {
      if (!this.connected) return;

      const eventType = Math.random() > 0.5 ? 'new-booking' : 'booking-cancelled';

      if (eventType === 'new-booking') {
        const randomRoom = mockRooms[Math.floor(Math.random() * mockRooms.length)];
        const fakeBooking: Booking = {
          id: `booking-ws-${Date.now()}`,
          roomId: randomRoom.id,
          userId: 'user-1',
          title: 'Quick Sync Meeting',
          description: 'Auto-generated booking from real-time event.',
          organizer: 'System',
          participantsCount: Math.floor(Math.random() * 20) + 5,
          date: format(new Date(), 'yyyy-MM-dd'),
          startTime: '16:00',
          endTime: '17:00',
          status: 'confirmed',
          createdAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
        };

        this.emit('new-booking', {
          booking: fakeBooking,
          timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
        });
      } else {
        const activeBookings = mockBookings.filter(b => b.status === 'confirmed' || b.status === 'pending');
        if (activeBookings.length > 0) {
          const randomBooking = activeBookings[Math.floor(Math.random() * activeBookings.length)];
          this.emit('booking-cancelled', {
            bookingId: randomBooking.id,
            roomId: randomBooking.roomId,
            timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
          });
        }
      }
    }, 15000 + Math.random() * 10000);
  }

  disconnect(): void {
    this.connected = false;

    if (this.roomStatusInterval) {
      clearInterval(this.roomStatusInterval);
      this.roomStatusInterval = null;
    }

    if (this.bookingEventInterval) {
      clearInterval(this.bookingEventInterval);
      this.bookingEventInterval = null;
    }

    this.listeners = {};
  }

  on(event: string, callback: EventCallback): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: EventCallback): void {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  isConnected(): boolean {
    return this.connected;
  }

  private emit(event: string, data: unknown): void {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in WebSocket event handler for "${event}":`, error);
      }
    });
  }
}

export const websocketService = new MockWebSocketService();
export type { MockWebSocketService };
