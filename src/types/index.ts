import { z } from 'zod';

// ─── Enums & Literal Types ──────────────────────────────────────────────────

export type Tower = 'Tower I' | 'Tower II' | 'Bridge Tower';
export type RoomType = 'Conference Hall' | 'Auditorium' | 'Mini Auditorium';
export type RoomStatus = 'available' | 'occupied' | 'reserved';
export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';
export type LoginType = 'admin' | 'caretaker' | 'officer';
export type OfficerRank = 'cp' | 'special_cp' | 'joint_cp' | 'additional_cp' | 'dcp' | 'acp' | 'si' | 'user';
export type UserRole = 'admin' | 'caretaker' | OfficerRank;
export type NotificationType =
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'booking_reminder'
  | 'room_status_change'
  | 'new_booking'
  | 'booking_overridden'
  | 'system';

// ─── Rank Hierarchy (1 = highest) ───────────────────────────────────────────

export const RANK_HIERARCHY: Record<OfficerRank, number> = {
  cp: 1,
  special_cp: 2,
  joint_cp: 3,
  additional_cp: 4,
  dcp: 5,
  acp: 6,
  si: 7,
  user: 8,
};

export const RANK_LABELS: Record<OfficerRank, string> = {
  cp: 'Commissioner of Police',
  special_cp: 'Special Commissioner of Police',
  joint_cp: 'Joint Commissioner of Police',
  additional_cp: 'Addl. Commissioner of Police',
  dcp: 'Deputy Commissioner of Police',
  acp: 'Assistant Commissioner of Police',
  si: 'Sub-Inspector',
  user: 'User',
};

export const RANK_SHORT: Record<OfficerRank, string> = {
  cp: 'CP',
  special_cp: 'Spl. CP',
  joint_cp: 'Jt. CP',
  additional_cp: 'Addl. CP',
  dcp: 'DCP',
  acp: 'ACP',
  si: 'SI',
  user: 'User',
};

export const RANK_COLORS: Record<OfficerRank, string> = {
  cp: 'bg-red-100 text-red-800 border-red-200',
  special_cp: 'bg-orange-100 text-orange-800 border-orange-200',
  joint_cp: 'bg-amber-100 text-amber-800 border-amber-200',
  additional_cp: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  dcp: 'bg-blue-100 text-blue-800 border-blue-200',
  acp: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  si: 'bg-purple-100 text-purple-800 border-purple-200',
  user: 'bg-gray-100 text-gray-700 border-gray-200',
};

// ─── Rank Helpers ────────────────────────────────────────────────────────────

export function isOfficerRank(role: UserRole): role is OfficerRank {
  return ['cp', 'special_cp', 'joint_cp', 'additional_cp', 'dcp', 'acp', 'si', 'user'].includes(role as string);
}

export function getRankNumber(role: UserRole): number {
  if (!isOfficerRank(role)) return 999;
  return RANK_HIERARCHY[role];
}

export function isSeniorTo(rankA: UserRole, rankB: UserRole): boolean {
  if (rankA === 'admin') return true;   // admin outranks everyone
  if (rankB === 'admin') return false;
  return getRankNumber(rankA) < getRankNumber(rankB);
}

export function getRankLabel(role: UserRole): string {
  if (role === 'admin') return 'Administrator';
  if (role === 'caretaker') return 'Caretaker';
  return RANK_LABELS[role as OfficerRank] ?? role;
}

export function getRankShort(role: UserRole): string {
  if (role === 'admin') return 'Admin';
  if (role === 'caretaker') return 'Caretaker';
  return RANK_SHORT[role as OfficerRank] ?? role;
}

// ─── Core Interfaces ────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  department: string;
  role: UserRole;
  loginType: LoginType;
  assignedRooms?: string[];
  avatar: string;
}

export interface Room {
  id: string;
  imgsrc: string;
  name: string;
  roomNumber: string;
  tower: Tower;
  floor: string;
  capacity: {
    min: number;
    max: number;
  };
  managedBy: string;
  caretakerId: string;
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
  mom?: string;
  overriddenBy?: string;
  cancelReason?: string;
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
