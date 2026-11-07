import { getTranslations } from 'next-intl/server';
import {
  demoMedia,
  galleryItems,
  heroMedia,
  lockScreenMedia,
  type MediaItem,
} from '@/lib/media/library';
import { LazyVideo } from './lazy-video';

/** Ноутбук с живым рабочим столом и окном приложения. */
export async function LaptopSection() {
  const t = await getTranslations('landing.laptop');
  const items = galleryItems();
  const videos = items.filter((item) => item.kind === 'video');
  const fallback = [heroMedia, lockScreenMedia, demoMedia].filter(
    (item): item is MediaItem => item?.kind === 'video',
  );
  const background = videos[0] ?? fallback[0] ?? null;
  const screen = videos[1] ?? videos[0] ?? fallback[1] ?? fallback[0] ?? null;

  return (
    <section className="laptop-section">
      <div className="laptop-bg-wrap">
        {background ? (
          <LazyVideo
            src={background.src}
            poster={background.poster}
            className="laptop-bg-video"
            ariaLabel={t('alt')}
          />
        ) : null}
        <div className="laptop-bg-gradient" aria-hidden="true" />
        <div className="laptop-bg-grain" aria-hidden="true" />
      </div>

      <div className="laptop-inner">
        <div className="laptop-wrapper">
          <div className="laptop-screen">
            {screen ? (
              <LazyVideo
                src={screen.src}
                poster={screen.poster}
                className="screen-video"
                ariaLabel={t('alt')}
              />
            ) : null}
            <div
              className="screen-overlay"
              style={{ '--overlay-width': '65%' } as React.CSSProperties}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/app-window.svg" alt="" loading="lazy" />
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="laptop-frame"
            src="/macbook-frame.svg"
            alt=""
            width={1280}
            height={800}
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
