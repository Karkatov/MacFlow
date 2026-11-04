/**
 * Типы обоев.
 *
 * Структура — объединение моделей приложения MacFlow
 * (`Sources/MacFlow/Models/WallpaperItem.swift`) и публичного API каталога.
 * Благодаря общей схеме сайт и приложение смогут обмениваться данными
 * без конвертации.
 */

/** Категории обоев. Совпадают с `WallpaperCategory` в приложении (без служебных All/Stills). */
export const WALLPAPER_CATEGORIES = [
  'anime',
  'nature',
  'cars',
  'gaming',
  'space',
  'heroes',
  'dark',
  'abstract',
  'others',
] as const;

export type WallpaperCategoryId = (typeof WALLPAPER_CATEGORIES)[number];

/** Тип медиа: видео-петля или статичное изображение. */
export type WallpaperMediaType = 'video' | 'image';

export interface Wallpaper {
  /** UUID как в приложении. */
  id: string;
  /** URL-идентификатор для сайта. */
  slug: string;
  title: string;
  category: WallpaperCategoryId;
  /** Тип медиа (`isVideo` в приложении). */
  mediaType: WallpaperMediaType;
  /** Дубликат `mediaType` ради совместимости с WallpaperItem. */
  isVideo: boolean;

  width: number;
  height: number;
  /** Размер файла в байтах. */
  fileSize: number;
  /** Длительность видео в секундах. Для картинок — null. */
  duration: number | null;

  author: string | null;
  location: string | null;
  tags: string[];
  description: string;

  /** Превью-обложка (путь в /public или data-URI). */
  poster: string;
  /** Путь к mp4-превью (1280px, без звука). null — если файла нет. */
  preview: string | null;
  /** Ключ файла в S3: `wallpapers/{id}.mp4`. TODO: подключить Timeweb S3. */
  fileKey: string | null;

  /** Платные обои каталога. */
  isPaid: boolean;
  /** Цена в рублях. null — бесплатно. */
  price: number | null;
  /** Готовая строка цены («99 ₽») — как `priceText` в приложении. */
  priceText: string | null;
  /** Файл уже скачан на диск пользователя. */
  isDownloaded: boolean;
  isFavorite: boolean;

  isFeatured: boolean;
  isCuratedPick: boolean;
  likeCount: number;
  views: number;
  /** ISO-дата публикации. */
  createdAt: string;

  /** Акцентный цвет для плейсхолдера и карточки. */
  accent: string;
}

/** Фильтры каталога. */
export interface WallpaperFilters {
  /** Поисковый запрос. */
  q?: string;
  category?: WallpaperCategoryId | 'all';
  /** Тип медиа. */
  mediaType?: WallpaperMediaType | 'all';
  /** Цена: all | free | paid. */
  price?: 'all' | 'free' | 'paid';
  /** Только избранное. */
  favoritesOnly?: boolean;
  sort?: WallpaperSort;
  page?: number;
  limit?: number;
}

export type WallpaperSort = 'newest' | 'popular' | 'price-asc' | 'price-desc' | 'name';

/** Универсальная пагинированная обёртка (совпадает с ответом API MacFlow). */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface Category {
  id: WallpaperCategoryId;
  /** Название на русском (в messages.json тоже есть переводы). */
  title: string;
  description: string;
  /** Количество обоев в категории. */
  count: number;
  /** Иконка Lucide (имя компонента). */
  icon: string;
  /** Градиент-акцент. */
  accent: string;
  poster: string;
}
