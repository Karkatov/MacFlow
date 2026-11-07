#!/usr/bin/env node
/**
 * MacFlow — генератор демонстрационных обоев.
 *
 * Создаёт стартовый набор SVG-обоев и коротких mp4-роликов, чтобы сайт
 * выглядел живым сразу после клонирования. Все файлы лежат в корневой
 * папке `wallpapers/` — их можно удалить и заменить своими.
 * Запуск: `node scripts/generate-demo-media.mjs`
 * Требуется ffmpeg + ImageMagick (для видео и постеров).
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const imagesDir = path.join(root, 'wallpapers/gallery/image');
const videosDir = path.join(root, 'wallpapers/gallery/video');
const postersDir = path.join(root, 'wallpapers/posters');

for (const dir of [imagesDir, videosDir, postersDir]) {
  fs.mkdirSync(dir, { recursive: true });
}

const grain = `
  <filter id="grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
    <feComponentTransfer><feFuncA type="linear" slope="0.10"/></feComponentTransfer>
  </filter>`;

const blur = (id, amount) =>
  `<filter id="${id}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${amount}"/></filter>`;

const defs = `
  <defs>
    ${grain}
    ${blur('b80', 80)}
    ${blur('b140', 140)}
    ${blur('b220', 220)}
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.45"/>
    </linearGradient>
  </defs>`;

const arts = {
  'demo-aurora': `
    <rect width="1600" height="1000" fill="#05070f"/>
    <ellipse cx="340" cy="240" rx="620" ry="300" fill="#1d4ed8" opacity="0.5" filter="url(#b220)"/>
    <ellipse cx="1280" cy="180" rx="540" ry="260" fill="#7c3aed" opacity="0.45" filter="url(#b220)"/>
    <ellipse cx="820" cy="470" rx="720" ry="240" fill="#22d3ee" opacity="0.32" filter="url(#b140)"/>
    <path d="M-100 620 C 280 420 520 720 860 520 S 1380 360 1720 560 L 1720 1000 L -100 1000Z" fill="#0b1224"/>
    <path d="M-100 760 C 320 590 600 820 980 660 S 1420 560 1720 700 L 1720 1000 L -100 1000Z" fill="#070b16"/>
    <ellipse cx="800" cy="660" rx="900" ry="180" fill="#6e8efa" opacity="0.18" filter="url(#b140)"/>
    <rect width="1600" height="1000" filter="url(#grain)"/>
    <rect width="1600" height="1000" fill="url(#fade)"/>`,
  'demo-nebula': `
    <rect width="1600" height="1000" fill="#080510"/>
    <ellipse cx="560" cy="420" rx="480" ry="360" fill="#6d28d9" opacity="0.55" filter="url(#b220)"/>
    <ellipse cx="1120" cy="560" rx="440" ry="340" fill="#db2777" opacity="0.38" filter="url(#b220)"/>
    <ellipse cx="820" cy="430" rx="240" ry="180" fill="#f0abfc" opacity="0.22" filter="url(#b140)"/>
    <circle cx="820" cy="430" r="70" fill="#fff" opacity="0.6" filter="url(#b80)"/>
    <g fill="#fff" opacity="0.85">
      <circle cx="240" cy="180" r="2"/><circle cx="420" cy="300" r="1.4"/><circle cx="1320" cy="180" r="2.4"/>
      <circle cx="1480" cy="420" r="1.2"/><circle cx="1080" cy="120" r="1.6"/><circle cx="720" cy="160" r="1.2"/>
      <circle cx="180" cy="640" r="1.6"/><circle cx="1420" cy="780" r="2"/><circle cx="980" cy="860" r="1.2"/>
      <circle cx="320" cy="860" r="1.4"/><circle cx="1240" cy="640" r="1.1"/><circle cx="620" cy="760" r="1.3"/>
    </g>
    <rect width="1600" height="1000" filter="url(#grain)"/>
    <rect width="1600" height="1000" fill="url(#fade)"/>`,
  'demo-ocean': `
    <rect width="1600" height="1000" fill="#020a12"/>
    <rect y="0" width="1600" height="520" fill="#062b3f"/>
    <ellipse cx="800" cy="430" rx="700" ry="220" fill="#0ea5e9" opacity="0.4" filter="url(#b220)"/>
    <ellipse cx="800" cy="500" rx="320" ry="120" fill="#67e8f9" opacity="0.35" filter="url(#b140)"/>
    <path d="M0 520 H1600 V1000 H0Z" fill="#031a29"/>
    <path d="M0 600 C 260 520 420 660 720 590 S 1240 520 1600 610 V1000 H0Z" fill="#05283d"/>
    <path d="M0 720 C 340 640 540 780 900 700 S 1400 640 1600 730 V1000 H0Z" fill="#031c2c"/>
    <path d="M0 850 C 380 780 700 900 1060 830 S 1460 790 1600 860 V1000 H0Z" fill="#020f1a"/>
    <ellipse cx="800" cy="560" rx="540" ry="60" fill="#a5f3fc" opacity="0.16" filter="url(#b80)"/>
    <rect width="1600" height="1000" filter="url(#grain)"/>
    <rect width="1600" height="1000" fill="url(#fade)"/>`,
  'demo-dunes': `
    <rect width="1600" height="1000" fill="#160a08"/>
    <ellipse cx="1180" cy="260" rx="520" ry="300" fill="#fb923c" opacity="0.45" filter="url(#b220)"/>
    <ellipse cx="420" cy="360" rx="500" ry="260" fill="#f472b6" opacity="0.3" filter="url(#b220)"/>
    <circle cx="1180" cy="300" r="120" fill="#fed7aa" opacity="0.5" filter="url(#b80)"/>
    <path d="M-80 700 C 320 560 620 720 940 620 S 1420 500 1680 640 V1000 H-80Z" fill="#3b120c"/>
    <path d="M-80 820 C 380 690 720 840 1080 740 S 1500 660 1680 760 V1000 H-80Z" fill="#220a08"/>
    <path d="M-80 920 C 420 820 820 950 1200 870 S 1560 820 1680 880 V1000 H-80Z" fill="#120504"/>
    <ellipse cx="900" cy="760" rx="760" ry="70" fill="#fdba74" opacity="0.12" filter="url(#b80)"/>
    <rect width="1600" height="1000" filter="url(#grain)"/>
    <rect width="1600" height="1000" fill="url(#fade)"/>`,
  'demo-forest': `
    <rect width="1600" height="1000" fill="#04110b"/>
    <ellipse cx="520" cy="260" rx="520" ry="320" fill="#15803d" opacity="0.45" filter="url(#b220)"/>
    <ellipse cx="1220" cy="360" rx="480" ry="300" fill="#0d9488" opacity="0.3" filter="url(#b220)"/>
    <g stroke="#d9f99d" stroke-width="12" opacity="0.12" filter="url(#b80)">
      <path d="M300 -50 L520 1050"/><path d="M600 -50 L820 1050"/><path d="M980 -50 L1180 1050"/>
    </g>
    <g fill="#03150d">
      <path d="M120 1000 L210 520 L300 1000Z"/><path d="M360 1000 L470 400 L580 1000Z"/>
      <path d="M1080 1000 L1200 420 L1320 1000Z"/><path d="M1360 1000 L1460 560 L1560 1000Z"/>
      <path d="M660 1000 L760 600 L860 1000Z"/>
    </g>
    <ellipse cx="800" cy="820" rx="820" ry="140" fill="#052e16" opacity="0.8" filter="url(#b140)"/>
    <rect width="1600" height="1000" filter="url(#grain)"/>
    <rect width="1600" height="1000" fill="url(#fade)"/>`,
  'demo-neon': `
    <rect width="1600" height="1000" fill="#06040f"/>
    <ellipse cx="420" cy="380" rx="520" ry="340" fill="#2563eb" opacity="0.4" filter="url(#b220)"/>
    <ellipse cx="1220" cy="300" rx="520" ry="300" fill="#d946ef" opacity="0.32" filter="url(#b220)"/>
    <g fill="#0a0818">
      <rect x="60" y="520" width="150" height="480"/><rect x="240" y="440" width="120" height="560"/>
      <rect x="390" y="600" width="180" height="400"/><rect x="600" y="480" width="130" height="520"/>
      <rect x="760" y="560" width="200" height="440"/><rect x="990" y="420" width="140" height="580"/>
      <rect x="1160" y="540" width="190" height="460"/><rect x="1380" y="460" width="150" height="540"/>
    </g>
    <g fill="#60a5fa" opacity="0.65">
      <rect x="270" y="500" width="8" height="470"/><rect x="640" y="540" width="6" height="430"/>
      <rect x="1030" y="480" width="8" height="490"/><rect x="1420" y="520" width="6" height="440"/>
    </g>
    <g fill="#e879f9" opacity="0.55">
      <rect x="90" y="590" width="8" height="380"/><rect x="430" y="670" width="6" height="300"/>
      <rect x="1210" y="600" width="8" height="370"/><rect x="800" y="630" width="6" height="340"/>
    </g>
    <ellipse cx="800" cy="980" rx="880" ry="120" fill="#6e8efa" opacity="0.22" filter="url(#b140)"/>
    <rect width="1600" height="1000" filter="url(#grain)"/>
    <rect width="1600" height="1000" fill="url(#fade)"/>`,
  'demo-cosmos': `
    <rect width="1600" height="1000" fill="#020205"/>
    <ellipse cx="800" cy="500" rx="520" ry="220" fill="#f97316" opacity="0.4" filter="url(#b140)"/>
    <ellipse cx="800" cy="500" rx="640" ry="300" fill="#7c3aed" opacity="0.35" filter="url(#b220)"/>
    <circle cx="800" cy="500" r="180" fill="#000"/>
    <circle cx="800" cy="500" r="188" fill="none" stroke="#fde68a" stroke-width="4" opacity="0.7" filter="url(#b80)"/>
    <ellipse cx="800" cy="500" rx="430" ry="120" fill="none" stroke="#fdba74" stroke-width="3" opacity="0.45" transform="rotate(-16 800 500)"/>
    <ellipse cx="800" cy="500" rx="560" ry="160" fill="none" stroke="#a78bfa" stroke-width="2" opacity="0.35" transform="rotate(14 800 500)"/>
    <g fill="#fff" opacity="0.8">
      <circle cx="220" cy="240" r="1.8"/><circle cx="1380" cy="240" r="2"/><circle cx="300" cy="780" r="1.4"/>
      <circle cx="1260" cy="760" r="1.7"/><circle cx="1420" cy="560" r="1.2"/><circle cx="180" cy="540" r="1.3"/>
    </g>
    <rect width="1600" height="1000" filter="url(#grain)"/>
    <rect width="1600" height="1000" fill="url(#fade)"/>`,
  'demo-silk': `
    <rect width="1600" height="1000" fill="#0b0b0e"/>
    <ellipse cx="600" cy="360" rx="700" ry="380" fill="#3f3f46" opacity="0.55" filter="url(#b220)"/>
    <ellipse cx="1180" cy="640" rx="600" ry="360" fill="#71717a" opacity="0.3" filter="url(#b220)"/>
    <path d="M-100 380 C 300 200 520 480 860 300 S 1380 180 1720 380" fill="none" stroke="#e4e4e7" stroke-width="90" stroke-linecap="round" opacity="0.16" filter="url(#b80)"/>
    <path d="M-100 580 C 340 400 560 700 920 500 S 1420 400 1720 580" fill="none" stroke="#fafafa" stroke-width="60" stroke-linecap="round" opacity="0.14" filter="url(#b80)"/>
    <path d="M-100 780 C 380 620 640 860 1000 680 S 1460 600 1720 780" fill="none" stroke="#a1a1aa" stroke-width="40" stroke-linecap="round" opacity="0.15" filter="url(#b80)"/>
    <rect width="1600" height="1000" filter="url(#grain)"/>
    <rect width="1600" height="1000" fill="url(#fade)"/>`,
};

const videos = [
  { name: 'demo-aurora', art: 'demo-aurora', zoom: 'zoom in' },
  { name: 'demo-ocean', art: 'demo-ocean', zoom: 'zoom out' },
  { name: 'demo-neon', art: 'demo-neon', zoom: 'in' },
  { name: 'demo-cosmos', art: 'demo-cosmos', zoom: 'out' },
];

let createdImages = 0;
for (const [name, body] of Object.entries(arts)) {
  const file = path.join(imagesDir, `${name}.svg`);
  if (fs.existsSync(file)) continue;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">${defs}${body}</svg>\n`;
  fs.writeFileSync(file, svg);
  createdImages += 1;
}
console.log(`✓ demo images: ${createdImages} created, ${Object.keys(arts).length} total`);

function has(bin) {
  try {
    execFileSync('which', [bin], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

if (!has('ffmpeg') || !has('magick')) {
  console.log('ℹ ffmpeg или ImageMagick не найдены — видео-демо пропущены.');
  process.exit(0);
}

const tmp = path.join(root, '.media-tmp');
fs.mkdirSync(tmp, { recursive: true });

for (const item of videos) {
  const mp4 = path.join(videosDir, `${item.name}.mp4`);
  const poster = path.join(postersDir, `${item.name}.jpg`);
  const png = path.join(tmp, `${item.name}.png`);
  const svg = path.join(imagesDir, `${item.art}.svg`);

  if (!fs.existsSync(mp4)) {
    execFileSync('magick', [
      svg,
      '-resize',
      '1440x900^',
      '-gravity',
      'center',
      '-extent',
      '1440x900',
      png,
    ]);
    const zoomIn =
      "zoompan=z='min(zoom+0.0006,1.16)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=192:s=1440x900:fps=24";
    const zoomOut =
      "zoompan=z='if(eq(on,1),1.16,max(zoom-0.0006,1))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=192:s=1440x900:fps=24";
    execFileSync(
      'ffmpeg',
      [
        '-y',
        '-loop',
        '1',
        '-i',
        png,
        '-vf',
        item.zoom.includes('out') ? zoomOut : zoomIn,
        '-t',
        '8',
        '-c:v',
        'libx264',
        '-pix_fmt',
        'yuv420p',
        '-crf',
        '26',
        '-preset',
        'slow',
        '-movflags',
        '+faststart',
        '-an',
        mp4,
      ],
      { stdio: 'ignore' },
    );
    console.log(`✓ video ${item.name}.mp4`);
  }

  if (!fs.existsSync(poster)) {
    execFileSync('ffmpeg', ['-y', '-ss', '1', '-i', mp4, '-frames:v', '1', '-q:v', '4', poster], {
      stdio: 'ignore',
    });
    console.log(`✓ poster ${item.name}.jpg`);
  }
}

// Один общий demo-ролик для блока «Watch it in action».
const showcaseDir = path.join(root, 'wallpapers/demo/video');
fs.mkdirSync(showcaseDir, { recursive: true });
const showcase = path.join(showcaseDir, 'demo-showcase.mp4');
const showcasePoster = path.join(postersDir, 'demo-showcase.jpg');
if (!fs.existsSync(showcase)) {
  const base = path.join(videosDir, 'demo-aurora.mp4');
  execFileSync(
    'ffmpeg',
    [
      '-y',
      '-i',
      base,
      '-vf',
      'scale=1440:900,eq=brightness=0.02',
      '-c:v',
      'libx264',
      '-pix_fmt',
      'yuv420p',
      '-crf',
      '27',
      '-preset',
      'slow',
      '-movflags',
      '+faststart',
      '-an',
      showcase,
    ],
    { stdio: 'ignore' },
  );
  console.log('✓ showcase demo-showcase.mp4');
}
if (!fs.existsSync(showcasePoster)) {
  execFileSync(
    'ffmpeg',
    ['-y', '-ss', '1', '-i', showcase, '-frames:v', '1', '-q:v', '4', showcasePoster],
    { stdio: 'ignore' },
  );
}

fs.rmSync(tmp, { recursive: true, force: true });
console.log('✓ demo media ready');
