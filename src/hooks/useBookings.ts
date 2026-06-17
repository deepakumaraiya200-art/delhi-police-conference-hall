import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Booking } from '@/types';
import {
  getBookings,
  getBookingById,
  getBookingsByUser,
  getBookingsByRoom,
  getTodaysBookings,
  getUpcomingBookings,
  createBooking,
  cancelBooking,
} from '@/services/bookingService';
import { useBookingStore } from '@/store/bookingStore';

export function useBookings() {
  const setBookings = useBookingStore((state) => state.setBookings);

  return useQuery<Booking[]>({
    queryKey: ['bookings'],
    queryFn: async () => {
      const data = await getBookings();
      setBookings(data);
      return data;
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useBooking(id: string) {
  const setSelectedBooking = useBookingStore((state) => state.setSelectedBooking);

  return useQuery<Booking | undefined>({
    queryKey: ['booking', id],
    queryFn: async () => {
      const data = await getBookingById(id);
      if (data) {
        setSelectedBooking(data);
      }
      return data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}

export function useUserBookings(userId: string) {
  return useQuery<Booking[]>({
    queryKey: ['bookings', 'user', userId],
    queryFn: () => getBookingsByUser(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useRoomBookings(roomId: string) {
  return useQuery<Booking[]>({
    queryKey: ['bookings', 'room', roomId],
    queryFn: () => getBookingsByRoom(roomId),
    enabled: !!roomId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useTodaysBookings() {
  return useQuery<Booking[]>({
    queryKey: ['bookings', 'today'],
    queryFn: getTodaysBookings,
    staleTime: 1000 * 60 * 1,
  });
}

export function useUpcomingBookings() {
  return useQuery<Booking[]>({
    queryKey: ['bookings', 'upcoming'],
    queryFn: getUpcomingBookings,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  const addBooking = useBookingStore((state) => state.addBooking);

  return useMutation({
    mutationFn: (data: Omit<Booking, 'id' | 'createdAt'>) => createBooking(data),
    onSuccess: (newBooking) => {
      addBooking(newBooking);
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  const updateBooking = useBookingStore((state) => state.updateBooking);

  return useMutation({
    mutationFn: (id: string) => cancelBooking(id),
    onSuccess: (cancelledBooking) => {
      updateBooking(cancelledBooking.id, { status: 'cancelled' });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
