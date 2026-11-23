import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/features/auth/api/auth';
import type { UserPublic } from '@/features/auth/types/auth.types';
import { registerAuthClearHandler } from '@/shared/api/axiosInstance';

interface AuthState {
  usuario: UserPublic | null;
  cargando: boolean;
  procesando: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,
      procesando: false,

      login: async (username: string, password: string) => {
        set({ procesando: true });
        try {
          await authApi.login(username, password);
          const usuario = await authApi.me();
          set({ usuario, procesando: false, cargando: false });
        } catch (error) {
          set({ procesando: false });
          throw error;
        }
      },

      logout: async () => {
        set({ procesando: true });
        try {
          await authApi.logout();
        } finally {
          set({ usuario: null, procesando: false, cargando: false });
        }
      },

      checkSession: async () => {
        set({ cargando: true });
        try {
          const usuario = await authApi.me();
          set({ usuario, cargando: false });
        } catch {
          set({ usuario: null, cargando: false });
        }
      },

      clearSession: () => {
        set({ usuario: null, cargando: false, procesando: false });
      },
    }),
    {
      name: 'foodstore-auth',
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
);

registerAuthClearHandler(() => {
  useAuthStore.getState().clearSession();
});