import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Workspace } from '@/types';

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  activeWorkspace: Workspace | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  setActiveWorkspace: (workspace: Workspace) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      activeWorkspace: null,

      setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        set({ user, accessToken, refreshToken });
      },

      setUser: (user) => set({ user }),

      setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),

      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, accessToken: null, refreshToken: null, activeWorkspace: null });
      },

      isAuthenticated: () => !!get().accessToken && !!get().user,
    }),
    {
      name: 'taskflow-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        activeWorkspace: state.activeWorkspace,
      }),
    },
  ),
);
