import type { Notification } from '@/types';
import { notifications as mockNotifications } from '@/data/notifications';

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

let notificationsData = [...mockNotifications];

export async function getNotifications(userId: string): Promise<Notification[]> {
  await delay(400);
  return notificationsData
    .filter(n => n.userId === userId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function markAsRead(id: string): Promise<void> {
  await delay(200);
  const index = notificationsData.findIndex(n => n.id === id);
  if (index !== -1) {
    notificationsData[index] = { ...notificationsData[index], read: true };
  }
}

export async function markAllAsRead(userId: string): Promise<void> {
  await delay(300);
  notificationsData = notificationsData.map(n =>
    n.userId === userId ? { ...n, read: true } : n
  );
}
