'use client';

import { useEffect, useState } from 'react';

/**
 * Глобальная страница 404 для маршрутов, которые не совпали ни с одной локалью.
 *
 * Next.js рендерит global-not-found без корневого layout, поэтому документ
 * здесь самодостаточный: свои <html> и <body>.
 */
const COPY = {
  ru: {
    title: 'Страница не найдена',
    body: 'Возможно, ссылка устарела или в адресе опечатка. Вернитесь на главную — там живые обои MacFlow.',
    cta: 'Смотреть обои',
    home: 'На главную',
    code: 'Код ошибки: 404',
  },
  en: {
    title: 'Page not found',
    body: 'The link may be outdated or there is a typo in the address. Head back home — MacFlow live wallpapers are waiting there.',
    cta: 'View wallpapers',
    home: 'Go home',
    code: 'Error code: 404',
  },
} as const;

export default function GlobalNotFound() {
  const [locale, setLocale] = useState<'ru' | 'en'>('ru');

  useEffect(() => {
    if (window.location.pathname.startsWith('/en')) setLocale('en');
  }, []);

  const t = COPY[locale];
  const prefix = locale === 'en' ? '/en' : '/ru';

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: '#0A0A0C',
          color: '#F5F5F7',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
        }}
      >
        <main style={{ maxWidth: '34rem', textAlign: 'center' }}>
          <p
            style={{
              margin: 0,
              fontSize: '0.8rem',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: '#6e8efa',
            }}
          >
            {t.code}
          </p>

          <h1 style={{ margin: '1rem 0 0', fontSize: '2.25rem', lineHeight: 1.1 }}>{t.title}</h1>

          <p style={{ margin: '1rem 0 0', color: 'rgba(245,245,247,0.7)', lineHeight: 1.6 }}>
            {t.body}
          </p>

          <div
            style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', justifyContent: 'center' }}
          >
            <a
              href={`${prefix}/#gallery`}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '999px',
                background: 'linear-gradient(120deg, #6e8efa, #a78bfa)',
                color: '#fff',
                fontSize: '0.9rem',
                textDecoration: 'none',
              }}
            >
              {t.cta}
            </a>
            <a
              href={prefix}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '999px',
                border: '1px solid rgba(245,245,247,0.25)',
                color: '#F5F5F7',
                fontSize: '0.9rem',
                textDecoration: 'none',
              }}
            >
              {t.home}
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
