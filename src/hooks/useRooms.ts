import { useQuery } from '@tanstack/react-query';
import type { Room, FilterState } from '@/types';
import { getRooms, getRoomById, filterRooms } from '@/services/roomService';
import { useRoomStore } from '@/store/roomStore';

export function useRooms() {
  const setRooms = useRoomStore((state) => state.setRooms);

  return useQuery<Room[]>({
    queryKey: ['rooms'],
    queryFn: async () => {
      const data = await getRooms();
      setRooms(data);
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useRoom(id: string) {
  const setSelectedRoom = useRoomStore((state) => state.setSelectedRoom);

  return useQuery<Room | undefined>({
    queryKey: ['room', id],
    queryFn: async () => {
      const data = await getRoomById(id);
      if (data) {
        setSelectedRoom(data);
      }
      return data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useFilteredRooms(filters: FilterState) {
  return useQuery<Room[]>({
    queryKey: ['rooms', 'filtered', filters],
    queryFn: () => filterRooms(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
