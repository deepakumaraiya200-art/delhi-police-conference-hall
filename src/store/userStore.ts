import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { users } from '@/data/users';

interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,
      setUser: (user) => set({ currentUser: user, isAuthenticated: true }),
      login: (email: string, _password: string) => {
        // Mock authentication - find user by email
        const user = users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );
        if (user) {
          set({ currentUser: user, isAuthenticated: true });
          return { success: true };
        }
        // Also allow login with just a name match for demo
        const userByName = users.find(
          (u) => u.name.toLowerCase().includes(email.toLowerCase())
        );
        if (userByName) {
          set({ currentUser: userByName, isAuthenticated: true });
          return { success: true };
        }
        return { success: false, error: 'Invalid credentials. Try any email from @delhipolice.gov.in' };
      },
      logout: () => set({ currentUser: null, isAuthenticated: false }),
    }),
    {
      name: 'conference-hub-auth',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
