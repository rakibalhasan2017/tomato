import { create } from 'zustand';
import type { MenuItem } from '../services/api';

export interface MenuContextType {
  menuItems: MenuItem[];
  menuLoading: boolean;
  menuError: string | null;

  setMenuItems: (items: MenuItem[]) => void;
  addMenuItem: (item: MenuItem) => void;
  updateMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (id: string) => void;
  setMenuLoading: (loading: boolean) => void;
  setMenuError: (error: string | null) => void;
  clearMenu: () => void;
}

export const useMenu = create<MenuContextType>((set) => ({
  menuItems: [],
  menuLoading: false,
  menuError: null,

  setMenuItems: (items) => set({ menuItems: items }),
  addMenuItem: (item) => set((state) => ({ menuItems: [...state.menuItems, item] })),
  updateMenuItem: (updatedItem) =>
    set((state) => ({
      menuItems: state.menuItems.map((item) =>
        item._id === updatedItem._id ? updatedItem : item
      ),
    })),
  deleteMenuItem: (id) =>
    set((state) => ({
      menuItems: state.menuItems.filter((item) => item._id !== id),
    })),
  setMenuLoading: (loading) => set({ menuLoading: loading }),
  setMenuError: (error) => set({ menuError: error }),
  clearMenu: () => set({ menuItems: [], menuLoading: false, menuError: null }),
}));
