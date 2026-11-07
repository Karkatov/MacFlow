'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { MediaItem } from '@/lib/media/library';

type LockScreenHeroProps = {
  /** Обои, которые показываются в интерактивном экране блокировки. */
  heroMedia: MediaItem | null;
  /** Пул медиа для папок на экране блокировки. */
  folders: MediaItem[];
  /** Ссылка на демо-ролик (локальный файл из wallpapers/demo). */
  demoHref: string | null;
};

const APPLE_PATH =
  'M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z';

const BREW_COMMAND = 'brew install macflow';

function GlassFilter() {
  return (
    <svg style={{ display: 'none' }} aria-hidden="true">
      <filter
        id="glass-distortion"
        x="0%"
        y="0%"
        width="100%"
        height="100%"
        filterUnits="objectBoundingBox"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.01 0.01"
          numOctaves="1"
          seed="5"
          result="turbulence"
        />
        <feComponentTransfer in="turbulence" result="mapped">
          <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
          <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
          <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
        </feComponentTransfer>
        <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
        <feSpecularLighting
          in="softMap"
          surfaceScale="5"
          specularConstant="1"
          specularExponent="100"
          lightingColor="white"
          result="specLight"
        >
          <fePointLight x="-200" y="-200" z="300" />
        </feSpecularLighting>
        <feComposite
          in="specLight"
          operator="arithmetic"
          k1="0"
          k2="1"
          k3="1"
          k4="0"
          result="litImage"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="softMap"
          scale="150"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
}

export function LockScreenHero({ heroMedia, folders, demoHref }: LockScreenHeroProps) {
  const t = useTranslations('landing.hero');
  const locale = useLocale();

  const [current, setCurrent] = useState<MediaItem | null>(heroMedia);
  const [unlocked, setUnlocked] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const [brewOpen, setBrewOpen] = useState(false);
  const [brewCopied, setBrewCopied] = useState(false);
  const [clock, setClock] = useState('12:00');
  const [date, setDate] = useState('');

  const relockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const brewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearRelock = useCallback(() => {
    if (relockTimer.current) {
      clearTimeout(relockTimer.current);
      relockTimer.current = null;
    }
  }, []);

  // Живые часы и дата, как на настоящем экране блокировки macOS.
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const tag = locale === 'ru' ? 'ru-RU' : 'en-US';
      setClock(
        new Intl.DateTimeFormat(tag, {
          hour: '2-digit',
          minute: '2-digit',
        }).format(now),
      );
      setDate(
        new Intl.DateTimeFormat(tag, {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        }).format(now),
      );
    };

    update();
    const interval = setInterval(update, 30_000);
    return () => clearInterval(interval);
  }, [locale]);

  useEffect(
    () => () => {
      clearRelock();
      if (toastTimer.current) clearTimeout(toastTimer.current);
      if (popupTimer.current) clearTimeout(popupTimer.current);
      if (brewTimer.current) clearTimeout(brewTimer.current);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
    },
    [clearRelock],
  );

  const unlock = () => {
    if (unlocked) return;
    setUnlocked(true);
    setToastVisible(false);
  };

  const relock = () => {
    clearRelock();
    setUnlocked(false);
  };

  const handleScreenClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if ((event.target as Element).closest('#mac-logo')) return;
    unlock();
  };

  const handleMacLogo = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (unlocked) relock();
  };

  const handleMouseEnter = () => {
    clearRelock();
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastVisible(true);
    toastTimer.current = setTimeout(() => setToastVisible(false), 3000);
  };

  const handleMouseLeave = () => {
    if (!unlocked) return;
    clearRelock();
    relockTimer.current = setTimeout(() => {
      setUnlocked(false);
      relockTimer.current = null;
    }, 1500);
  };

  const activateFolder = (item: MediaItem) => {
    setActiveFolder(item.id);
    setCurrent(item);
    setTimeout(() => setActiveFolder(null), 200);
  };

  const showPersonalPopup = () => {
    setPopupVisible(true);
    if (popupTimer.current) clearTimeout(popupTimer.current);
    popupTimer.current = setTimeout(() => setPopupVisible(false), 3000);
  };

  const copyBrew = async () => {
    try {
      await navigator.clipboard.writeText(BREW_COMMAND);
      setBrewCopied(true);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setBrewCopied(false), 2000);
    } catch {
      /* clipboard может быть недоступен без https */
    }
  };

  const media = current ?? heroMedia;
  const posterFolders = folders.slice(0, 5);
  const currentTitle = media?.title ?? 'MacFlow';

  return (
    <>
      <div className="main-content">
        <div
          className={`screen-box ${unlocked ? 'unlocked' : ''}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {media?.kind === 'video' ? (
            <video
              key={media.id}
              className={`lockscreen-video ${unlocked ? 'unlocked' : ''}`}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              poster={media.poster ?? undefined}
              aria-label={currentTitle}
            >
              <source src={media.src} type="video/mp4" />
            </video>
          ) : media ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={media.id}
              className={`lockscreen-video ${unlocked ? 'unlocked' : ''}`}
              src={media.src}
              alt={currentTitle}
            />
          ) : (
            <div
              className={`lockscreen-video ${unlocked ? 'unlocked' : ''}`}
              style={{
                backgroundImage: 'linear-gradient(160deg, #23325e 0%, #101524 45%, #3b2a63 100%)',
              }}
              aria-hidden="true"
            />
          )}

          <div
            className={`lockscreen ${unlocked ? 'unlocked' : ''}`}
            id="lockscreen"
            onClick={handleScreenClick}
          >
            <div
              className={`mac-logo ${unlocked ? 'visible' : ''}`}
              id="mac-logo"
              onClick={handleMacLogo}
              role="button"
              tabIndex={unlocked ? 0 : -1}
              aria-label="MacFlow"
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  relock();
                }
              }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d={APPLE_PATH} fill="white" />
              </svg>
            </div>

            <div className={`lockscreen-date ${unlocked ? 'hidden' : ''}`}>{date}</div>
            <div className={`lockscreen-time ${unlocked ? 'hidden' : ''}`}>{clock}</div>
            <div
              className={`lockscreen-unlock-text ${unlocked ? 'hidden' : ''}`}
              data-text={t('unlock')}
            >
              {t('unlock')}
            </div>

            <div className={`lockscreen-dock ${unlocked ? 'visible' : ''}`}>
              <div className="liquidGlass-wrapper dock">
                <div className="liquidGlass-effect" />
                <div className="liquidGlass-tint" />
                <div className="liquidGlass-shine" />
                <div className="liquidGlass-text">
                  <div className="dock">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/dock/finder.svg" alt="Finder" loading="lazy" />
                    <div className="dock-item">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/dock/notes.svg" alt="Notes" loading="lazy" />
                      <div className="dock-dot" />
                    </div>
                    <div className="dock-item">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/dock/photos.svg" alt="Photos" loading="lazy" />
                      <div className="dock-dot" />
                    </div>
                    <div className="dock-item">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/dock/settings.svg" alt="Settings" loading="lazy" />
                    </div>
                    <div className="dock-item">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/macflow-icon.svg" alt="MacFlow" loading="lazy" />
                      <div className="dock-dot" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`lockscreen-folders-container ${unlocked ? 'visible' : ''}`}>
              <div className="lockscreen-folders-column">
                {posterFolders.slice(0, 3).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`lockscreen-folder ${activeFolder === item.id ? 'active' : ''}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      activateFolder(item);
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.poster ?? item.src}
                      className="poster"
                      alt={item.title}
                      loading="lazy"
                    />
                    <span className="lockscreen-folder-name lockscreen-folder-name-poster">
                      {item.title}
                    </span>
                  </button>
                ))}
              </div>

              <div className="lockscreen-folders-column">
                <button
                  type="button"
                  className="lockscreen-folder"
                  onClick={(event) => event.stopPropagation()}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/folders/folder-empty.svg" alt="" loading="lazy" />
                  <span className="lockscreen-folder-name">Office</span>
                </button>

                <button
                  type="button"
                  className="lockscreen-folder"
                  onClick={(event) => {
                    event.stopPropagation();
                    showPersonalPopup();
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/folders/folder-filled.svg" alt="" loading="lazy" />
                  <span className="lockscreen-folder-name">{t('personalFolder')}</span>
                  <span className={`folder-popup ${popupVisible ? 'visible' : ''}`}>
                    {t('personalPopup')}
                  </span>
                </button>

                {posterFolders.slice(3, 5).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`lockscreen-folder ${activeFolder === item.id ? 'active' : ''}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      activateFolder(item);
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.poster ?? item.src}
                      className="poster"
                      alt={item.title}
                      loading="lazy"
                    />
                    <span className="lockscreen-folder-name lockscreen-folder-name-poster">
                      {item.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={`notification-toast ${toastVisible ? 'visible' : 'hidden'}`}>
            <div className="notification-toast-wrapper">
              <div className="notification-toast-glass-effect" />
              <div className="notification-toast-glass-tint" />
              <div className="notification-toast-glass-shine" />
              <div className="notification-toast-content-wrapper">
                <div className="notification-toast-logo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/macflow-icon.svg" alt="MacFlow" loading="lazy" />
                </div>
                <div className="notification-toast-content">
                  <div className="notification-toast-title">{t('notificationTitle')}</div>
                  <div className="notification-toast-subtitle">{t('notificationBody')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`product-visual animate-slide-up ${unlocked ? 'unlocked' : ''}`}
          style={unlocked ? { animation: 'none', opacity: 1 } : undefined}
        >
          <div className="logo-container">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/macflow-icon.svg" alt="MacFlow logo" fetchPriority="high" />
          </div>
        </div>

        <h1
          className={`product-title animate-slide-up ${unlocked ? 'unlocked' : ''}`}
          style={unlocked ? { animation: 'none', opacity: 1 } : undefined}
        >
          {t('title')}
        </h1>
        <h2
          className={`product-tagline animate-slide-up ${unlocked ? 'unlocked' : ''}`}
          style={unlocked ? { animation: 'none', opacity: 1 } : undefined}
        >
          {t('tagline')}
        </h2>

        <p className="product-description animate-slide-up">
          {t('description')}
          <br />
          {t('descriptionSecond')}
        </p>

        <div className="cta-buttons animate-slide-up">
          <Link href="/download" className="cta-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d={APPLE_PATH} />
            </svg>
            {t('download')}
          </Link>
          {demoHref ? (
            <a
              href={demoHref}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-button dark"
            >
              {t('watchDemo')}
            </a>
          ) : (
            <Link href="/download" className="cta-button dark">
              {t('watchDemo')}
            </Link>
          )}
        </div>

        <div className="disclaimers animate-slide-up">
          <p>
            {t('noSubscriptions')}{' '}
            <span
              className={`disclaimer-brew-wrap ${brewOpen ? 'disclaimer-brew-wrap--tooltip-open' : ''}`}
              onMouseEnter={() => {
                if (brewTimer.current) clearTimeout(brewTimer.current);
                setBrewOpen(true);
              }}
              onMouseLeave={() => {
                brewTimer.current = setTimeout(() => setBrewOpen(false), 200);
              }}
              onFocus={() => setBrewOpen(true)}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                  setBrewOpen(false);
                }
              }}
            >
              <a
                href="https://brew.sh"
                target="_blank"
                rel="noopener noreferrer"
                className="disclaimer-brew-link"
              >
                {t('homebrew')}
              </a>
              <span className="disclaimer-brew-tooltip" role="tooltip">
                <code className="disclaimer-brew-cmd" aria-label={BREW_COMMAND}>
                  <span className="disclaimer-brew-prompt">$</span>
                  <span className="disclaimer-brew-bin">brew</span>
                  <span className="disclaimer-brew-kw">install</span>
                  <span className="disclaimer-brew-arg">macflow</span>
                </code>
                <span className="disclaimer-brew-divider" aria-hidden="true" />
                <button
                  type="button"
                  className="disclaimer-brew-copy"
                  aria-label={brewCopied ? t('copied') : t('copyCommand')}
                  data-copied={brewCopied ? 'true' : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    void copyBrew();
                  }}
                >
                  {brewCopied ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M5 13l4 4L19 7"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect
                        x="9"
                        y="9"
                        width="13"
                        height="13"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </button>
              </span>
            </span>
            .
            <br />
            {t('requires')}
          </p>
        </div>
      </div>

      <GlassFilter />
    </>
  );
}
