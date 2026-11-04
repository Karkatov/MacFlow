import type { Metadata } from 'next';
import { createHash } from 'node:crypto';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { buildMetadata } from '@/lib/seo/metadata';
import { mockWallpapers } from '@/data/mock/wallpapers';
import { mockUsers } from '@/data/mock/users';
import { AdminPanel } from '@/components/admin/admin-panel';
import { Reveal } from '@/components/shared/motion';

/** Демо-пароль, если переменная окружения не задана. */
const FALLBACK_PASSWORD = 'macflow-admin';

/** SHA-256 от пароля — на клиент уходит только хеш, а не сам пароль. */
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin' });

  return buildMetadata({
    title: t('title'),
    description: t('subtitle'),
    path: '/admin',
    locale,
    noIndex: true,
  });
}

export default async function AdminPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('admin');
  const password =
    process.env.ADMIN_PASSWORD ?? process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? FALLBACK_PASSWORD;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:py-16">
      <Reveal>
        <header className="max-w-2xl">
          <h1 className="text-foreground text-display-md">{t('title')}</h1>
          <p className="text-muted-foreground mt-3 text-base leading-relaxed text-pretty">
            {t('subtitle')}
          </p>
        </header>
      </Reveal>

      <Reveal delay={0.08} direction="scale">
        <div className="mt-10">
          <AdminPanel
            passwordHash={hashPassword(password)}
            wallpapers={mockWallpapers}
            users={mockUsers}
          />
        </div>
      </Reveal>
    </div>
  );
}
