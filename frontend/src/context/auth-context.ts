import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CurrentLocation } from '../services/api';

export interface User {
  id: string;
  email: string;
  name: string;
  image: string;
  role: string | null;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  currentLocation: CurrentLocation | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  setCurrentLocation: (location: CurrentLocation | null) => void;
}

export const useAuth = create<AuthContextType>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      currentLocation: null,
      isLoading: false,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null, currentLocation: null }),
      updateUser: (user) => set({ user }),
      setCurrentLocation: (currentLocation) => set({ currentLocation }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        currentLocation: state.currentLocation,
      }),
    },
  ),
);
