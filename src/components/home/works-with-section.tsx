import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

const workKeys = ['macos', 'silicon', 'displays', 'multi'] as const;

/** Строка совместимости «Works with». */
export async function WorksWithSection() {
  const t = await getTranslations('landing.works');

  return (
    <section className="media-partners-section">
      <div className="media-partners-inner">
        <div className="media-partners-header" data-animate>
          <span className="section-label">{t('label')}</span>
        </div>

        <div className="media-partners-grid" data-animate data-animate-delay="100">
          {workKeys.map((key) => (
            <Link
              key={key}
              href="/faq"
              className="media-partner-link media-partner-link--text"
              aria-label={t(`items.${key}.name`)}
            >
              <span className="media-partner-domain">
                {t(`items.${key}.name`)}
                <span className="media-partner-domain-tld"> · {t(`items.${key}.note`)}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
