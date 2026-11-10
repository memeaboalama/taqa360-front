import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { AuthUser, AuthTokens, AuthStatus, AuthState } from '../../../shared/types';

const REMEMBER_ME_KEY = 'auth-remember-me';
const authStateStorage = {
  getItem: (name: string) => {
    if (localStorage.getItem(REMEMBER_ME_KEY) === 'false') {
      return sessionStorage.getItem(name);
    }
    return localStorage.getItem(name) ?? sessionStorage.getItem(name);
  },
  setItem: (name: string, value: string) => {
    if (localStorage.getItem(REMEMBER_ME_KEY) === 'false') {
      sessionStorage.setItem(name, value);
      localStorage.removeItem(name);
    } else {
      localStorage.setItem(name, value);
      sessionStorage.removeItem(name);
    }
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
    sessionStorage.removeItem(name);
  },
};

interface AuthStore extends AuthState {
  setUser: (user: AuthUser | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  setStatus: (status: AuthStatus) => void;
  setLoading: (loading: boolean) => void;
  login: (user: AuthUser, tokens: AuthTokens, rememberMe?: boolean) => void;
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

      login: (user, tokens, rememberMe = true) => {
        localStorage.setItem(REMEMBER_ME_KEY, String(rememberMe));
        const tokenStorage = rememberMe ? localStorage : sessionStorage;
        const otherTokenStorage = rememberMe ? sessionStorage : localStorage;
        tokenStorage.setItem('auth_token', tokens.accessToken);
        if (tokens.refreshToken) {
          tokenStorage.setItem('refresh_token', tokens.refreshToken);
        }
        otherTokenStorage.removeItem('auth_token');
        otherTokenStorage.removeItem('refresh_token');

        set({
          user,
          tokens,
          isAuthenticated: true,
          isLoading: false,
          status: user.status === 'PENDING_REVIEW' ? 'pendingApproval' : 'loggedIn',
        });
      },

      logout: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('refresh_token');
        localStorage.removeItem(REMEMBER_ME_KEY);

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
      storage: createJSONStorage(() => authStateStorage),
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