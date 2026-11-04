'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesState {
  /** id обоев в избранном. */
  favorites: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  clear: () => void;
}

/**
 * Избранное.
 *
 * Хранится в localStorage (zustand/persist), чтобы выбор пользователя
 * переживал перезагрузку. Позже синхронизируется с аккаунтом по email.
 */
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggle: (id) =>
        set((state) => ({
          favorites: state.favorites.includes(id)
            ? state.favorites.filter((item) => item !== id)
            : [...state.favorites, id],
        })),
      has: (id) => get().favorites.includes(id),
      clear: () => set({ favorites: [] }),
    }),
    { name: 'macflow:favorites' },
  ),
);
