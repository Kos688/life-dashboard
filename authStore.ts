/**
 * Auth state (Zustand) - user session and API helpers
 */
import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  fetchUser: () => Promise<User | null>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,

  setUser: (user) => set({ user }),

  fetchUser: async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (!res.ok) {
        set({ user: null });
        return null;
      }
      const data = await res.json();
      set({ user: data.user });
      return data.user;
    } catch {
      set({ user: null });
      return null;
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } finally {
      set({ user: null });
    }
  },
}));
