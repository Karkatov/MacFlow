'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';

/**
 * Переключатель языка RU ↔ EN. Путь сохраняется.
 * Оформлен как обычная ссылка шапки, чтобы совпадать с референсом.
 */
export function LangToggle() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const next = locale === 'ru' ? 'en' : 'ru';
    router.replace(pathname, { locale: next });
  };

  return (
    <button
      type="button"
      className="header-nav-link"
      aria-label={t('language')}
      onClick={toggleLocale}
    >
      {locale.toUpperCase()}
      <span aria-hidden="true" style={{ opacity: 0.4 }}>
        /
      </span>
      {locale === 'ru' ? 'EN' : 'RU'}
    </button>
  );
}
