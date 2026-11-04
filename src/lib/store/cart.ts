'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  kind: 'subscription';
  title: string;
  price: number;
  slug: string;
}

interface CartState {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (id: string) => void;
  clear: () => void;
  /** Итоговая сумма в рублях. */
  total: () => number;
  count: () => number;
}

/**
 * Корзина.
 *
 * Сейчас используется как «список к покупке»: реальная корзина появится
 * вместе с платёжным провайдером (LAVA / Robokassa).
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) =>
        set((state) =>
          state.items.some((existing) => existing.id === item.id)
            ? state
            : { items: [...state.items, item] },
        ),
      remove: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((sum, item) => sum + item.price, 0),
      count: () => get().items.length,
    }),
    { name: 'macflow:cart' },
  ),
);
