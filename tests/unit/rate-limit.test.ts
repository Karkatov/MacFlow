import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  checkRateLimit,
  consumeRateLimit,
  getClientIp,
  guardRateLimit,
  resetRateLimitStore,
} from '@/lib/rate-limit';

describe('rate limiting', () => {
  beforeEach(() => {
    resetRateLimitStore();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    resetRateLimitStore();
  });

  it('пропускает запросы до лимита и блокирует превышение', () => {
    expect(checkRateLimit('1.1.1.1', 'catalog', 2, 60_000)).toBe(true);
    expect(checkRateLimit('1.1.1.1', 'catalog', 2, 60_000)).toBe(true);
    expect(checkRateLimit('1.1.1.1', 'catalog', 2, 60_000)).toBe(false);
  });

  it('считает лимиты по IP и эндпоинту независимо', () => {
    expect(checkRateLimit('1.1.1.1', 'catalog', 1, 60_000)).toBe(true);
    expect(checkRateLimit('2.2.2.2', 'catalog', 1, 60_000)).toBe(true);
    expect(checkRateLimit('1.1.1.1', 'payments', 1, 60_000)).toBe(true);
    expect(checkRateLimit('1.1.1.1', 'catalog', 1, 60_000)).toBe(false);
  });

  it('сбрасывает счётчик после окна и отдаёт Retry-After', () => {
    const options = { limit: 1, windowMs: 1_000 };

    expect(consumeRateLimit('3.3.3.3', 'catalog', options).allowed).toBe(true);

    const blocked = consumeRateLimit('3.3.3.3', 'catalog', options);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfter).toBe(1);

    vi.advanceTimersByTime(1_001);

    expect(consumeRateLimit('3.3.3.3', 'catalog', options).allowed).toBe(true);
  });

  it('возвращает 429 с Retry-After через guardRateLimit', () => {
    const request = new Request('https://macflow.app/api/wallpapers', {
      headers: { 'x-forwarded-for': '4.4.4.4, 10.0.0.1' },
    });

    const first = guardRateLimit(request, 'catalog', { limit: 1 });
    expect(first.response).toBeNull();

    const second = guardRateLimit(request, 'catalog', { limit: 1 });
    expect(second.response?.status).toBe(429);
    expect(second.response?.headers.get('Retry-After')).toBe('60');
  });

  it('извлекает IP из заголовков прокси и CDN', () => {
    expect(
      getClientIp(
        new Request('https://macflow.app', {
          headers: { 'cf-connecting-ip': '5.5.5.5' },
        }),
      ),
    ).toBe('5.5.5.5');

    expect(
      getClientIp(
        new Request('https://macflow.app', {
          headers: { 'x-forwarded-for': '6.6.6.6, 10.0.0.1' },
        }),
      ),
    ).toBe('6.6.6.6');

    expect(
      getClientIp(
        new Request('https://macflow.app', {
          headers: { 'x-real-ip': '7.7.7.7' },
        }),
      ),
    ).toBe('7.7.7.7');
  });
});
