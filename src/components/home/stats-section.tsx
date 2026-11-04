import { getTranslations } from 'next-intl/server';
import { galleryItems, mediaCounts } from '@/lib/media/library';
import { CountUp } from './count-up';
import { LazyVideo } from './lazy-video';

/** Блок статистики с видео-фоном и анимированными счётчиками. */
export async function StatsSection() {
  const t = await getTranslations('landing.stats');
  const items = galleryItems();
  const videoPool = items.filter((item) => item.kind === 'video');
  const fallback = items[0] ?? null;

  const cards = [
    {
      key: 'wallpapers',
      value: mediaCounts.images + mediaCounts.videos,
      suffix: '+',
      title: t('items.wallpapers'),
    },
    {
      key: 'categories',
      value: 9,
      suffix: '',
      title: t('items.categories'),
    },
    {
      key: 'resolution',
      value: 4,
      suffix: 'K',
      title: t('items.resolution'),
    },
    {
      key: 'trial',
      value: 24,
      suffix: 'h',
      title: t('items.trial'),
    },
  ];

  const mediaFor = (index: number) => videoPool[index % Math.max(videoPool.length, 1)] ?? fallback;

  return (
    <section className="analytics-section" id="analytics">
      <div className="analytics-inner">
        <div className="analytics-header" data-animate>
          <span className="section-label">{t('label')}</span>
          <h2 className="analytics-heading">{t('title')}</h2>
          <p className="analytics-subtitle">{t('subtitle')}</p>
        </div>

        <div className="analytics-cards-container" data-animate="scale" data-animate-delay="100">
          <div className="analytics-cards-row">
            {cards.slice(0, 2).map((card, index) => {
              const media = mediaFor(index);
              return (
                <div key={card.key} className="analytics-card analytics-card-half">
                  {media ? (
                    <LazyVideo
                      src={media.src}
                      poster={media.poster}
                      className="analytics-card-video"
                      ariaLabel={card.title}
                    />
                  ) : null}
                  <div className="analytics-card-content">
                    <div className="analytics-card-number-wrapper">
                      <div className="analytics-card-number">
                        <CountUp value={card.value} />
                      </div>
                      {card.suffix ? (
                        <div className="analytics-card-number-suffix">{card.suffix}</div>
                      ) : null}
                    </div>
                    <div className="analytics-card-title">{card.title}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="analytics-cards-row analytics-cards-row--three">
            {cards.slice(2).map((card, index) => {
              const media = mediaFor(index + 2);
              return (
                <div key={card.key} className="analytics-card analytics-card-third">
                  {media ? (
                    <LazyVideo
                      src={media.src}
                      poster={media.poster}
                      className="analytics-card-video"
                      ariaLabel={card.title}
                    />
                  ) : null}
                  <div className="analytics-card-content">
                    <div className="analytics-card-number-wrapper">
                      <div className="analytics-card-number">
                        <CountUp value={card.value} />
                      </div>
                      {card.suffix ? (
                        <div className="analytics-card-number-suffix">{card.suffix}</div>
                      ) : null}
                    </div>
                    <div className="analytics-card-title">{card.title}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
