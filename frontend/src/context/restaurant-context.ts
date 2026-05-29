import { create } from 'zustand';
import type { CurrentLocation, Restaurant } from '../services/api';

export interface RestaurantContextType {
  restaurant: Restaurant | null;
  currentLocation: CurrentLocation | null;
  setCurrentLocation: (location: CurrentLocation | null) => void;
  updateRestaurant: (restaurant: Restaurant | null) => void;
  clearRestaurant: () => void;
  setRestaurantLoading: (loading: boolean) => void;
  setRestaurantError: (error: string | null) => void;

  restaurantLoading: boolean;
  restaurantError: string | null;
}

export const useRestaurant = create<RestaurantContextType>((set) => ({
  restaurant: null,
  currentLocation: null,
  restaurantLoading: false,
  restaurantError: null,

  setCurrentLocation: (location) => set({ currentLocation: location }),
  updateRestaurant: (restaurant) => set({ restaurant }),
  clearRestaurant: () => set({ restaurant: null, currentLocation: null }),
  setRestaurantLoading: (loading) => set({ restaurantLoading: loading }),
  setRestaurantError: (error) => set({ restaurantError: error }),
}));
