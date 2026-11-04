import type { Category, WallpaperCategoryId } from '@/types';
import { mediaUrl } from '@/config/site';
import { mockWallpapers } from './wallpapers';

/**
 * Категории обоев. Состав совпадает с `WallpaperCategory` в приложении MacFlow
 * (служебные All/Stills на сайт не выводятся).
 */
const CATEGORY_DEFS: ReadonlyArray<Omit<Category, 'count' | 'poster'>> = [
  {
    id: 'nature',
    title: 'Природа',
    description: 'Пейзажи, вода, небо и спокойные природные ритмы.',
    icon: 'Leaf',
    accent: 'from-emerald-400/80 to-teal-500/60',
  },
  {
    id: 'space',
    title: 'Космос',
    description: 'Галактики, звёзды и научная визуализация.',
    icon: 'Rocket',
    accent: 'from-indigo-400/80 to-violet-500/60',
  },
  {
    id: 'cars',
    title: 'Авто',
    description: 'Дрифт, суперкары и ночные трассы.',
    icon: 'Car',
    accent: 'from-rose-400/80 to-pink-500/60',
  },
  {
    id: 'abstract',
    title: 'Абстракция',
    description: 'Градиенты, жидкости и геометрия без сюжета.',
    icon: 'Shapes',
    accent: 'from-violet-400/80 to-cyan-400/60',
  },
  {
    id: 'dark',
    title: 'Тёмное',
    description: 'Ночные сцены и фон для тёмной темы macOS.',
    icon: 'Moon',
    accent: 'from-slate-500/80 to-slate-800/60',
  },
  {
    id: 'gaming',
    title: 'Игры',
    description: 'Киберпанк, ретро-аркада и фэнтези-сцены.',
    icon: 'Gamepad2',
    accent: 'from-fuchsia-400/80 to-pink-500/60',
  },
  {
    id: 'anime',
    title: 'Аниме',
    description: 'Сakura-арт, пиксель-пейзажи и тёплые сцены.',
    icon: 'Sparkles',
    accent: 'from-pink-300/80 to-rose-300/60',
  },
  {
    id: 'heroes',
    title: 'Герои',
    description: 'Силуэты, контраст и драматичный свет.',
    icon: 'Shield',
    accent: 'from-brand/70 to-brand-to/60',
  },
  {
    id: 'others',
    title: 'Другое',
    description: 'Минимализм, граффити и эксперименты.',
    icon: 'LayoutGrid',
    accent: 'from-slate-400/80 to-zinc-600/60',
  },
];

/** Иконка категории → файл постера. */
function posterForCategory(id: WallpaperCategoryId): string {
  const remote = mediaUrl('posters', `category-${id}`, 'webp');
  if (remote) return remote;

  const index = CATEGORY_DEFS.findIndex((item) => item.id === id);
  const n = ((index < 0 ? 0 : index) % 12).toString().padStart(2, '0');
  return `/placeholders/categories/category-${n}.svg`;
}

export const mockCategories: Category[] = CATEGORY_DEFS.map((definition) => ({
  ...definition,
  count: mockWallpapers.filter((wallpaper) => wallpaper.category === definition.id).length,
  poster: posterForCategory(definition.id),
}));

/** Категория по id. */
export function findCategory(id: string): Category | undefined {
  return mockCategories.find((category) => category.id === id);
}
