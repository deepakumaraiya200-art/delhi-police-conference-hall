import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { setToken, clearToken } from '@/services/api';

interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  completeLogin: (user: User, token: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,

      setUser: (user) => set({ currentUser: user, isAuthenticated: true }),

      completeLogin: (user, token) => {
        setToken(token);
        set({ currentUser: user, isAuthenticated: true });
      },

      logout: () => {
        clearToken();
        set({ currentUser: null, isAuthenticated: false });
      },
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
