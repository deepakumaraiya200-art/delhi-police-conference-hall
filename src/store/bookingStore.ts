import { create } from 'zustand';
import type { Booking } from '@/types';

interface BookingState {
  bookings: Booking[];
  selectedBooking: Booking | null;
  loading: boolean;
  setBookings: (bookings: Booking[]) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, data: Partial<Booking>) => void;
  removeBooking: (id: string) => void;
  setSelectedBooking: (booking: Booking | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  bookings: [],
  selectedBooking: null,
  loading: false,
  setBookings: (bookings) => set({ bookings }),
  addBooking: (booking) =>
    set((state) => ({ bookings: [...state.bookings, booking] })),
  updateBooking: (id, data) =>
    set((state) => ({
      bookings: state.bookings.map((booking) =>
        booking.id === id ? { ...booking, ...data } : booking
      ),
      selectedBooking:
        state.selectedBooking?.id === id
          ? { ...state.selectedBooking, ...data }
          : state.selectedBooking,
    })),
  removeBooking: (id) =>
    set((state) => ({
      bookings: state.bookings.filter((booking) => booking.id !== id),
      selectedBooking:
        state.selectedBooking?.id === id ? null : state.selectedBooking,
    })),
  setSelectedBooking: (booking) => set({ selectedBooking: booking }),
  setLoading: (loading) => set({ loading }),
}));
