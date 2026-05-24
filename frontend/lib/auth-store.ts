import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  profileComplete: boolean;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  login: (user: AuthUser, token?: string | null) => void;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  updateProfileComplete: (complete: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      login: (user, token = null) =>
        set({
          user,
          token,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setToken: (token) => set({ token, isAuthenticated: !!token }),

      setLoading: (loading) => set({ isLoading: loading }),

      updateProfileComplete: (complete) =>
        set((state) => ({
          user: state.user ? { ...state.user, profileComplete: complete } : null,
        })),
    }),
    {
      name: "grantai-auth",
      // Only persist user object — JWT token is in httpOnly cookie (secure)
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
