import type { Room, RoomStatus, FilterState } from '@/types';
import { rooms as mockRooms } from '@/data/rooms';

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

let roomsData = [...mockRooms];

export async function getRooms(): Promise<Room[]> {
  await delay(500);
  return [...roomsData];
}

export async function getRoomById(id: string): Promise<Room | undefined> {
  await delay(300);
  return roomsData.find(room => room.id === id);
}

export async function searchRooms(query: string): Promise<Room[]> {
  await delay(400);
  const lowerQuery = query.toLowerCase();
  return roomsData.filter(
    room =>
      room.name.toLowerCase().includes(lowerQuery) ||
      room.roomNumber.toLowerCase().includes(lowerQuery) ||
      room.tower.toLowerCase().includes(lowerQuery) ||
      room.floor.toLowerCase().includes(lowerQuery) ||
      room.managedBy.toLowerCase().includes(lowerQuery) ||
      room.type.toLowerCase().includes(lowerQuery) ||
      room.amenities.some(a => a.toLowerCase().includes(lowerQuery))
  );
}

export async function filterRooms(filters: FilterState): Promise<Room[]> {
  await delay(500);
  let filtered = [...roomsData];

  if (filters.tower) {
    filtered = filtered.filter(room => room.tower === filters.tower);
  }

  if (filters.floor) {
    filtered = filtered.filter(room => room.floor === filters.floor);
  }

  if (filters.capacity !== null && filters.capacity !== undefined) {
    filtered = filtered.filter(room => room.capacity.max >= filters.capacity!);
  }

  if (filters.availability) {
    filtered = filtered.filter(room => room.status === filters.availability);
  }

  if (filters.searchQuery && filters.searchQuery.trim() !== '') {
    const lowerQuery = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(
      room =>
        room.name.toLowerCase().includes(lowerQuery) ||
        room.roomNumber.toLowerCase().includes(lowerQuery) ||
        room.managedBy.toLowerCase().includes(lowerQuery) ||
        room.type.toLowerCase().includes(lowerQuery)
    );
  }

  return filtered;
}

export async function updateRoomStatus(id: string, status: RoomStatus): Promise<Room> {
  await delay(300);
  const roomIndex = roomsData.findIndex(room => room.id === id);
  if (roomIndex === -1) {
    throw new Error(`Room with id "${id}" not found`);
  }
  roomsData[roomIndex] = { ...roomsData[roomIndex], status };
  return { ...roomsData[roomIndex] };
}
