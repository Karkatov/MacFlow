'use client';

import { useEffect, useRef } from 'react';

type LazyVideoProps = {
  src: string;
  poster?: string | null;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  ariaLabel?: string;
};

/**
 * Видео, которое начинает загружаться только при приближении к вьюпорту.
 * Именно так работают бегущие строки галереи на референсе.
 */
export function LazyVideo({
  src,
  poster,
  className,
  autoPlay = true,
  loop = true,
  playsInline = true,
  ariaLabel,
}: LazyVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    let cancelled = false;

    const load = () => {
      if (cancelled) return;
      if (video.dataset.loaded === 'true') return;
      video.dataset.loaded = 'true';
      video.src = src;
      video.load();
      if (autoPlay) {
        const play = () => video.play().catch(() => undefined);
        video.addEventListener('loadeddata', play, { once: true });
        play();
      }
    };

    if (typeof IntersectionObserver === 'undefined') {
      load();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          load();
          observer.disconnect();
        }
      },
      { rootMargin: '600px 0px', threshold: 0.01 },
    );

    observer.observe(video);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [src, autoPlay]);

  return (
    <video
      ref={ref}
      className={className}
      poster={poster ?? undefined}
      muted
      loop={loop}
      playsInline={playsInline}
      preload="none"
      aria-label={ariaLabel}
    />
  );
}
