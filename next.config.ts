import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { resolveBuildMode } from './src/config/build';

type RemotePattern = { protocol: 'http' | 'https'; hostname: string };

/**
 * Домены изображений: базовые + CDN/S3 из переменных окружения.
 * Нужно, чтобы `next/image` в серверном режиме мог оптимизировать медиа с CDN.
 */
function imageRemotePatterns(): RemotePattern[] {
  const patterns: RemotePattern[] = [
    { protocol: 'https', hostname: '**.macflow.app' },
    { protocol: 'https', hostname: '**.timeweb.cloud' },
  ];

  for (const value of [process.env.NEXT_PUBLIC_CDN_BASE_URL, process.env.NEXT_PUBLIC_S3_BASE_URL]) {
    if (!value) continue;

    try {
      const url = new URL(value);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') continue;

      const pattern: RemotePattern = {
        protocol: url.protocol === 'http:' ? 'http' : 'https',
        hostname: url.hostname,
      };

      if (!patterns.some((item) => item.hostname === pattern.hostname)) {
        patterns.push(pattern);
      }
    } catch {
      // Некорректный URL в env — просто игнорируем, сборка не должна падать.
    }
  }

  return patterns;
}

/**
 * Режим сборки.
 *
 * По умолчанию используется статический экспорт: часть хостингов
 * (Cloudflare Pages) не передаёт переменные окружения в процесс сборки,
 * а каталог `out/` там обязателен. Серверные режимы включаются явно.
 *
 * Значения NEXT_OUTPUT:
 *  - 'export'     (по умолчанию, любое другое значение) — статический экспорт
 *                  в `out/`: Cloudflare Pages, GitHub Pages, любой статический хостинг.
 *  - 'server'     — обычный Next.js сервер / ISR: Vercel, Netlify, VPS.
 *  - 'standalone' — output: 'standalone' для Docker/VPS.
 *
 * Для статического экспорта с поддоменом задайте NEXT_BASE_PATH
 * (например '/MacFlowSite') и NEXT_ASSET_PREFIX.
 */
const buildMode = resolveBuildMode();
const isStandaloneMode = buildMode === 'standalone';
const isStaticExport = buildMode === 'export';
const basePath = process.env.NEXT_BASE_PATH ?? '';
const assetPrefix = process.env.NEXT_ASSET_PREFIX ?? '';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/**
 * Базовые заголовки безопасности.
 * TODO: после подключения реального API и аналитики расширить connect-src/script-src.
 */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Next.js инжектит inline-скрипты; 'unsafe-eval' нужен только в dev (HMR).
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "media-src 'self' blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https: wss:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  // --- Базовые пути (нужны для GitHub Pages) ---
  basePath: basePath || undefined,
  assetPrefix: assetPrefix || undefined,

  // --- Режим вывода ---
  ...(isStandaloneMode ? { output: 'standalone' as const } : {}),
  ...(isStaticExport ? { output: 'export' as const } : {}),

  // API Route Handlers называются `route.server.ts`: в статическом экспорте
  // такая страница не находится, поэтому /api/** не попадает в `out/`.
  // В серверном режиме расширение включается первым, чтобы путь `/route`
  // корректно распознавался как Route Handler.
  pageExtensions: isStaticExport
    ? ['tsx', 'ts', 'jsx', 'js']
    : ['server.ts', 'tsx', 'ts', 'jsx', 'js'],

  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: false,

  // Явно задаём корень проекта: иначе Next ищет ближайший package-lock.json
  // вверх по дереву и может выбрать чужой (предупреждение про workspace root).
  outputFileTracingRoot: process.cwd(),

  // В статическом экспорте next/image требует unoptimized (нет image-сервера).
  images: {
    unoptimized: isStaticExport,
    formats: ['image/avif', 'image/webp'],
    // Локальные SVG-плейсхолдеры: next/image их не оптимизирует, поэтому
    // разрешаем SVG и жёстко ограничиваем его обработку.
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // CDN/S3 подхватываются из NEXT_PUBLIC_CDN_BASE_URL / NEXT_PUBLIC_S3_BASE_URL.
    remotePatterns: imageRemotePatterns(),
    // Оптимизированные next/image картинки кэшируем 30 дней в серверном режиме.
    minimumCacheTTL: 2_592_000,
  },

  // Короткие редиректы: / → /ru (в статическом экспорте не поддерживаются,
  // там корень закрывает scripts/postbuild.mjs мета-редиректом).
  ...(isStaticExport
    ? {}
    : {
        async redirects() {
          return [
            { source: '/', destination: '/ru', permanent: false },
            { source: '/wallpapers', destination: '/ru/wallpapers', permanent: false },
            { source: '/pricing', destination: '/ru/pricing', permanent: false },
          ];
        },
      }),

  // Заголовки применяются только в серверном режиме: в статическом экспорте
  // next.config не умеет их отдавать (статичные хостинги читают public/_headers).
  ...(isStaticExport
    ? {}
    : {
        async headers() {
          return [
            { source: '/:path*', headers: securityHeaders },
            {
              source: '/_next/static/:path*',
              headers: [
                {
                  key: 'Cache-Control',
                  value: 'public, max-age=31536000, immutable',
                },
              ],
            },
            {
              source: '/placeholders/:path*',
              headers: [
                {
                  key: 'Cache-Control',
                  value: 'public, max-age=604800, stale-while-revalidate=86400',
                },
              ],
            },
            {
              source: '/og/:path*',
              headers: [
                {
                  key: 'Cache-Control',
                  value: 'public, max-age=604800, stale-while-revalidate=86400',
                },
              ],
            },
            {
              source: '/download/:path*',
              headers: [
                {
                  key: 'Cache-Control',
                  value: 'public, max-age=3600, stale-while-revalidate=86400',
                },
              ],
            },
          ];
        },
      }),

  // Webpack-оптимизация: выносим тяжёлые библиотеки в отдельные чанки.
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
    // Кастомная app/global-not-found.tsx: брендированная 404-страница
    // для маршрутов, не совпавших ни с одной локалью (в т.ч. 404.html в экспорте).
    globalNotFound: true,
  },
};

export default withNextIntl(nextConfig);
