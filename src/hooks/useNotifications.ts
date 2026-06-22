import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Notification } from '@/types';
import { api } from '@/services/api';
import { useNotificationStore } from '@/store/notificationStore';

export function useNotifications() {
  const setNotifications = useNotificationStore((s) => s.setNotifications);

  return useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const data = await api.get<Notification[]>('/notifications');
      setNotifications(data);
      return data;
    },
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const markAsReadStore = useNotificationStore((s) => s.markAsRead);

  return useMutation({
    mutationFn: (id: string) => api.patch<void>(`/notifications/${id}/read`),
    onMutate: (id) => markAsReadStore(id),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const markAllStore = useNotificationStore((s) => s.markAllAsRead);

  return useMutation({
    mutationFn: () => api.patch<void>('/notifications/read-all'),
    onMutate: () => markAllStore(),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}
