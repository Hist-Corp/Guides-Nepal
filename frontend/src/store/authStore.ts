import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getApiUrl } from '../config/api';

interface User {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: string;
}

interface AuthStore {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  refreshInFlight: boolean;
  rememberMe: boolean;
  setRememberMe: (remember: boolean) => void;
  login: (user: User) => void;
  setTokens: (accessToken: string | null, refreshToken: string | null) => void;
  refreshTokens: () => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      refreshInFlight: false,
      rememberMe: false,
      setRememberMe: (remember) => set({ rememberMe: remember }),
      login: (user) => set({ isAuthenticated: true, user }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      refreshTokens: async () => {
        const { refreshToken } = useAuthStore.getState();
        if (!refreshToken) return false;

        // Avoid duplicate concurrent refresh attempts.
        if (useAuthStore.getState().refreshInFlight) {
          return false;
        }
        set({ refreshInFlight: true });

        try {
          const resp = await fetch(getApiUrl('/auth/refresh'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });
          if (!resp.ok) {
            return false;
          }
          const data = await resp.json();
          set({
            accessToken: data.access_token ?? null,
            refreshToken: data.refresh_token ?? refreshToken,
            refreshInFlight: false,
          });
          return true;
        } catch {
          return false;
        } finally {
          set({ refreshInFlight: false });
        }
      },
      logout: () =>
        set({
          isAuthenticated: false,
          user: null,
          accessToken: null,
          refreshToken: null,
          rememberMe: false,
        }),
    }),
    {
      name: 'auth-storage',
      // Always persist the session so users stay logged in across page
      // refreshes, regardless of the "remember me" checkbox. The checkbox
      // only controls whether the session survives browser restarts.
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        rememberMe: state.rememberMe,
      }),
    }
  )
);
