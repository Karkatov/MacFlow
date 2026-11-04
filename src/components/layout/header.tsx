'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { navLinks } from '@/config/site';
import { LangToggle } from './lang-toggle';

/**
 * Шапка в стиле Wallspace: разреженная сетка 1fr auto 1fr,
 * текстовый логотип, центральная навигация и выдвижное мобильное меню.
 */
export function Header() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    document.body.classList.add('no-scroll');
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('no-scroll');
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header className="header animate-slide-down">
        <div className="header-inner">
          <div className="header-left">
            <Link href="/" className="header-brand" aria-label="MacFlow">
              MacFlow
            </Link>
          </div>

          <nav className="header-nav" aria-label={t('mainNav')}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="header-nav-link"
                aria-current={isActive(link.href) ? 'page' : undefined}
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </nav>

          <div className="header-right">
            <LangToggle />
            <Link href="/download" className="header-discord-btn">
              {t('download')}
            </Link>
            <button
              type="button"
              className="header-menu-toggle"
              aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuOpen((value) => !value)}
            >
              <span className="hamburger-line" />
              <span className="hamburger-line" />
              <span className="hamburger-line" />
            </button>
          </div>
        </div>
      </header>

      <div
        className={`mobile-nav-overlay ${menuOpen ? 'is-open' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      <nav
        id="mobile-nav"
        className={`mobile-nav ${menuOpen ? 'is-open' : ''}`}
        aria-label={t('mainNav')}
        aria-hidden={!menuOpen}
      >
        <Link href="/" className="mobile-nav-header" onClick={() => setMenuOpen(false)}>
          <span className="mobile-nav-brand">MacFlow</span>
        </Link>

        <div className="mobile-nav-divider" />

        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="mobile-nav-link"
            onClick={() => setMenuOpen(false)}
          >
            {t(link.labelKey)}
          </Link>
        ))}

        <div className="mobile-nav-divider" />

        <Link
          href="/download"
          className="mobile-nav-discord-btn"
          onClick={() => setMenuOpen(false)}
        >
          {t('download')}
        </Link>
      </nav>
    </>
  );
}
