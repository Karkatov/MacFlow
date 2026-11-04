/**
 * Единый конфиг проекта.
 *
 * Здесь собраны все «переключатели» реальной инфраструктуры. Чтобы подключить
 * боевой бэкенд — достаточно поменять значения ниже (или соответствующие
 * переменные окружения), код трогать не нужно.
 *
 * ВАЖНО: секреты (ключи платёжных систем, пароль админки) здесь НЕ хранятся.
 * Читаются они на сервере из process.env — см. .env.example.
 */

/** Режим работы сайта: моки или реальный API. */
export const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'false';

/** Платёжный провайдер. 'none' — кнопки покупки показывают тост-заглушку. */
export type PaymentProvider = 'none' | 'lava' | 'robokassa';

const paymentProvider = (process.env.NEXT_PUBLIC_PAYMENT_PROVIDER ?? 'none') as PaymentProvider;

export const siteConfig = {
  name: 'MacFlow',
  tagline: 'Живые обои для macOS',
  domain: 'macflow.app',
  locale: 'ru-RU',
  defaultLocale: 'ru',
  supportedLocales: ['ru', 'en'] as const,

  // ─── Данные и инфраструктура ───────────────────────────────
  USE_MOCK_DATA,
  /** TODO: подключить API (бэкенд MacFlow). Пусто = работаем на моках. */
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL ?? '',
  /** TODO: подключить S3 (Timeweb). Путь: {S3_BASE_URL}/wallpapers/{id}.mp4 */
  S3_BASE_URL: process.env.NEXT_PUBLIC_S3_BASE_URL ?? '',
  /** TODO: подключить CDN перед S3. */
  CDN_BASE_URL: process.env.NEXT_PUBLIC_CDN_BASE_URL ?? '',
  PAYMENT_PROVIDER: paymentProvider,
  AUTH_ENABLED: false,
  ADMIN_ENABLED: true,

  // ─── Аналитика (код выключен, см. components/analytics) ───
  ANALYTICS: {
    YM_ID: process.env.NEXT_PUBLIC_YM_ID ?? '',
    GA_ID: process.env.NEXT_PUBLIC_GA_ID ?? '',
  },

  // ─── Соцсети (заглушки) ────────────────────────────────────
  SOCIAL: {
    telegram: '#',
    vk: '#',
    github: '#',
  },

  // ─── Контакты ──────────────────────────────────────────────
  CONTACTS: {
    email: 'hello@macflow.app',
    telegram: '@macflow',
  },

  // ─── Реквизиты (ПЛЕЙСХОЛДЕРЫ — заполнить перед публикацией) ─
  LEGAL: {
    inn: '000000000000',
    ogrnip: '000000000000000',
    address: 'г. Москва, ул. Примерная, д. 1',
    email: 'hello@macflow.app',
  },

  // ─── Приложение ────────────────────────────────────────────
  APP: {
    name: 'MacFlow',
    bundleId: 'com.macflow.app',
    version: '1.0.0',
    minMacOS: '15.0',
    /** Live Lock Screen и заставка требуют macOS 26 (Tahoe) */
    minMacOSAdvanced: '26.0',
    downloadUrl: '/download/MacFlow.dmg',
    downloadUrlUniversal: '/download/MacFlow-universal.dmg',
  },
} as const;

/** Полный URL сайта с учётом домена из конфига. */
export function absoluteUrl(path: string, domain: string = siteConfig.domain): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `https://${domain}${clean}`;
}

/** URL файла обоев. Логика пути заложена заранее, чтобы позже просто заполнить S3/CDN. */
export function mediaUrl(
  kind: 'wallpapers' | 'posters' | 'previews',
  id: string,
  extension: string,
): string {
  const base = siteConfig.CDN_BASE_URL || siteConfig.S3_BASE_URL;
  if (!base) return '';
  return `${base.replace(/\/$/, '')}/${kind}/${id}.${extension}`;
}

/**
 * URL любого медиа-ассета: CDN, если он настроен, иначе локальный путь.
 *
 * Абсолютные URL и data-URI возвращаются без изменений. Используется для
 * постеров, аватарок и скриншотов, чтобы VPS не раздавал медиафайлы сам.
 */
export function cdnUrl(path: string): string {
  if (!path) return path;
  if (/^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(path) || path.startsWith('data:')) return path;

  const base = siteConfig.CDN_BASE_URL || siteConfig.S3_BASE_URL;
  if (!base) return path.startsWith('/') ? path : `/${path}`;

  return `${base.replace(/\/$/, '')}/${path.replace(/^\/+/, '')}`;
}

/** Навигация в шапке сайта. */
export const navLinks = [
  { href: '/', labelKey: 'home' },
  { href: '/pricing', labelKey: 'pricing' },
  { href: '/about', labelKey: 'about' },
  { href: '/faq', labelKey: 'faq' },
  { href: '/support', labelKey: 'support' },
] as const;

/** Цены. Все значения — в копейках-рублях, форматирование — Intl.NumberFormat('ru-RU'). */
export const pricing = {
  trialDays: 1,
  trialHours: 24,
  lifetime: 890,
  yearly: 490,
  /** Скидочная цена Premium внутри пробного периода. */
  trialDiscount: 690,
  /** Максимальный размер скидки в процентах (690 ₽ вместо 890 ₽ = −22%). */
  trialDiscountPercent: 22,
} as const;

/** Количество активов на одной странице каталога. */
export const PAGE_SIZE = 12;

/** Ключ в localStorage: онбординг уже показан. */
export const ONBOARDING_STORAGE_KEY = 'macflow:onboarding-seen';
