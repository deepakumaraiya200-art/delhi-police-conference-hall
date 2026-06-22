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
  updateBooking,
  cancelBooking,
  submitMOM,
  submitMOS,
  markBookingComplete,
  markBookingOngoing,
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
      if (data) setSelectedBooking(data);
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
  const updateBookingStore = useBookingStore((state) => state.updateBooking);

  return useMutation({
    mutationFn: (data: Omit<Booking, 'id' | 'createdAt'>) => createBooking(data),
    onSuccess: ({ booking, cancelledBookings }) => {
      addBooking(booking);
      cancelledBookings.forEach((b) => updateBookingStore(b.id, { status: 'cancelled', cancelReason: b.cancelReason }));
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();
  const updateBookingStore = useBookingStore((state) => state.updateBooking);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Booking> }) =>
      updateBooking(id, data),
    onSuccess: (updated) => {
      updateBookingStore(updated.id, updated);
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  const updateBookingStore = useBookingStore((state) => state.updateBooking);

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      cancelBooking(id, reason),
    onSuccess: (cancelled) => {
      updateBookingStore(cancelled.id, { status: 'cancelled' });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useSubmitMOM() {
  const queryClient = useQueryClient();
  const updateBookingStore = useBookingStore((state) => state.updateBooking);

  return useMutation({
    mutationFn: ({ id, mom }: { id: string; mom: string }) => submitMOM(id, mom),
    onSuccess: (updated) => {
      updateBookingStore(updated.id, { mom: updated.mom });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useMarkBookingComplete() {
  const queryClient = useQueryClient();
  const updateBookingStore = useBookingStore((state) => state.updateBooking);

  return useMutation({
    mutationFn: (id: string) => markBookingComplete(id),
    onSuccess: (updated) => {
      updateBookingStore(updated.id, { status: 'completed' });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useMarkBookingOngoing() {
  const queryClient = useQueryClient();
  const updateBookingStore = useBookingStore((state) => state.updateBooking);

  return useMutation({
    mutationFn: (id: string) => markBookingOngoing(id),
    onSuccess: (updated) => {
      updateBookingStore(updated.id, { status: 'ongoing' });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useSubmitMOS() {
  const queryClient = useQueryClient();
  const updateBookingStore = useBookingStore((state) => state.updateBooking);

  return useMutation({
    mutationFn: ({ id, mom }: { id: string; mom: string }) => submitMOS(id, mom),
    onSuccess: (updated) => {
      updateBookingStore(updated.id, { mom: updated.mom });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
