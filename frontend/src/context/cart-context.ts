import { create } from 'zustand';
import {
  addToCart as apiAddToCart,
  getCart as apiGetCart,
  updateCartItemQuantity as apiUpdateQuantity,
  type MenuItem,
} from '../services/api';

interface CartItem {
  menuItemID: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  restaurantID: string | null;
  totalItems: number;
  fetchCart: (token: string) => Promise<void>;
  incrementItem: (token: string, restaurantID: string, menuItemID: string) => Promise<void>;
  decrementItem: (token: string, menuItemID: string, currentQty: number) => Promise<void>;
  getItemQty: (menuItemID: string) => number;
}

const resolveId = (v: string | MenuItem): string =>
  typeof v === 'string' ? v : v._id;

const total = (items: CartItem[]) => items.reduce((s, i) => s + i.quantity, 0);

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  restaurantID: null,
  totalItems: 0,

  getItemQty: (menuItemID) =>
    get().items.find((i) => i.menuItemID === menuItemID)?.quantity ?? 0,

  fetchCart: async (token) => {
    try {
      const cart = await apiGetCart(token);
      if (cart) {
        const items = cart.items.map((i) => ({
          menuItemID: resolveId(i.menuItemID),
          quantity: i.quantity,
        }));
        set({ items, restaurantID: cart.restaurantID, totalItems: total(items) });
      } else {
        set({ items: [], restaurantID: null, totalItems: 0 });
      }
    } catch {
      set({ items: [], restaurantID: null, totalItems: 0 });
    }
  },

  incrementItem: async (token, restaurantID, menuItemID) => {
    const prev = get().items;
    const idx = prev.findIndex((i) => i.menuItemID === menuItemID);
    const next =
      idx > -1
        ? prev.map((i, n) => (n === idx ? { ...i, quantity: i.quantity + 1 } : i))
        : [...prev, { menuItemID, quantity: 1 }];
    set({ items: next, restaurantID, totalItems: total(next) });

    try {
      await apiAddToCart(token, restaurantID, menuItemID, 1);
    } catch {
      set({ items: prev, totalItems: total(prev) });
    }
  },

  decrementItem: async (token, menuItemID, currentQty) => {
    const prev = get().items;
    const newQty = currentQty - 1;
    const next =
      newQty <= 0
        ? prev.filter((i) => i.menuItemID !== menuItemID)
        : prev.map((i) => (i.menuItemID === menuItemID ? { ...i, quantity: newQty } : i));
    set({ items: next, totalItems: total(next) });

    try {
      await apiUpdateQuantity(token, menuItemID, newQty);
    } catch {
      set({ items: prev, totalItems: total(prev) });
    }
  },
}));
