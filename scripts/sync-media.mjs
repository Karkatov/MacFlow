#!/usr/bin/env node
/**
 * MacFlow — синхронизация обоев из `wallpapers/` в `public/media/`.
 *
 * Структура:
 *   wallpapers/gallery/image/     — статичные обои для галереи
 *   wallpapers/gallery/video/     — живые обои для галереи
 *   wallpapers/hero/image/        — картинка для интерактивного hero
 *   wallpapers/hero/video/        — видео для интерактивного hero
 *   wallpapers/lock-screen/image/ — картинка для блока Lock Screen
 *   wallpapers/lock-screen/video/ — видео для блока Lock Screen
 *   wallpapers/demo/image/        — картинка для блока «Watch it in action»
 *   wallpapers/demo/video/        — видео для блока «Watch it in action»
 *   wallpapers/posters/           — постеры для видео (имя = имя видео)
 *
 * Скрипт копирует файлы в `public/media/**` и генерирует манифест
 * `src/generated/media-manifest.json`. Запускается автоматически
 * перед `npm run dev` и `npm run build` (predev / prebuild).
 */

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const SOURCE = path.join(root, 'wallpapers');
const PUBLIC_MEDIA = path.join(root, 'public/media');
const MANIFEST_DIR = path.join(root, 'src/generated');
const MANIFEST = path.join(MANIFEST_DIR, 'media-manifest.json');

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg']);
const VIDEO_EXT = new Set(['.mp4', '.webm', '.mov', '.m4v']);

/** Секции сайта. У каждой — свои папки `image/` и `video/`. */
const SECTIONS = [
  { key: 'gallery', dir: path.join(SOURCE, 'gallery') },
  { key: 'hero', dir: path.join(SOURCE, 'hero') },
  { key: 'lockScreen', dir: path.join(SOURCE, 'lock-screen') },
  { key: 'demo', dir: path.join(SOURCE, 'demo') },
];

const POSTERS_DIR = path.join(SOURCE, 'posters');

for (const section of SECTIONS) {
  fs.mkdirSync(path.join(section.dir, 'image'), { recursive: true });
  fs.mkdirSync(path.join(section.dir, 'video'), { recursive: true });
}
for (const dir of [POSTERS_DIR, PUBLIC_MEDIA, MANIFEST_DIR]) {
  fs.mkdirSync(dir, { recursive: true });
}

/** Рекурсивно собирает файлы, пропуская служебные. */
function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'README.md') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile()) out.push(path.relative(dir, full));
  }
  return out.sort((a, b) => a.localeCompare(b, 'en'));
}

function extOf(file) {
  return path.extname(file).toLowerCase();
}

function humanize(file) {
  const base = path.basename(file, path.extname(file));
  const cleaned = base
    .replace(/^\d+[-_.\s]*/, '')
    .replace(/[-_.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return base;
  return cleaned.replace(/\b\p{L}/gu, (char) => char.toUpperCase());
}

function slugify(file) {
  return path
    .basename(file, path.extname(file))
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-+|-+$/g, '');
}

const ensureUnique = (() => {
  const used = new Set();
  return (id) => {
    let next = id || 'wallpaper';
    let i = 2;
    while (used.has(next)) next = `${id}-${i++}`;
    used.add(next);
    return next;
  };
})();

function copy(srcDir, rel, destParts) {
  const from = path.join(srcDir, rel);
  const to = path.join(PUBLIC_MEDIA, ...destParts, rel);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  const urlPath = [...destParts, ...rel.split(path.sep)].map(encodeURIComponent).join('/');
  return `/media/${urlPath}`;
}

/** Ищет постер с тем же basename, что и видео. */
function findPoster(videoRel, posterFiles) {
  const stem = path.basename(videoRel, path.extname(videoRel)).toLowerCase();
  const match = posterFiles.find(
    (rel) =>
      path.basename(rel, path.extname(rel)).toLowerCase() === stem && IMAGE_EXT.has(extOf(rel)),
  );
  return match ?? null;
}

/** Пытается вытащить первый кадр видео, если ffmpeg доступен. */
function autoPoster(srcDir, videoRel, sectionKey) {
  if (!hasBin('ffmpeg')) return null;
  const hash = createHash('sha1').update(videoRel).digest('hex').slice(0, 8);
  const stem = slugify(videoRel) || 'video';
  const outRel = `auto-${sectionKey}-${stem}-${hash}.jpg`;
  const to = path.join(PUBLIC_MEDIA, 'posters', outRel);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  try {
    execFileSync(
      'ffmpeg',
      ['-y', '-ss', '0.5', '-i', path.join(srcDir, videoRel), '-frames:v', '1', '-q:v', '5', to],
      { stdio: 'ignore' },
    );
    return `/media/posters/${outRel}`;
  } catch {
    return null;
  }
}

function hasBin(bin) {
  try {
    execFileSync('which', [bin], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// Сканируем и копируем
// ─────────────────────────────────────────────────────────────

for (const dir of ['gallery', 'hero', 'lockScreen', 'demo', 'posters']) {
  fs.rmSync(path.join(PUBLIC_MEDIA, dir), { recursive: true, force: true });
}
fs.mkdirSync(PUBLIC_MEDIA, { recursive: true });

const posterFiles = walk(POSTERS_DIR).filter((rel) => IMAGE_EXT.has(extOf(rel)));

/** Копируем только те постеры, которые реально привязаны к видео. */
const posterByRel = new Map();
function posterUrl(rel) {
  if (!posterByRel.has(rel)) {
    posterByRel.set(rel, copy(POSTERS_DIR, rel, ['posters']));
  }
  return posterByRel.get(rel);
}

function buildItems(section, kind) {
  const sourceDir = path.join(section.dir, kind);
  const extensions = kind === 'image' ? IMAGE_EXT : VIDEO_EXT;
  const files = walk(sourceDir).filter((rel) => extensions.has(extOf(rel)));

  return files.map((rel) => {
    const src = copy(sourceDir, rel, [section.key, kind]);
    let poster = src;

    if (kind === 'video') {
      const posterRel = findPoster(rel, posterFiles);
      poster = posterRel ? posterUrl(posterRel) : autoPoster(sourceDir, rel, section.key);
    }

    return {
      id: ensureUnique(`${section.key}-${slugify(rel)}`),
      kind,
      title: humanize(rel),
      src,
      poster,
      file: rel,
      section: section.key,
    };
  });
}

function buildSection(section) {
  const images = buildItems(section, 'image');
  const videos = buildItems(section, 'video');
  const items = [...images, ...videos];
  return {
    images,
    videos,
    items,
    item: videos[0] ?? images[0] ?? null,
  };
}

const sections = Object.fromEntries(
  SECTIONS.map((section) => [section.key, buildSection(section)]),
);

const manifest = {
  generatedAt: new Date().toISOString(),
  counts: {
    images: sections.gallery.images.length,
    videos: sections.gallery.videos.length,
    hero: { images: sections.hero.images.length, videos: sections.hero.videos.length },
    lockScreen: {
      images: sections.lockScreen.images.length,
      videos: sections.lockScreen.videos.length,
    },
    demo: { images: sections.demo.images.length, videos: sections.demo.videos.length },
  },
  gallery: sections.gallery,
  hero: sections.hero,
  lockScreen: sections.lockScreen,
  demo: sections.demo,
};

fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(
  `✓ MacFlow media: gallery ${sections.gallery.images.length} images / ${sections.gallery.videos.length} videos · ` +
    `hero ${sections.hero.items.length} · lock-screen ${sections.lockScreen.items.length} · ` +
    `demo ${sections.demo.items.length} → public/media`,
);

if (sections.gallery.items.length === 0) {
  console.log(
    'ℹ Папки wallpapers/gallery/* пусты. Добавьте файлы и запустите `npm run media` (или перезапустите dev/build).',
  );
}
