import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { galleryRows } from '@/lib/media/library';
import { LazyVideo } from './lazy-video';

/**
 * Автоматически бегущая галерея обоев.
 * Все файлы берутся из корневых папок `wallpapers/`.
 */
export async function GalleryMarquee() {
  const t = await getTranslations('landing.gallery');
  const [firstRow, secondRow] = galleryRows();

  const renderRow = (items: typeof firstRow, direction: 'left' | 'right', duration: number) => {
    if (items.length === 0) return null;
    const loop = [...items, ...items];

    return (
      <div className={`wallpaper-row wallpaper-row--${direction}`}>
        <div
          className="wallpaper-track"
          style={{ '--scroll-duration': `${duration}s` } as React.CSSProperties}
        >
          {loop.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="wallpaper-item"
              aria-hidden={index >= items.length ? true : undefined}
            >
              {item.kind === 'video' ? (
                <LazyVideo src={item.src} poster={item.poster} ariaLabel={item.title} />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.src} alt={index >= items.length ? '' : item.title} loading="lazy" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className="wallpaper-scrolling-section" id="gallery">
      <div className="wallpaper-scrolling-inner">
        <div className="wallpaper-scrolling-header" data-animate>
          <span className="section-label">{t('label')}</span>
          <h2 className="wallpaper-scrolling-title">{t('title')}</h2>
          <p className="wallpaper-scrolling-subtitle">{t('subtitle')}</p>
          <Link href="/download" className="wallpaper-scrolling-link">
            {t('link')} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      <div className="wallpaper-scroll-wrapper">
        {renderRow(firstRow, 'right', 110)}
        {renderRow(secondRow, 'left', 100)}
      </div>
    </section>
  );
}
