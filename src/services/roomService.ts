import type { Room, RoomStatus, FilterState } from '@/types';
import { api } from './api';

export async function getRooms(): Promise<Room[]> {
  return api.get<Room[]>('/rooms');
}

export async function getRoomById(id: string): Promise<Room | undefined> {
  try {
    return await api.get<Room>(`/rooms/${id}`);
  } catch {
    return undefined;
  }
}

export async function searchRooms(query: string): Promise<Room[]> {
  const rooms = await getRooms();
  const q = query.toLowerCase();
  return rooms.filter((r) =>
    r.name.toLowerCase().includes(q) ||
    r.roomNumber.toLowerCase().includes(q) ||
    r.tower.toLowerCase().includes(q) ||
    r.floor.toLowerCase().includes(q) ||
    r.managedBy.toLowerCase().includes(q) ||
    r.type.toLowerCase().includes(q) ||
    r.amenities.some((a) => a.toLowerCase().includes(q))
  );
}

export async function filterRooms(filters: FilterState): Promise<Room[]> {
  let rooms = await getRooms();
  if (filters.tower)         rooms = rooms.filter((r) => r.tower === filters.tower);
  if (filters.floor)         rooms = rooms.filter((r) => r.floor === filters.floor);
  if (filters.capacity)      rooms = rooms.filter((r) => r.capacity.max >= filters.capacity!);
  if (filters.availability)  rooms = rooms.filter((r) => r.status === filters.availability);
  if (filters.searchQuery?.trim()) {
    const q = filters.searchQuery.toLowerCase();
    rooms = rooms.filter((r) =>
      r.name.toLowerCase().includes(q) || r.roomNumber.toLowerCase().includes(q) ||
      r.managedBy.toLowerCase().includes(q) || r.type.toLowerCase().includes(q)
    );
  }
  return rooms;
}

export async function updateRoomStatus(id: string, status: RoomStatus): Promise<Room> {
  return api.patch<Room>(`/rooms/${id}/status`, { status });
}
