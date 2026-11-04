'use client';

import { useTranslations } from 'next-intl';
import { ArrowRight, Home, PackageSearch } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';

/**
 * Страница 404 внутри локализованного раздела.
 */
export default function LocaleNotFound() {
  const t = useTranslations('errors');

  return (
    <div className="mx-auto max-w-[900px] px-4 py-20 sm:px-6 lg:py-28">
      <EmptyState
        icon={PackageSearch}
        title={t('notFoundTitle')}
        description={t('notFoundBody')}
        className="border-solid"
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="gradient">
              <Link href="/#gallery">
                {t('notFoundCta')}
                <ArrowRight className="size-4" />
              </Link>
            </Button>

            <Button asChild variant="outline">
              <Link href="/">
                <Home className="size-4" />
                {t('home')}
              </Link>
            </Button>
          </div>
        }
      />

      <p className="text-muted-foreground mt-6 text-center text-xs">{t('code')}: 404</p>
    </div>
  );
}
