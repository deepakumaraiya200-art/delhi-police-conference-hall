import type { Notification } from '@/types';
import { api } from './api';

export async function getNotifications(_userId: string): Promise<Notification[]> {
  return api.get<Notification[]>('/notifications');
}

export async function markAsRead(id: string): Promise<void> {
  await api.patch(`/notifications/${id}/read`);
}

export async function markAllAsRead(_userId: string): Promise<void> {
  await api.patch('/notifications/read-all');
}
