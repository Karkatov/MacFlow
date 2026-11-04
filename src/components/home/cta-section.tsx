import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

const APPLE_PATH =
  'M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z';

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 12l2 2 4-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** Финальный призыв к действию. */
export async function CtaSection({ demoHref }: { demoHref: string | null }) {
  const t = await getTranslations('landing.cta');

  return (
    <section className="cta-section">
      <div className="cta-glow" aria-hidden="true" />
      <div className="cta-inner" data-animate="scale">
        <div className="cta-logo-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/macflow-icon.svg" alt="MacFlow logo" className="cta-logo" loading="lazy" />
        </div>
        <h2 className="cta-heading">
          {t('title')}
          <br />
          {t('titleAccent')}
        </h2>
        <p className="cta-description">{t('description')}</p>

        <div className="cta-buttons">
          <Link href="/download" className="cta-btn cta-btn--primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d={APPLE_PATH} />
            </svg>
            {t('download')}
          </Link>
          {demoHref ? (
            <a
              href={demoHref}
              className="cta-btn cta-btn--secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('watchDemo')}
            </a>
          ) : null}
        </div>

        <div className="cta-trust">
          <div className="cta-trust-item">
            <CheckIcon />
            <span>{t('trust1')}</span>
          </div>
          <div className="cta-trust-item">
            <CheckIcon />
            <span>{t('trust2')}</span>
          </div>
          <div className="cta-trust-item">
            <CheckIcon />
            <span>{t('trust3')}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
