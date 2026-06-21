import type { Booking } from '@/types';
import { isSeniorTo, getRankLabel } from '@/types';
import { bookings as mockBookings } from '@/data/bookings';
import { users } from '@/data/users';
import { format } from 'date-fns';

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

let bookingsData = [...mockBookings];
let nextId = bookingsData.length + 1;

// ─── Time Helpers ────────────────────────────────────────────────────────────

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

const BUFFER_MINUTES = 30;

// ─── Buffer Conflict Check ───────────────────────────────────────────────────

export interface BufferConflict {
  booking: Booking;
  type: 'overlap' | 'buffer';
}

export function checkBufferConflict(
  roomId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeBookingId?: string
): BufferConflict | null {
  const active = bookingsData.filter(
    (b) =>
      b.roomId === roomId &&
      b.date === date &&
      b.status !== 'cancelled' &&
      b.id !== excludeBookingId
  );

  const newStart = toMinutes(startTime);
  const newEnd = toMinutes(endTime);

  for (const b of active) {
    const bStart = toMinutes(b.startTime);
    const bEnd = toMinutes(b.endTime);

    // Direct overlap
    if (newStart < bEnd && newEnd > bStart) {
      return { booking: b, type: 'overlap' };
    }
    // Buffer violation: new meeting within 30 min of an existing meeting
    if (newStart >= bEnd && newStart < bEnd + BUFFER_MINUTES) {
      return { booking: b, type: 'buffer' };
    }
    if (newEnd <= bStart && newEnd > bStart - BUFFER_MINUTES) {
      return { booking: b, type: 'buffer' };
    }
  }
  return null;
}

// ─── Senior Override Check ──────────────────────────────────────────────────

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
  seniorUserId: string
): OverrideCandidate[] {
  const seniorUser = users.find((u) => u.id === seniorUserId);
  if (!seniorUser) return [];

  const candidates: OverrideCandidate[] = [];
  const now = new Date();
  const newStart = toMinutes(startTime);
  const newEnd = toMinutes(endTime);

  const conflicting = bookingsData.filter(
    (b) =>
      b.roomId === roomId &&
      b.date === date &&
      b.status !== 'cancelled' &&
      b.status !== 'completed'
  );

  for (const b of conflicting) {
    const bStart = toMinutes(b.startTime);
    const bEnd = toMinutes(b.endTime);

    // Check if there is a time conflict (including buffer)
    const hasConflict =
      (newStart < bEnd + BUFFER_MINUTES && newEnd > bStart - BUFFER_MINUTES);
    if (!hasConflict) continue;

    const juniorUser = users.find((u) => u.id === b.userId);
    if (!juniorUser) continue;

    if (!isSeniorTo(seniorUser.role, juniorUser.role)) continue;

    // Check 30-min rule: override only allowed if > 30 min before the booked meeting
    const meetingDateTime = new Date(`${b.date}T${b.startTime}:00`);
    const minutesUntilMeeting = (meetingDateTime.getTime() - now.getTime()) / 60000;

    if (minutesUntilMeeting <= BUFFER_MINUTES) {
      candidates.push({
        booking: b,
        juniorUserId: b.userId,
        allowed: false,
        reason: `Cannot override: less than 30 minutes until "${b.title}" starts.`,
      });
    } else {
      candidates.push({
        booking: b,
        juniorUserId: b.userId,
        allowed: true,
      });
    }
  }

  return candidates;
}

// ─── CRUD Functions ──────────────────────────────────────────────────────────

export async function getBookings(): Promise<Booking[]> {
  await delay(500);
  return [...bookingsData];
}

export async function getBookingById(id: string): Promise<Booking | undefined> {
  await delay(300);
  return bookingsData.find((b) => b.id === id);
}

export async function getBookingsByUser(userId: string): Promise<Booking[]> {
  await delay(400);
  return bookingsData.filter((b) => b.userId === userId);
}

export async function getBookingsByRoom(roomId: string): Promise<Booking[]> {
  await delay(400);
  return bookingsData.filter((b) => b.roomId === roomId);
}

export async function getBookingsForDate(date: Date): Promise<Booking[]> {
  await delay(400);
  const dateStr = format(date, 'yyyy-MM-dd');
  return bookingsData.filter((b) => b.date === dateStr);
}

export async function createBooking(
  data: Omit<Booking, 'id' | 'createdAt'>
): Promise<{ booking: Booking; cancelledBookings: Booking[] }> {
  await delay(600);

  const cancelledBookings: Booking[] = [];
  const seniorUser = users.find((u) => u.id === data.userId);

  // Auto-cancel junior bookings if senior is overriding
  if (seniorUser) {
    const candidates = findOverrideCandidates(
      data.roomId,
      data.date,
      data.startTime,
      data.endTime,
      data.userId
    );

    for (const candidate of candidates) {
      if (candidate.allowed) {
        const idx = bookingsData.findIndex((b) => b.id === candidate.booking.id);
        if (idx !== -1) {
          bookingsData[idx] = {
            ...bookingsData[idx],
            status: 'cancelled',
            cancelReason: `Overridden by ${getRankLabel(seniorUser.role)} ${seniorUser.name}`,
            overriddenBy: data.userId,
          };
          cancelledBookings.push({ ...bookingsData[idx] });
        }
      }
    }
  }

  const newBooking: Booking = {
    ...data,
    id: `booking-${nextId++}`,
    createdAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
  };
  bookingsData.push(newBooking);
  return { booking: { ...newBooking }, cancelledBookings };
}

export async function updateBooking(id: string, data: Partial<Booking>): Promise<Booking> {
  await delay(400);
  const index = bookingsData.findIndex((b) => b.id === id);
  if (index === -1) throw new Error(`Booking "${id}" not found`);
  bookingsData[index] = { ...bookingsData[index], ...data };
  return { ...bookingsData[index] };
}

export async function cancelBooking(id: string, reason?: string): Promise<Booking> {
  await delay(300);
  const index = bookingsData.findIndex((b) => b.id === id);
  if (index === -1) throw new Error(`Booking "${id}" not found`);
  bookingsData[index] = {
    ...bookingsData[index],
    status: 'cancelled',
    cancelReason: reason,
  };
  return { ...bookingsData[index] };
}

export async function submitMOM(id: string, mom: string): Promise<Booking> {
  await delay(400);
  const index = bookingsData.findIndex((b) => b.id === id);
  if (index === -1) throw new Error(`Booking "${id}" not found`);
  bookingsData[index] = { ...bookingsData[index], mom };
  return { ...bookingsData[index] };
}

export async function getTodaysBookings(): Promise<Booking[]> {
  await delay(400);
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  return bookingsData.filter(
    (b) => b.date === todayStr && b.status !== 'cancelled'
  );
}

export async function getUpcomingBookings(): Promise<Booking[]> {
  await delay(400);
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  return bookingsData.filter(
    (b) =>
      b.date >= todayStr &&
      (b.status === 'confirmed' || b.status === 'pending')
  );
}
