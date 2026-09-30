import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { User } from '../types/user';
import { AuthState } from '../types/auth';

interface AuthActions {
  setAuth: (user: User, accessToken: string, refreshToken?: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
  onUnauthorized: () => void;
  initAuth: () => void;
}

type AuthStore = AuthState & AuthActions;

const STORAGE_KEY = 'jerseyhub_auth_state';

const dummyStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

const getStorage = (): StateStorage => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return dummyStorage;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,

      setAuth: (user: User, accessToken: string, refreshToken?: string) => {
        set({
          user,
          accessToken,
          refreshToken: refreshToken || get().refreshToken || null,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
        });
      },

      updateUser: (partialUser: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...partialUser },
          });
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
        });
      },

      onUnauthorized: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
        });
      },

      initAuth: () => {
        set({ isInitialized: true });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(getStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.initAuth();
        }
      },
    }
  )
);
