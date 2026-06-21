import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginType } from '@/types';
import { users } from '@/data/users';

interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  login: (email: string, password: string, loginType: LoginType) => { success: boolean; error?: string };
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,
      setUser: (user) => set({ currentUser: user, isAuthenticated: true }),

      login: (email: string, password: string, loginType: LoginType) => {
        const user = users.find(
          (u) =>
            u.email.toLowerCase() === email.toLowerCase() &&
            u.password === password &&
            u.loginType === loginType
        );

        if (!user) {
          const emailMatch = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
          if (emailMatch && emailMatch.loginType !== loginType) {
            return {
              success: false,
              error: `This account must log in via the "${emailMatch.loginType === 'admin' ? 'Admin' : emailMatch.loginType === 'caretaker' ? 'Caretaker' : 'Officer'}" portal.`,
            };
          }
          return { success: false, error: 'Invalid email or password.' };
        }

        set({ currentUser: user, isAuthenticated: true });
        return { success: true };
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
