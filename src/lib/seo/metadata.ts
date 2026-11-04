import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { siteConfig } from '@/config/site';

/**
 * SEO-хелперы: метаданные, канонические URL, hreflang, OG/Twitter.
 */

const BASE_URL = `https://${siteConfig.domain}`;

/** Публичный путь страницы с учётом локали: '/ru/wallpapers'. */
export function localizedPath(path: string, locale: Locale = routing.defaultLocale): string {
  const clean = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
  return `/${locale}${clean}`;
}

/** Абсолютный URL с учётом локали. */
export function absoluteLocalizedUrl(path: string, locale: Locale = routing.defaultLocale): string {
  return `${BASE_URL}${localizedPath(path, locale)}`;
}

/** hreflang-карта для страницы. */
export function languageAlternates(path: string): Record<string, string> {
  const alternates: Record<string, string> = {};
  for (const locale of routing.locales) {
    alternates[locale] = absoluteLocalizedUrl(path, locale);
  }
  alternates['x-default'] = absoluteLocalizedUrl(path, routing.defaultLocale);
  return alternates;
}

export interface BuildMetadataParams {
  title: string;
  description: string;
  /** Путь без локали, например '/wallpapers'. */
  path?: string;
  locale?: Locale;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  keywords?: string[];
  noIndex?: boolean;
}

/**
 * Сборка метаданных страницы.
 *
 * Канонический URL, hreflang для ru/en, OG и Twitter Card.
 */
export function buildMetadata({
  title,
  description,
  path = '/',
  locale = routing.defaultLocale,
  image = '/og/og-default.png',
  type = 'website',
  publishedTime,
  keywords,
  noIndex = false,
}: BuildMetadataParams): Metadata {
  const url = absoluteLocalizedUrl(path, locale);
  const ogImage = image.startsWith('http') ? image : `${BASE_URL}${image}`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
      languages: languageAlternates(path),
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
        },
    openGraph: {
      type,
      title,
      description,
      url,
      siteName: siteConfig.name,
      locale: locale === 'ru' ? 'ru_RU' : 'en_US',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

/** Метаданные по умолчанию для сайта (локаль — из namespace `meta`). */
export async function defaultMetadata(locale: Locale = routing.defaultLocale): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });
  const siteTitle = t('siteTitle');
  const siteDescription = t('siteDescription');

  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: siteTitle,
      template: '%s · MacFlow',
    },
    description: siteDescription,
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.name }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    formatDetection: { telephone: false, address: false, email: false },
    icons: {
      icon: [
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/favicon.ico', sizes: '32x32' },
      ],
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    },
    manifest: '/manifest.webmanifest',
    alternates: {
      canonical: absoluteLocalizedUrl('/', locale),
      languages: languageAlternates('/'),
    },
    openGraph: {
      type: 'website',
      locale: locale === 'ru' ? 'ru_RU' : 'en_US',
      url: absoluteLocalizedUrl('/', locale),
      siteName: siteConfig.name,
      title: siteTitle,
      description: t('ogDescription'),
      images: [{ url: `${BASE_URL}/og/og-default.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: siteTitle,
      description: t('twitterDescription'),
      images: [`${BASE_URL}/og/og-default.png`],
    },
  };
}
