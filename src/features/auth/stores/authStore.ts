import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthUser, AuthTokens, AuthStatus, AuthState } from '../../../shared/types';
import { env } from '../../../core/config/env';

interface AuthStore extends AuthState {
  setUser: (user: AuthUser | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  setStatus: (status: AuthStatus) => void;
  setLoading: (loading: boolean) => void;
  login: (user: AuthUser, tokens: AuthTokens) => void;
  logout: () => void;
  updateUser: (userData: Partial<AuthUser>) => void;
  isTokenExpired: () => boolean;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      status: 'loggedOut',

      setUser: (user) =>
        set((state) => ({
          ...state,
          user,
          isAuthenticated: !!user,
        })),

      setTokens: (tokens) =>
        set((state) => ({
          ...state,
          tokens,
        })),

      setStatus: (status) =>
        set((state) => ({
          ...state,
          status,
        })),

      setLoading: (isLoading) =>
        set((state) => ({
          ...state,
          isLoading,
        })),

      login: (user, tokens) => {
        localStorage.setItem(env.TOKEN_STORAGE_KEY, tokens.accessToken);
        if (tokens.refreshToken) {
          localStorage.setItem('refresh_token', tokens.refreshToken);
        }

        set({
          user,
          tokens,
          isAuthenticated: true,
          isLoading: false,
          status: user.status === 'PENDING_REVIEW' ? 'pendingApproval' : 'loggedIn',
        });
      },

      logout: () => {
        localStorage.removeItem(env.TOKEN_STORAGE_KEY);
        localStorage.removeItem('refresh_token');

        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
          status: 'loggedOut',
        });
      },

      updateUser: (userData) =>
        set((state) => ({
          ...state,
          user: state.user ? { ...state.user, ...userData } : null,
        })),

      isTokenExpired: () => {
        const { tokens } = get();
        if (!tokens?.expiresAt) return true;

        const expirationTime = tokens.expiresAt;
        const currentTime = Date.now();

        return currentTime >= expirationTime;
      },

      hasRole: (role) => {
        const { user } = get();
        return user?.role === role;
      },

      hasPermission: (permission) => {
        const { user } = get();
        return user?.permissions?.includes(permission) ?? false;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
        status: state.status,
      }),
    }
  )
);

export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthStatus = () => useAuthStore((state) => state.status);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useUserRole = () => useAuthStore((state) => state.user?.role);