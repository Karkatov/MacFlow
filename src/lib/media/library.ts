import manifest from '@/generated/media-manifest.json';

export type MediaKind = 'image' | 'video';
export type MediaSection = 'gallery' | 'hero' | 'lockScreen' | 'demo';

export type MediaItem = {
  id: string;
  kind: MediaKind;
  title: string;
  src: string;
  poster: string | null;
  file: string;
  section: MediaSection;
};

type MediaPool = {
  images: MediaItem[];
  videos: MediaItem[];
  items: MediaItem[];
  item: MediaItem | null;
};

type SectionCount = { images: number; videos: number };

type Manifest = {
  generatedAt: string;
  counts: SectionCount & {
    hero: SectionCount;
    lockScreen: SectionCount;
    demo: SectionCount;
  };
  gallery: MediaPool;
  hero: MediaPool;
  lockScreen: MediaPool;
  demo: MediaPool;
};

const data = manifest as Manifest;

/** Все обои из `wallpapers/gallery/{image,video}`. */
export const mediaItems: MediaItem[] = data.gallery.items;

/** Отдельные пулы для секций сайта. */
export const galleryImages: MediaItem[] = data.gallery.images;
export const galleryVideos: MediaItem[] = data.gallery.videos;
export const heroItems: MediaItem[] = data.hero.items;
export const lockScreenItems: MediaItem[] = data.lockScreen.items;
export const demoItems: MediaItem[] = data.demo.items;

const firstGalleryVideo = data.gallery.videos[0] ?? null;
const firstGalleryImage = data.gallery.images[0] ?? null;

/** Обои для интерактивного lock screen в hero. */
export const heroMedia: MediaItem | null = data.hero.item ?? firstGalleryVideo ?? firstGalleryImage;

/** Медиа для блока «Экран блокировки». */
export const lockScreenMedia: MediaItem | null =
  data.lockScreen.item ?? data.hero.item ?? firstGalleryVideo ?? firstGalleryImage;

/** Медиа для блока «Watch it in action». */
export const demoMedia: MediaItem | null = data.demo.item ?? firstGalleryVideo ?? firstGalleryImage;

export const mediaCounts = {
  images: data.counts.images,
  videos: data.counts.videos,
};

export function galleryItems(limit?: number): MediaItem[] {
  const fallback = [...data.hero.items, ...data.lockScreen.items, ...data.demo.items];
  const items = mediaItems.length > 0 ? mediaItems : fallback;
  return typeof limit === 'number' ? items.slice(0, limit) : items;
}

/** Разбивает галерею на два ряда для бегущих строк. */
export function galleryRows(): [MediaItem[], MediaItem[]] {
  const items = galleryItems();
  const mid = Math.ceil(items.length / 2);
  return [items.slice(0, mid), items.slice(mid)];
}

export function pickMedia(kind: MediaKind, index = 0): MediaItem | null {
  const pool = mediaItems.filter((item) => item.kind === kind);
  return pool[index] ?? pool[0] ?? null;
}
