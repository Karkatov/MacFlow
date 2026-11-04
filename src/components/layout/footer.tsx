import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { siteConfig } from '@/config/site';

/**
 * Подвал в стиле Wallspace: две линии, юридические ссылки и кредиты.
 */
export function Footer() {
  const t = useTranslations('footer');
  const nav = useTranslations('nav');
  const year = new Date().getFullYear();

  const links = [
    { href: '/pricing', label: nav('pricing') },
    { href: '/download', label: t('download') },
    { href: '/about', label: nav('about') },
    { href: '/faq', label: nav('faq') },
    { href: '/support', label: nav('support') },
    { href: '/legal/privacy', label: t('privacy') },
    { href: '/legal/terms', label: t('terms') },
  ];

  return (
    <footer className="footer-section">
      <div className="footer-inner">
        <div className="footer-divider" />

        <div className="footer-info">
          <p className="footer-info-text">{t('description')}</p>
          <p className="footer-info-links">
            {links.map((link, index) => (
              <span key={link.href}>
                {index > 0 && (
                  <span className="footer-info-separator" aria-hidden="true">
                    ·
                  </span>
                )}
                <Link href={link.href} className="footer-info-link">
                  {link.label}
                </Link>
              </span>
            ))}
          </p>
        </div>

        <div className="footer-divider" />

        <div className="footer-bottom">
          <div className="footer-credits">
            <div className="footer-logo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/macflow-icon.svg"
                alt="MacFlow"
                className="footer-logo-img"
                width={28}
                height={28}
                loading="lazy"
              />
            </div>
            <p className="footer-credit-text">
              <strong>MacFlow</strong> — {t('credit')} © {year}{' '}
              <a href={`mailto:${siteConfig.CONTACTS.email}`} className="footer-company-link">
                {siteConfig.CONTACTS.email}
              </a>
            </p>
          </div>

          <div className="footer-brand">
            <span className="footer-brand-name">MACFLOW</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
