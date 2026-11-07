import { getTranslations } from 'next-intl/server';
import { demoMedia } from '@/lib/media/library';
import { LazyVideo } from './lazy-video';

/** Блок «Watch it in action» — большой демо-ролик в рамке. */
export async function DemoSection() {
  const t = await getTranslations('landing.demo');

  return (
    <section
      className="watch-action-section"
      id="watch-in-action"
      aria-labelledby="watch-action-heading"
    >
      <div className="watch-action-inner">
        <div className="watch-action-header" data-animate>
          <span className="section-label">{t('label')}</span>
          <h2 id="watch-action-heading" className="watch-action-heading">
            {t('title')}
          </h2>
          <p className="watch-action-subtitle">{t('subtitle')}</p>
        </div>

        {demoMedia ? (
          <div className="watch-action-video-outer" data-animate data-animate-delay="100">
            <div className="watch-action-video-frame">
              {demoMedia.kind === 'video' ? (
                <LazyVideo
                  src={demoMedia.src}
                  poster={demoMedia.poster}
                  className="watch-action-video"
                  ariaLabel={t('title')}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={demoMedia.src}
                  alt={t('title')}
                  className="watch-action-video"
                  loading="lazy"
                />
              )}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
