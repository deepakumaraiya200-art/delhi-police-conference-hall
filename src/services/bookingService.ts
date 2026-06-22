import type { Booking } from '@/types';
import { isSeniorTo, getRankLabel } from '@/types';
import { users } from '@/data/users';
import { api } from './api';
import { useBookingStore } from '@/store/bookingStore';
import { format } from 'date-fns';

// ── Time helpers (used for client-side pre-flight checks) ───────────────────

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

const BUFFER_MINUTES = 30;

// ── Buffer Conflict Check (client-side, uses Zustand cache) ─────────────────

export interface BufferConflict {
  booking: Booking;
  type: 'overlap' | 'buffer';
}

export function checkBufferConflict(
  roomId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeBookingIds: string[] = [],
  bookingsOverride?: Booking[]
): BufferConflict | null {
  const bookings = bookingsOverride ?? useBookingStore.getState().bookings;
  const active = bookings.filter(
    (b) =>
      b.roomId === roomId &&
      b.date === date &&
      b.status !== 'cancelled' &&
      b.status !== 'completed' &&
      !excludeBookingIds.includes(b.id)
  );

  const newStart = toMinutes(startTime);
  const newEnd   = toMinutes(endTime);

  for (const b of active) {
    const bStart = toMinutes(b.startTime);
    const bEnd   = toMinutes(b.endTime);
    if (newStart < bEnd && newEnd > bStart)                          return { booking: b, type: 'overlap' };
    if (newStart >= bEnd  && newStart < bEnd  + BUFFER_MINUTES) return { booking: b, type: 'buffer' };
    if (newEnd   <= bStart && newEnd   > bStart - BUFFER_MINUTES) return { booking: b, type: 'buffer' };
  }
  return null;
}

// ── Senior Override Check (client-side, same logic as backend) ──────────────

export interface OverrideCandidate {
  booking: Booking;
  juniorUserId: string;
  allowed: boolean;
  reason?: string;
}

export function findOverrideCandidates(
  roomId: string,
  date: string,
  startTime: string,
  endTime: string,
  seniorUserId: string,
  bookingsOverride?: Booking[]
): OverrideCandidate[] {
  const seniorUser = users.find((u) => u.id === seniorUserId);
  if (!seniorUser) return [];

  const bookings = bookingsOverride ?? useBookingStore.getState().bookings;
  const now = new Date();
  const newStart = toMinutes(startTime);
  const newEnd   = toMinutes(endTime);

  const conflicting = bookings.filter(
    (b) =>
      b.roomId === roomId &&
      b.date === date &&
      b.status !== 'cancelled' &&
      b.status !== 'completed'
  );

  const candidates: OverrideCandidate[] = [];
  for (const b of conflicting) {
    const bStart = toMinutes(b.startTime);
    const bEnd   = toMinutes(b.endTime);
    const hasConflict = newStart < bEnd + BUFFER_MINUTES && newEnd > bStart - BUFFER_MINUTES;
    if (!hasConflict) continue;

    const juniorUser = users.find((u) => u.id === b.userId);
    if (!juniorUser || !isSeniorTo(seniorUser.role, juniorUser.role)) continue;

    const meetingDateTime   = new Date(`${b.date}T${b.startTime}:00`);
    const minutesUntilMeeting = (meetingDateTime.getTime() - now.getTime()) / 60000;

    if (minutesUntilMeeting <= BUFFER_MINUTES) {
      candidates.push({ booking: b, juniorUserId: b.userId, allowed: false,
        reason: `Cannot override: less than 30 minutes until "${b.title}" starts.` });
    } else {
      candidates.push({ booking: b, juniorUserId: b.userId, allowed: true });
    }
  }
  return candidates;
}

// ── CRUD Functions (call real backend) ──────────────────────────────────────

export async function getBookings(): Promise<Booking[]> {
  return api.get<Booking[]>('/bookings');
}

export async function getBookingById(id: string): Promise<Booking | undefined> {
  try { return await api.get<Booking>(`/bookings/${id}`); } catch { return undefined; }
}

export async function getBookingsByUser(userId: string): Promise<Booking[]> {
  return api.get<Booking[]>(`/bookings/user/${userId}`);
}

export async function getBookingsByRoom(roomId: string): Promise<Booking[]> {
  return api.get<Booking[]>(`/bookings/room/${roomId}`);
}

export async function getBookingsForDate(date: Date): Promise<Booking[]> {
  const all = await getBookings();
  const dateStr = format(date, 'yyyy-MM-dd');
  return all.filter((b) => b.date === dateStr);
}

export async function createBooking(
  data: Omit<Booking, 'id' | 'createdAt'>
): Promise<{ booking: Booking; cancelledBookings: Booking[] }> {
  return api.post('/bookings', {
    roomId:            data.roomId,
    userId:            data.userId,
    title:             data.title,
    description:       data.description,
    organizer:         data.organizer,
    participantsCount: data.participantsCount,
    date:              data.date,
    startTime:         data.startTime,
    endTime:           data.endTime,
    status:            data.status,
  });
}

export async function updateBooking(id: string, data: Partial<Booking>): Promise<Booking> {
  return api.put<Booking>(`/bookings/${id}`, data);
}

export async function cancelBooking(id: string, reason?: string): Promise<Booking> {
  return api.patch<Booking>(`/bookings/${id}/cancel`, { reason });
}

export async function submitMOM(id: string, mom: string): Promise<Booking> {
  return api.put<Booking>(`/bookings/${id}`, { mom });
}

export async function markBookingComplete(id: string): Promise<Booking> {
  return api.patch<Booking>(`/bookings/${id}/complete`);
}

export async function markBookingOngoing(id: string): Promise<Booking> {
  return api.patch<Booking>(`/bookings/${id}/ongoing`);
}

export async function submitMOS(id: string, mom: string): Promise<Booking> {
  return api.patch<Booking>(`/bookings/${id}/mos`, { mom });
}

export async function getTodaysBookings(): Promise<Booking[]> {
  return api.get<Booking[]>('/bookings/today');
}

export async function getUpcomingBookings(): Promise<Booking[]> {
  return api.get<Booking[]>('/bookings/upcoming');
}

// Helper used by senior-override notifications in Booking.tsx
export function getRankLabelExport(role: string): string {
  return getRankLabel(role as Parameters<typeof getRankLabel>[0]);
}
