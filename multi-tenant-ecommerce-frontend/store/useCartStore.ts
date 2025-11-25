import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as api from '../lib/api';

interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    imageGallery: string[];
    stock: number;
    category: {
      name: string;
    };
  };
}

interface CartStore {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  userId: string | null;
  setUserId: (userId: string) => void;
  fetchCartItems: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      error: null,
      userId: null,

      setUserId: (userId: string) => {
        set({ userId });
      },

      fetchCartItems: async () => {
        const { userId } = get();
        if (!userId) return;

        set({ loading: true, error: null });
        try {
          const items = await api.getCartItems(userId);
          set({ items, loading: false });
        } catch (error: any) {
          set({ error: error.message || 'Failed to fetch cart items', loading: false });
        }
      },

      addToCart: async (productId: string, quantity: number = 1) => {
        const { userId } = get();
        if (!userId) {
          set({ error: 'Please login to add items to cart' });
          return;
        }

        set({ loading: true, error: null });
        try {
          await api.addToCart(userId, productId, quantity);
          await get().fetchCartItems();
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to add to cart', loading: false });
          throw error;
        }
      },

      updateQuantity: async (cartItemId: string, quantity: number) => {
        set({ loading: true, error: null });
        try {
          await api.updateCartItemQuantity(cartItemId, quantity);
          await get().fetchCartItems();
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to update quantity', loading: false });
          throw error;
        }
      },

      removeItem: async (cartItemId: string) => {
        set({ loading: true, error: null });
        try {
          await api.removeFromCart(cartItemId);
          await get().fetchCartItems();
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to remove item', loading: false });
        }
      },

      clearCart: async () => {
        const { userId } = get();
        if (!userId) return;

        set({ loading: true, error: null });
        try {
          await api.clearCart(userId);
          set({ items: [], loading: false });
        } catch (error: any) {
          set({ error: error.message || 'Failed to clear cart', loading: false });
        }
      },

      getTotal: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ userId: state.userId }),
    }
  )
);
