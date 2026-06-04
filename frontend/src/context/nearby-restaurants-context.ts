import { create } from 'zustand';
import type { Restaurant } from '../services/api';

export interface NearbyRestaurantsContextType {
  restaurants: Restaurant[];
  loading: boolean;
  error: string | null;
  setRestaurants: (restaurants: Restaurant[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearRestaurants: () => void;
}

export const useNearbyRestaurants = create<NearbyRestaurantsContextType>((set) => ({
  restaurants: [],
  loading: false,
  error: null,
  setRestaurants: (restaurants) => set({ restaurants }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearRestaurants: () => set({ restaurants: [], loading: false, error: null }),
}));
