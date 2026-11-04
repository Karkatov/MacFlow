/**
 * Дизайн-токены MacFlow.
 *
 * Дублируют значения из `globals.css` (@theme) — нужны там, где CSS-переменные
 * недоступны: Framer Motion, генераторы SVG, генерация OG-изображений.
 *
 * Тёмная тема — основная. Светлая — аккуратная вторичная.
 */
export const palette = {
  /* ── Базовые поверхности ── */
  background: '#0A0A0C',
  backgroundElevated: '#101014',
  surface: 'rgba(255,255,255,0.04)',
  surfaceStrong: 'rgba(255,255,255,0.08)',
  surfaceGlass: 'rgba(255,255,255,0.06)',

  /* ── Границы и разделители ── */
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.16)',

  /* ── Текст ── */
  foreground: '#F5F5F7',
  foregroundSecondary: 'rgba(245,245,247,0.68)',
  foregroundMuted: 'rgba(245,245,247,0.42)',

  /* ── Бренд (фиолетово-циановый градиент) ── */
  brandFrom: '#7C5CFF',
  brandVia: '#6366F1',
  brandTo: '#22D3EE',
  brandGlow: 'rgba(124,92,255,0.35)',
  brandGlowStrong: 'rgba(124,92,255,0.55)',
  cyanGlow: 'rgba(34,211,238,0.28)',

  /* ── Состояния ── */
  success: '#34D399',
  warning: '#22D3EE',
  destructive: '#F87171',
} as const;

/** Градиент бренда — CSS-строка для inline-стилей и SVG. */
export const brandGradient = `linear-gradient(135deg, ${palette.brandFrom} 0%, ${palette.brandVia} 50%, ${palette.brandTo} 100%)`;

/** Фирменная кривая. */
export const easeOutQuint = [0.23, 1, 0.32, 1] as const;

/** Скругления (px). */
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
} as const;

/** Тени и свечения. */
export const shadows = {
  card: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 12px 40px -12px rgba(0,0,0,0.6)',
  cardHover: '0 1px 0 0 rgba(255,255,255,0.08) inset, 0 24px 60px -20px rgba(0,0,0,0.8)',
  glow: `0 0 0 1px rgba(124,92,255,0.18), 0 18px 60px -18px ${palette.brandGlow}`,
  glowStrong: `0 0 0 1px rgba(124,92,255,0.35), 0 26px 80px -20px ${palette.brandGlowStrong}`,
} as const;

/** Breakpoint’ы (px) — синхронизированы с Tailwind. */
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/** Размеры контейнера. */
export const layout = {
  container: '1200px',
  containerWide: '1440px',
  headerHeight: 72,
} as const;

/** Типографика. */
export const typography = {
  display: {
    fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
    lineHeight: 1.05,
    letterSpacing: '-0.03em',
    fontWeight: 800,
  },
  title: {
    fontSize: 'clamp(1.875rem, 3.6vw, 3rem)',
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
    fontWeight: 750,
  },
  sectionTitle: {
    fontSize: 'clamp(1.5rem, 2.6vw, 2.25rem)',
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
    fontWeight: 700,
  },
  body: {
    fontSize: '1rem',
    lineHeight: 1.65,
  },
} as const;

/** Фиксированный набор градиентных подложек для плейсхолдеров. */
export const placeholderGradients: ReadonlyArray<readonly [string, string, string]> = [
  ['#7C5CFF', '#22D3EE', '#0EA5E9'],
  ['#6366F1', '#8B5CF6', '#EC4899'],
  ['#22D3EE', '#0F766E', '#7C5CFF'],
  ['#F472B6', '#8B5CF6', '#312E81'],
  ['#38BDF8', '#1E3A8A', '#7C5CFF'],
  ['#FB7185', '#7C5CFF', '#0A0A0C'],
  ['#2DD4BF', '#3B82F6', '#1E1B4B'],
  ['#A78BFA', '#F0ABFC', '#4C1D95'],
  ['#0EA5E9', '#22D3EE', '#164E63'],
  ['#F59E0B', '#EF4444', '#7C2D12'],
  ['#34D399', '#22D3EE', '#064E3B'],
  ['#818CF8', '#22D3EE', '#1E1B4B'],
];

/**
 * Детерминированный выбор градиента по строке-ключу.
 * Один и тот же id всегда даёт один и тот же градиент — без Math.random(),
 * чтобы не было расхождений между сервером и клиентом (гидрация).
 */
export function gradientForKey(key: string): readonly [string, string, string] {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % placeholderGradients.length;
  return placeholderGradients[index] as readonly [string, string, string];
}
