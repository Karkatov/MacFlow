#!/usr/bin/env node
/**
 * Генератор статических ассетов сайта.
 *
 * Создаёт:
 *   public/placeholders/wallpapers/wallpaper-01..12.svg
 *   public/placeholders/categories/category-01..09.svg
 *   public/placeholders/avatars/avatar-01..06.svg
 *   public/placeholders/screenshots/app-*.svg
 *   public/logo.svg, public/favicon.svg
 *   public/favicon.ico, public/apple-touch-icon.png, public/og/og-default.png
 *   public/manifest.webmanifest
 *
 * Запуск: npm run assets  (или node scripts/generate-placeholders.mjs)
 *
 * Палитра дублирует src/styles/theme.ts — скрипт намеренно автономный,
 * чтобы его можно было запускать до установки зависимостей.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(root, 'public');

const PALETTE = {
  background: '#0A0A0C',
  foreground: '#F5F5F7',
  brandFrom: '#7C5CFF',
  brandVia: '#6366F1',
  brandTo: '#22D3EE',
};

const GRADIENTS = [
  ['#7C5CFF', '#22D3EE', '#0EA5E9'],
  ['#6366F1', '#8B5CF6', '#EC4899'],
  ['#22D3EE', '#0F766E', '#7C5CFF'],
  ['#F472B6', '#8B5CF6', '#312E81'],
  ['#38BDF8', '#1E3A8A', '#7C5CFF'],
  ['#FB7185', '#7C5CFF', '#0A0A0C'],
  ['#2DD4BF', '#3B82F6', '#1E1B4B'],
  ['#A78BFA', '#F0ABFC', '#4C1D95'],
  ['#0EA5E9', '#22D3EE', '#164E63'],
  ['#F59E0B', '#EF4444', '#7C2D12'],
  ['#34D399', '#22D3EE', '#064E3B'],
  ['#818CF8', '#22D3EE', '#1E1B4B'],
];

/* ─── утилиты ─────────────────────────────────────────────────────────── */

function write(relativePath, content) {
  const target = join(publicDir, relativePath);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
  return target;
}

function gradientDefs(id, from, via, to) {
  return `
    <defs>
      <linearGradient id="g${id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${from}"/>
        <stop offset="55%" stop-color="${via}"/>
        <stop offset="100%" stop-color="${to}"/>
      </linearGradient>
      <radialGradient id="r${id}" cx="0.75" cy="0.15" r="0.9">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.28"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
    </defs>`;
}

/* ─── SVG-плейсхолдеры ────────────────────────────────────────────────── */

function wallpaperSvg(index) {
  const [from, via, to] = GRADIENTS[index % GRADIENTS.length];
  const id = index;
  const width = 1600;
  const height = 900;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    ${gradientDefs(id, from, via, to)}
    <rect width="${width}" height="${height}" fill="url(#g${id})"/>
    <rect width="${width}" height="${height}" fill="url(#r${id})"/>
    <g opacity="0.18" stroke="#ffffff" stroke-width="1" fill="none">
      <path d="M0 ${height * 0.72} Q ${width * 0.3} ${height * 0.55} ${width * 0.6} ${height * 0.75} T ${width} ${height * 0.68}"/>
      <path d="M0 ${height * 0.82} Q ${width * 0.35} ${height * 0.66} ${width * 0.7} ${height * 0.86} T ${width} ${height * 0.78}"/>
    </g>
    <g transform="translate(${width / 2 - 34} ${height / 2 - 34})" opacity="0.92">
      <circle cx="34" cy="34" r="34" fill="rgba(10,10,12,0.42)" stroke="rgba(255,255,255,0.42)" stroke-width="1.5"/>
      <path d="M26 20 L50 34 L26 48 Z" fill="#ffffff"/>
    </g>
  </svg>`;
}

function categorySvg(index) {
  const [from, via, to] = GRADIENTS[(index + 3) % GRADIENTS.length];
  const id = `c${index}`;
  const width = 1200;
  const height = 900;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    ${gradientDefs(id, from, via, to)}
    <rect width="${width}" height="${height}" fill="url(#g${id})"/>
    <rect width="${width}" height="${height}" fill="url(#r${id})"/>
    <g opacity="0.22" fill="none" stroke="#ffffff" stroke-width="2">
      <circle cx="${width / 2}" cy="${height / 2}" r="150"/>
      <circle cx="${width / 2}" cy="${height / 2}" r="220"/>
    </g>
  </svg>`;
}

function avatarSvg(index) {
  const [from, , to] = GRADIENTS[(index + 7) % GRADIENTS.length];
  const id = `a${index}`;
  const size = 96;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs>
      <linearGradient id="a${id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${from}"/><stop offset="100%" stop-color="${to}"/>
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" rx="${size / 2}" fill="url(#a${id})"/>
    <circle cx="${size / 2}" cy="${size * 0.38}" r="${size * 0.16}" fill="rgba(255,255,255,0.85)"/>
    <path d="M${size * 0.2} ${size * 0.88} a${size * 0.3} ${size * 0.3} 0 0 1 ${size * 0.6} 0 Z" fill="rgba(255,255,255,0.85)"/>
  </svg>`;
}

function screenshotSvg(label, variant, variantIndex) {
  const [from, via, to] = GRADIENTS[(variantIndex + 2) % GRADIENTS.length];
  const id = `s${variant}`;
  const width = 1200;
  const height = 750;

  const panels = {
    main: `<rect x="60" y="60" width="300" height="${height - 120}" rx="20" fill="rgba(10,10,12,0.45)"/>
           <rect x="390" y="60" width="${width - 450}" height="${height - 120}" rx="20" fill="rgba(10,10,12,0.28)"/>`,
    player: `<rect x="60" y="420" width="${width - 120}" height="150" rx="20" fill="rgba(10,10,12,0.5)"/>
             <rect x="100" y="470" width="420" height="12" rx="6" fill="rgba(255,255,255,0.35)"/>`,
    catalog: `<rect x="60" y="60" width="240" height="${height - 120}" rx="20" fill="rgba(10,10,12,0.4)"/>
              ${Array.from({ length: 6 })
                .map((_, i) => {
                  const col = i % 3;
                  const row = Math.floor(i / 3);
                  return `<rect x="${330 + col * 280}" y="${90 + row * 200}" width="250" height="160" rx="16" fill="rgba(255,255,255,${(0.08 + i * 0.03).toFixed(2)})"/>`;
                })
                .join('')}`,
    bend: `<rect x="120" y="180" width="${width - 240}" height="${height - 360}" rx="28" fill="rgba(10,10,12,0.35)"/>
           <path d="M${width / 2} 200 L${width / 2} ${height - 200}" stroke="rgba(255,255,255,0.5)" stroke-width="3" stroke-dasharray="14 12"/>
           <circle cx="${width / 2}" cy="${height / 2}" r="46" fill="rgba(255,255,255,0.18)"/>`,
  };

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    ${gradientDefs(id, from, via, to)}
    <rect width="${width}" height="${height}" fill="#0A0A0C"/>
    <g transform="translate(0 0)">
      <rect width="${width}" height="${height}" fill="url(#g${id})"/>
      <rect width="${width}" height="${height}" fill="url(#r${id})"/>
    </g>
    <g transform="translate(40 40)">
      <rect width="${width - 80}" height="${height - 80}" rx="24" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="2"/>
    </g>
    ${panels[variant] ?? panels.main}
    <text x="${width / 2}" y="${height - 46}" text-anchor="middle" font-family="-apple-system, system-ui, sans-serif" font-size="26" fill="rgba(255,255,255,0.72)">${label}</text>
  </svg>`;
}

function logoSvg(compact) {
  const width = compact ? 40 : 168;
  const height = 40;
  const mark = `<defs>
      <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${PALETTE.brandFrom}"/>
        <stop offset="50%" stop-color="${PALETTE.brandVia}"/>
        <stop offset="100%" stop-color="${PALETTE.brandTo}"/>
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="36" height="36" rx="11" fill="url(#lg)"/>
    <path d="M17 12 L29 20 L17 28 Z" fill="#0A0A0C" opacity="0.88"/>`;

  const wordmark = compact
    ? ''
    : `<text x="50" y="26" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif" font-size="19" font-weight="700" fill="${PALETTE.foreground}">Mac<tspan fill="${PALETTE.brandFrom}">Flow</tspan></text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    ${mark}
    ${wordmark}
  </svg>`;
}

function faviconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <defs>
      <linearGradient id="fav" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${PALETTE.brandFrom}"/>
        <stop offset="50%" stop-color="${PALETTE.brandVia}"/>
        <stop offset="100%" stop-color="${PALETTE.brandTo}"/>
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="16" fill="url(#fav)"/>
    <path d="M26 20 L46 32 L26 44 Z" fill="#0A0A0C" opacity="0.9"/>
  </svg>`;
}

/* ─── Минимальный PNG-энкодер ─────────────────────────────────────────── */

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData));
  return Buffer.concat([length, typeAndData, crc]);
}

/**
 * Собирает PNG из пиксельных данных.
 * @param {number} width
 * @param {number} height
 * @param {(x: number, y: number) => [number, number, number, number]} pixel
 */
function encodePng(width, height, pixel) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  let offset = 0;

  for (let y = 0; y < height; y += 1) {
    raw[offset] = 0; // filter: none
    offset += 1;
    for (let x = 0; x < width; x += 1) {
      const [r, g, b, a] = pixel(x, y);
      raw[offset] = r;
      raw[offset + 1] = g;
      raw[offset + 2] = b;
      raw[offset + 3] = a;
      offset += 4;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function hexToRgb(hex) {
  const value = hex.replace('#', '');
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

function mix(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

/** Плавный диагональный градиент бренда. */
function brandPixel(x, y, width, height) {
  const from = hexToRgb(PALETTE.brandFrom);
  const via = hexToRgb(PALETTE.brandVia);
  const to = hexToRgb(PALETTE.brandTo);
  const t = Math.min(1, Math.max(0, (x / width + y / height) / 2));
  const rgb = t < 0.5 ? mix(from, via, t * 2) : mix(via, to, (t - 0.5) * 2);
  return [rgb[0], rgb[1], rgb[2], 255];
}

function iconPixel(x, y, size) {
  // Скруглённый квадрат с градиентом и «play»-треугольником.
  const radius = size * 0.25;
  const inset = size * 0.04;
  const left = inset;
  const top = inset;
  const right = size - inset;
  const bottom = size - inset;

  const cx = Math.min(Math.max(x, left + radius), right - radius);
  const cy = Math.min(Math.max(y, top + radius), bottom - radius);
  const distance = Math.hypot(x - cx, y - cy);
  if (distance > radius) return [0, 0, 0, 0];

  const rgb = brandPixel(x, y, size, size);

  // Треугольник в центре.
  const tx = (x - size * 0.38) / (size * 0.3);
  const ty = (y - size * 0.3) / (size * 0.4);
  if (tx >= 0 && tx <= 1 && ty >= 0 && ty <= 1 && tx * 0.9 + Math.abs(ty - 0.5) * 1.6 <= 0.9) {
    return [10, 10, 12, 235];
  }

  return [...rgb, 255];
}

/** ICO с вложенным PNG (поддерживается всеми современными браузерами). */
function encodeIco(pngBuffer, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);

  const entry = Buffer.alloc(16);
  entry[0] = size === 256 ? 0 : size;
  entry[1] = size === 256 ? 0 : size;
  entry[2] = 0;
  entry[3] = 0;
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(pngBuffer.length, 8);
  entry.writeUInt32LE(22, 12);

  return Buffer.concat([header, entry, pngBuffer]);
}

/* ─── Генерация ───────────────────────────────────────────────────────── */

const written = [];

for (let i = 1; i <= 12; i += 1) {
  written.push(
    write(
      `placeholders/wallpapers/wallpaper-${String(i).padStart(2, '0')}.svg`,
      wallpaperSvg(i - 1),
    ),
  );
}

for (let i = 1; i <= 9; i += 1) {
  written.push(
    write(`placeholders/categories/category-${String(i).padStart(2, '0')}.svg`, categorySvg(i - 1)),
  );
}

for (let i = 1; i <= 6; i += 1) {
  written.push(
    write(`placeholders/avatars/avatar-${String(i).padStart(2, '0')}.svg`, avatarSvg(i - 1)),
  );
}

const screens = [
  ['app-main.svg', 'MacFlow — главное окно', 'main'],
  ['app-player.svg', 'Плеер и плейлисты', 'player'],
  ['app-catalog.svg', 'Каталог обоев', 'catalog'],
  ['app-bend.svg', 'Эффект Bend', 'bend'],
];

screens.forEach(([file, label, variant], index) => {
  written.push(write(`placeholders/screenshots/${file}`, screenshotSvg(label, variant, index)));
});

written.push(write('logo.svg', logoSvg(false)));
written.push(write('favicon.svg', faviconSvg()));

// Иконки
const appleIcon = encodePng(180, 180, (x, y) => iconPixel(x, y, 180));
writeFileSync(join(publicDir, 'apple-touch-icon.png'), appleIcon);
written.push(join(publicDir, 'apple-touch-icon.png'));

const faviconPng = encodePng(32, 32, (x, y) => iconPixel(x, y, 32));
writeFileSync(join(publicDir, 'favicon.ico'), encodeIco(faviconPng, 32));
written.push(join(publicDir, 'favicon.ico'));

// OG-изображение
const ogWidth = 1200;
const ogHeight = 630;
const ogImage = encodePng(ogWidth, ogHeight, (x, y) => {
  const rgb = brandPixel(x, y, ogWidth, ogHeight);

  // Тёмная виньетка по краям, чтобы белый текст читался.
  const edge = Math.min(
    x / ogWidth,
    (ogWidth - x) / ogWidth,
    y / ogHeight,
    (ogHeight - y) / ogHeight,
  );
  const shade = Math.min(0.55, Math.max(0, (0.12 - edge) * 4));

  // Центральный «play».
  const dx = (x - ogWidth / 2) / 120;
  const dy = (y - ogHeight / 2) / 120;
  if (dx >= -1 && dx <= 1 && dy >= -1 && dy <= 1 && Math.hypot(dx, dy) <= 1) {
    return [10, 10, 12, 200];
  }

  return [
    Math.round(rgb[0] * (1 - shade)),
    Math.round(rgb[1] * (1 - shade)),
    Math.round(rgb[2] * (1 - shade)),
    255,
  ];
});
mkdirSync(join(publicDir, 'og'), { recursive: true });
writeFileSync(join(publicDir, 'og', 'og-default.png'), ogImage);
written.push(join(publicDir, 'og', 'og-default.png'));

// Манифест
const manifest = {
  name: 'MacFlow — живые обои для macOS',
  short_name: 'MacFlow',
  description: 'Живые обои для macOS: рабочий стол, экран блокировки и заставка.',
  start_url: '/ru',
  scope: '/',
  display: 'standalone',
  background_color: PALETTE.background,
  theme_color: PALETTE.background,
  lang: 'ru',
  icons: [
    { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
    { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
  ],
};
written.push(write('manifest.webmanifest', `${JSON.stringify(manifest, null, 2)}\n`));

console.log(`Создано файлов: ${written.length}`);
