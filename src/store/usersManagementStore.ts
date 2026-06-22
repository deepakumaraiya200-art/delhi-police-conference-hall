import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface UsersManagementStore {
  extraUsers: User[];
  demoEmailOverrides: Record<string, string>;
  addUser: (user: User) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
  setDemoEmail: (userId: string, email: string) => void;
}

export const useUsersManagementStore = create<UsersManagementStore>()(
  persist(
    (set) => ({
      extraUsers: [],
      demoEmailOverrides: {},
      addUser: (user) => set((s) => ({ extraUsers: [...s.extraUsers, user] })),
      updateUser: (id, data) =>
        set((s) => ({ extraUsers: s.extraUsers.map((u) => (u.id === id ? { ...u, ...data } : u)) })),
      deleteUser: (id) =>
        set((s) => ({ extraUsers: s.extraUsers.filter((u) => u.id !== id) })),
      setDemoEmail: (userId, email) =>
        set((s) => ({ demoEmailOverrides: { ...s.demoEmailOverrides, [userId]: email } })),
    }),
    { name: 'dp-extra-users' }
  )
);

export function getExtraUsers(): User[] {
  return useUsersManagementStore.getState().extraUsers;
}

export function getDemoEmailOverrides(): Record<string, string> {
  return useUsersManagementStore.getState().demoEmailOverrides;
}
