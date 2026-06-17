import { create } from 'zustand';
import type { Room, RoomStatus } from '@/types';

interface RoomState {
  rooms: Room[];
  selectedRoom: Room | null;
  loading: boolean;
  setRooms: (rooms: Room[]) => void;
  setSelectedRoom: (room: Room | null) => void;
  updateRoomStatus: (roomId: string, status: RoomStatus) => void;
  setLoading: (loading: boolean) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  rooms: [],
  selectedRoom: null,
  loading: false,
  setRooms: (rooms) => set({ rooms }),
  setSelectedRoom: (room) => set({ selectedRoom: room }),
  updateRoomStatus: (roomId, status) =>
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === roomId ? { ...room, status } : room
      ),
      selectedRoom:
        state.selectedRoom?.id === roomId
          ? { ...state.selectedRoom, status }
          : state.selectedRoom,
    })),
  setLoading: (loading) => set({ loading }),
}));
