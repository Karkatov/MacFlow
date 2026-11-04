import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { siteConfig } from '@/config/site';

/**
 * Карта сайта.
 *
 * Генерируется динамически: при подключении реального API список обоев
 * подтянется из бэкенда (см. TODO.md).
 */
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = `https://${siteConfig.domain}`;

  const staticPaths = [
    { path: '', priority: 1, changeFrequency: 'weekly' as const },
    { path: '/pricing', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/about', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/faq', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/support', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/download', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/legal/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/legal/terms', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/legal/offer', priority: 0.3, changeFrequency: 'yearly' as const },
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const item of staticPaths) {
      entries.push({
        url: `${base}/${locale}${item.path}`,
        lastModified: new Date(),
        changeFrequency: item.changeFrequency,
        priority: item.priority,
      });
    }
  }

  return entries;
}
