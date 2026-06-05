import { create } from 'zustand';
import type { AuthState } from '@/features/auth/types';

/** 인증 store (04 §7-2). 운영자 프로필 + 인증 여부. */
export const useAuthStore = create<AuthState>((set) => ({
  admin: null,
  isAuthenticated: false,
  setAdmin: (admin) => set({ admin, isAuthenticated: true }),
  reset: () => set({ admin: null, isAuthenticated: false }),
}));
