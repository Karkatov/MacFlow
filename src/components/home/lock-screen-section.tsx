import { getTranslations } from 'next-intl/server';
import { lockScreenMedia } from '@/lib/media/library';
import { LazyVideo } from './lazy-video';

/** Блок про живые обои на экране блокировки. */
export async function LockScreenSection() {
  const t = await getTranslations('landing.lockScreen');
  const media = lockScreenMedia;

  return (
    <section className="themes-section">
      <div className="themes-section-wrapper">
        <div className="themes-content" data-animate>
          <span className="section-label">{t('label')}</span>
          <h2 className="themes-heading">{t('title')}</h2>
          <p className="themes-subtitle">{t('subtitle')}</p>
        </div>

        {media ? (
          <div className="theme-large-cards-container" data-animate data-animate-delay="150">
            <div className="theme-video-outer">
              <div className="theme-video-frame">
                <div className="theme-large-card dark-card">
                  {media.kind === 'video' ? (
                    <LazyVideo
                      src={media.src}
                      poster={media.poster}
                      className="theme-large-card-video"
                      ariaLabel={t('title')}
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={media.src}
                      alt={t('title')}
                      className="theme-large-card-video"
                      loading="lazy"
                    />
                  )}
                  <div className="theme-large-card-visual" />
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
