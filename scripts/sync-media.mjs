#!/usr/bin/env node
/**
 * MacFlow — синхронизация обоев из корневых папок в `public/`.
 *
 * Пользователь кладёт файлы в:
 *   wallpapers/images/    — статичные обои (jpg, png, webp, avif, gif, svg)
 *   wallpapers/videos/    — живые обои (mp4, webm, mov, m4v)
 *   wallpapers/posters/   — постеры для видео (имя файла = имя видео)
 *   wallpapers/showcase/  — видео/картинки для демо-блока (первый файл)
 *
 * Скрипт копирует их в public/media/** и генерирует манифест
 * `src/generated/media-manifest.json`. Запускается автоматически
 * перед `npm run dev` и `npm run build` (predev / prebuild).
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const SOURCE = path.join(root, 'wallpapers');
const PUBLIC_MEDIA = path.join(root, 'public/media');
const MANIFEST_DIR = path.join(root, 'src/generated');
const MANIFEST = path.join(MANIFEST_DIR, 'media-manifest.json');

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg']);
const VIDEO_EXT = new Set(['.mp4', '.webm', '.mov', '.m4v']);

const folders = {
  images: path.join(SOURCE, 'images'),
  videos: path.join(SOURCE, 'videos'),
  posters: path.join(SOURCE, 'posters'),
  showcase: path.join(SOURCE, 'showcase'),
};

for (const dir of [...Object.values(folders), PUBLIC_MEDIA, MANIFEST_DIR]) {
  fs.mkdirSync(dir, { recursive: true });
}

/** Рекурсивно собирает файлы, пропуская служебные. */
function walk(dir, base = dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'README.md') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, base));
    else if (entry.isFile()) out.push(path.relative(base, full));
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

function copy(srcDir, rel, destKind) {
  const from = path.join(srcDir, rel);
  const to = path.join(PUBLIC_MEDIA, destKind, rel);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  return `/media/${destKind}/${rel.split(path.sep).map(encodeURIComponent).join('/')}`;
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
function autoPoster(videoRel) {
  if (!hasBin('ffmpeg')) return null;
  const stem = `${slugify(videoRel) || 'video'}.jpg`;
  const outRel = `auto-${stem}`;
  const to = path.join(PUBLIC_MEDIA, 'posters', outRel);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  try {
    execFileSync(
      'ffmpeg',
      [
        '-y',
        '-ss',
        '0.5',
        '-i',
        path.join(folders.videos, videoRel),
        '-frames:v',
        '1',
        '-q:v',
        '5',
        to,
      ],
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

fs.rmSync(path.join(PUBLIC_MEDIA, 'images'), { recursive: true, force: true });
fs.rmSync(path.join(PUBLIC_MEDIA, 'videos'), { recursive: true, force: true });
fs.rmSync(path.join(PUBLIC_MEDIA, 'posters'), { recursive: true, force: true });
fs.rmSync(path.join(PUBLIC_MEDIA, 'showcase'), { recursive: true, force: true });

const imageFiles = walk(folders.images).filter((rel) => IMAGE_EXT.has(extOf(rel)));
const videoFiles = walk(folders.videos).filter((rel) => VIDEO_EXT.has(extOf(rel)));
const posterFiles = walk(folders.posters).filter((rel) => IMAGE_EXT.has(extOf(rel)));
const showcaseFiles = walk(folders.showcase).filter(
  (rel) => IMAGE_EXT.has(extOf(rel)) || VIDEO_EXT.has(extOf(rel)),
);

const posterByRel = new Map();
for (const rel of posterFiles) posterByRel.set(rel, copy(folders.posters, rel, 'posters'));

const items = [];

for (const rel of imageFiles) {
  const src = copy(folders.images, rel, 'images');
  items.push({
    id: ensureUnique(slugify(rel)),
    kind: 'image',
    title: humanize(rel),
    src,
    poster: src,
    file: rel,
  });
}

for (const rel of videoFiles) {
  const src = copy(folders.videos, rel, 'videos');
  const posterRel = findPoster(rel, posterFiles);
  const poster = posterRel
    ? (posterByRel.get(posterRel) ?? copy(folders.posters, posterRel, 'posters'))
    : autoPoster(rel);
  items.push({
    id: ensureUnique(slugify(rel)),
    kind: 'video',
    title: humanize(rel),
    src,
    poster,
    file: rel,
  });
}

const showcase = [];
for (const rel of showcaseFiles) {
  const kind = VIDEO_EXT.has(extOf(rel)) ? 'video' : 'image';
  const src = copy(folders.showcase, rel, 'showcase');
  let poster = null;
  if (kind === 'video') {
    const posterRel = findPoster(rel, posterFiles);
    if (posterRel) poster = posterByRel.get(posterRel) ?? null;
  } else {
    poster = src;
  }
  showcase.push({
    id: ensureUnique(`showcase-${slugify(rel)}`),
    kind,
    title: humanize(rel),
    src,
    poster,
  });
}

const videos = items.filter((item) => item.kind === 'video');
const images = items.filter((item) => item.kind === 'image');

const manifest = {
  generatedAt: new Date().toISOString(),
  counts: { images: images.length, videos: videos.length, showcase: showcase.length },
  items,
  showcase,
  hero: videos[0] ?? images[0] ?? null,
  fallbackHero: images[0] ?? null,
  demo: showcase.find((item) => item.kind === 'video') ?? videos[0] ?? images[0] ?? null,
};

fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(
  `✓ MacFlow media: ${images.length} images, ${videos.length} videos, ${showcase.length} showcase → public/media`,
);

if (items.length === 0) {
  console.log(
    'ℹ Папки wallpapers/* пусты. Добавьте файлы и запустите `npm run media` (или перезапустите dev/build).',
  );
}
