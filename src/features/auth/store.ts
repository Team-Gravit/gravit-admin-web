import { create } from 'zustand';
import type { AuthState } from '@/features/auth/types';

export const useAuthStore = create<AuthState>((set) => ({
  admin: null,
  isAuthenticated: false,
  setAdmin: (admin) => set({ admin, isAuthenticated: true }),
  reset: () => set({ admin: null, isAuthenticated: false }),
}));
