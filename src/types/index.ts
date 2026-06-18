import { z } from 'zod';

// ─── Enums & Literal Types ──────────────────────────────────────────────────

export type Tower = 'Tower I' | 'Tower II' | 'Bridge Tower';
export type RoomType = 'Conference Hall' | 'Auditorium' | 'Mini Auditorium';
export type RoomStatus = 'available' | 'occupied' | 'reserved';
export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';
export type UserRole = 'admin' | 'manager' | 'employee';
export type NotificationType = 'booking_confirmed' | 'booking_cancelled' | 'booking_reminder' | 'room_status_change' | 'new_booking' | 'system';

// ─── Core Interfaces ────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  role: UserRole;
  avatar: string;
}

export interface Room {
  id: string;
  imgsrc:string;
  name: string;
  roomNumber: string;
  tower: Tower;
  floor: string;
  capacity: {
    min: number;
    max: number;
  };
  managedBy: string;
  type: RoomType;
  status: RoomStatus;
  amenities: string[];
  image: string;
  description: string;
}

export interface Booking {
  id: string;
  roomId: string;
  userId: string;
  title: string;
  description: string;
  organizer: string;
  participantsCount: number;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  head: string;
  floor: string;
  tower: Tower;
}

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: string;
  read: boolean;
  userId: string;
}

// ─── Time Slot ──────────────────────────────────────────────────────────────

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  bookingId?: string;
}

// ─── Filter State ───────────────────────────────────────────────────────────

export interface FilterState {
  tower: string | null;
  floor: string | null;
  capacity: number | null;
  availability: string | null;
  searchQuery: string;
}

// ─── Statistics ─────────────────────────────────────────────────────────────

export interface RoomStatistics {
  roomId: string;
  roomName: string;
  totalBookings: number;
  averageOccupancy: number;
  peakHours: string[];
  mostFrequentDepartment: string;
}

export interface DashboardStats {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  reservedRooms: number;
  totalBookingsToday: number;
  upcomingBookings: number;
  cancelledBookingsToday: number;
  averageOccupancyRate: number;
  peakHour: string;
  mostBookedRoom: string;
}

// ─── Zod Schemas ────────────────────────────────────────────────────────────

export const bookingFormSchema = z.object({
  roomId: z.string().min(1, 'Room is required'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional().default(''),
  organizer: z.string().min(2, 'Organizer name is required'),
  participantsCount: z.number().min(1, 'At least 1 participant required').max(500, 'Maximum 500 participants'),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
});

export type BookingFormData = z.infer<typeof bookingFormSchema>;

// ─── WebSocket Event Types ──────────────────────────────────────────────────

export interface RoomStatusChangeEvent {
  roomId: string;
  status: RoomStatus;
  timestamp: string;
}

export interface NewBookingEvent {
  booking: Booking;
  timestamp: string;
}

export interface BookingCancelledEvent {
  bookingId: string;
  roomId: string;
  timestamp: string;
}

export type WebSocketEvent =
  | { type: 'room-status-change'; data: RoomStatusChangeEvent }
  | { type: 'new-booking'; data: NewBookingEvent }
  | { type: 'booking-cancelled'; data: BookingCancelledEvent };
