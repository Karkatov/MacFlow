#!/usr/bin/env node
/**
 * Постобработка после `next build`.
 *
 * Для режима NEXT_OUTPUT=export (GitHub Pages и любой статический хостинг)
 * создаёт корень out/index.html с редиректом на локаль /ru — статический
 * экспорт не умеет серверные редиректы.
 *
 * Для остальных режимов печатает подсказки по деплою.
 */

import { copyFileSync, existsSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const basePath = process.env.NEXT_BASE_PATH ?? '';

/**
 * Режим сборки определяем по фактическому результату, а не только по env:
 * статический экспорт включается в next.config.ts принудительно, поэтому
 * NEXT_OUTPUT на хостинге может отсутствовать или не совпадать с режимом.
 */
const requestedMode = (process.env.NEXT_OUTPUT ?? '').toLowerCase();
const outputMode =
  requestedMode === 'server' ? 'server' : requestedMode === 'standalone' ? 'standalone' : 'export';

function dirSize(dir) {
  let total = 0;
  let files = 0;

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = dirSize(full);
      total += nested.total;
      files += nested.files;
    } else {
      total += statSync(full).size;
      files += 1;
    }
  }

  return { total, files };
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

if (outputMode === 'export') {
  const outDir = join(root, 'out');

  if (!existsSync(outDir)) {
    console.error('✖ Каталог out/ не найден. Проверьте, что сборка завершилась успешно.');
    process.exit(1);
  }

  // 404: Next отдаёт 404.html, если есть not-found/global-not-found.
  const notFoundCandidates = ['404.html', '_not-found.html'];
  if (!existsSync(join(outDir, '404.html'))) {
    const fallback = notFoundCandidates.find((name) => existsSync(join(outDir, name)));
    if (fallback) {
      copyFileSync(join(outDir, fallback), join(outDir, '404.html'));
      console.log(`• 404.html создан из ${fallback}`);
    }
  }

  // Корень: редирект / → /ru.
  const target = `${basePath}/ru`;
  const redirectHtml = `<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>MacFlow</title>
    <meta http-equiv="refresh" content="0; url=${target}" />
    <link rel="canonical" href="${target}" />
    <meta name="robots" content="noindex" />
    <style>
      body {
        margin: 0;
        min-height: 100dvh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #0a0a0c;
        color: #f5f5f7;
        font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
      }
      a { color: #22d3ee; }
    </style>
  </head>
  <body>
    <p>Переходим на <a href="${target}">${target}</a>…</p>
    <script>window.location.replace(${JSON.stringify(target)});</script>
  </body>
</html>
`;
  writeFileSync(join(outDir, 'index.html'), redirectHtml);
  console.log(`• out/index.html → редирект на ${target}`);

  const { total, files } = dirSize(outDir);
  console.log(`✔ Статический экспорт готов: ${files} файлов, ${formatBytes(total)}`);
  console.log('  Деплой: содержимое out/ на GitHub Pages / Netlify / Cloudflare Pages.');
  process.exit(0);
}

if (outputMode === 'standalone') {
  console.log('✔ Standalone-сборка готова: .next/standalone');
  console.log('  Запуск: node .next/standalone/server.js');
  console.log('  Не забудьте скопировать .next/static и public рядом с standalone.');
  process.exit(0);
}

console.log('✔ Сборка готова: .next');
console.log('  Локально: npm run start');
console.log('  Деплой: Vercel / Netlify — env: NEXT_OUTPUT=server.');
