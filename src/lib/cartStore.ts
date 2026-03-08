import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  packSize: string;
}

interface CartStore {
  items: CartItem[];
  buyNowItems: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
  setBuyNowItem: (item: Omit<CartItem, 'quantity'>) => void;
  updateBuyNowQuantity: (id: string, quantity: number) => void;
  clearBuyNow: () => void;
  buyNowTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      buyNowItems: [],
      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        });
      },
      removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: quantity <= 0
            ? state.items.filter((i) => i.id !== id)
            : state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        })),
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      setBuyNowItem: (item) => set({ buyNowItems: [{ ...item, quantity: 1 }] }),
      updateBuyNowQuantity: (id, quantity) =>
        set((state) => ({
          buyNowItems: quantity <= 0
            ? state.buyNowItems.filter((i) => i.id !== id)
            : state.buyNowItems.map((i) => (i.id === id ? { ...i, quantity } : i)),
        })),
      clearBuyNow: () => set({ buyNowItems: [] }),
      buyNowTotal: () => get().buyNowItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: 'chal-sodai-cart',
    }
  )
);
