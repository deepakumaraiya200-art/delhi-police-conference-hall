import type { Booking } from '@/types';
import { bookings as mockBookings } from '@/data/bookings';
import { format, isToday, isFuture, parseISO } from 'date-fns';

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

let bookingsData = [...mockBookings];
let nextId = bookingsData.length + 1;

export async function getBookings(): Promise<Booking[]> {
  await delay(500);
  return [...bookingsData];
}

export async function getBookingById(id: string): Promise<Booking | undefined> {
  await delay(300);
  return bookingsData.find(booking => booking.id === id);
}

export async function getBookingsByUser(userId: string): Promise<Booking[]> {
  await delay(400);
  return bookingsData.filter(booking => booking.userId === userId);
}

export async function getBookingsByRoom(roomId: string): Promise<Booking[]> {
  await delay(400);
  return bookingsData.filter(booking => booking.roomId === roomId);
}

export async function getBookingsForDate(date: Date): Promise<Booking[]> {
  await delay(400);
  const dateStr = format(date, 'yyyy-MM-dd');
  return bookingsData.filter(booking => booking.date === dateStr);
}

export async function createBooking(
  data: Omit<Booking, 'id' | 'createdAt'>
): Promise<Booking> {
  await delay(600);
  const newBooking: Booking = {
    ...data,
    id: `booking-${nextId++}`,
    createdAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
  };
  bookingsData.push(newBooking);
  return { ...newBooking };
}

export async function updateBooking(
  id: string,
  data: Partial<Booking>
): Promise<Booking> {
  await delay(400);
  const index = bookingsData.findIndex(booking => booking.id === id);
  if (index === -1) {
    throw new Error(`Booking with id "${id}" not found`);
  }
  bookingsData[index] = { ...bookingsData[index], ...data };
  return { ...bookingsData[index] };
}

export async function cancelBooking(id: string): Promise<Booking> {
  await delay(300);
  const index = bookingsData.findIndex(booking => booking.id === id);
  if (index === -1) {
    throw new Error(`Booking with id "${id}" not found`);
  }
  bookingsData[index] = { ...bookingsData[index], status: 'cancelled' };
  return { ...bookingsData[index] };
}

export async function getTodaysBookings(): Promise<Booking[]> {
  await delay(400);
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  return bookingsData.filter(
    booking => booking.date === todayStr && booking.status !== 'cancelled'
  );
}

export async function getUpcomingBookings(): Promise<Booking[]> {
  await delay(400);
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  return bookingsData.filter(
    booking =>
      booking.date >= todayStr &&
      (booking.status === 'confirmed' || booking.status === 'pending')
  );
}
