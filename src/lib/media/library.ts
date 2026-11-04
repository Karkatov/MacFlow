import manifest from '@/generated/media-manifest.json';

export type MediaKind = 'image' | 'video';

export type MediaItem = {
  id: string;
  kind: MediaKind;
  title: string;
  src: string;
  poster: string | null;
  file: string;
};

type Manifest = {
  generatedAt: string;
  counts: { images: number; videos: number; showcase: number };
  items: MediaItem[];
  showcase: MediaItem[];
  hero: MediaItem | null;
  fallbackHero: MediaItem | null;
  demo: MediaItem | null;
};

const data = manifest as Manifest;

/** Все обои из корневых папок `wallpapers/images` и `wallpapers/videos`. */
export const mediaItems: MediaItem[] = data.items;

/** Ролики/картинки из `wallpapers/showcase`. */
export const showcaseItems: MediaItem[] = data.showcase;

/** Обои для интерактивного lock screen в hero. */
export const heroMedia: MediaItem | null = data.hero ?? data.fallbackHero;

/** Видео для блока «Watch it in action». */
export const demoMedia: MediaItem | null = data.demo;

export const mediaCounts = data.counts;

export function galleryItems(limit?: number): MediaItem[] {
  const items = mediaItems.length > 0 ? mediaItems : showcaseItems;
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
