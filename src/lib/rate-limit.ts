/**
 * Простой in-memory Rate Limiting для Route Handlers.
 *
 * Подходит для одного инстанса Next.js на VPS. При горизонтальном
 * масштабировании (несколько процессов/контейнеров) лимиты будут
 * считаться отдельно в каждом процессе — тогда стоит вынести счётчики
 * в Redis/Upstash или включить `limit_req` на nginx.
 *
 * Ключ: `rate_limit:${ip}:${endpoint}`.
 */

export interface RateLimitRecord {
  count: number;
  /** Unix-время (мс), когда окно сбрасывается. */
  resetAt: number;
}

export interface RateLimitOptions {
  /** Максимум запросов за окно. По умолчанию 60. */
  limit?: number;
  /** Длина окна в миллисекундах. По умолчанию 60 000. */
  windowMs?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  /** Unix-время (мс), когда окно сбрасывается. */
  resetAt: number;
  /** Сколько секунд ждать до повтора. 0 — если запрос разрешён. */
  retryAfter: number;
}

export interface RateLimitGuard {
  result: RateLimitResult;
  /** Готовый ответ 429 или null, если запрос разрешён. */
  response: Response | null;
  /** Заголовки для успешного ответа (RateLimit-*). */
  headers: Headers;
}

const DEFAULT_LIMIT = 60;
const DEFAULT_WINDOW_MS = 60_000;

/** Жёсткий предел числа ключей: защита от роста памяти при большом числе IP. */
const MAX_ENTRIES = 10_000;

const globalForRateLimit = globalThis as unknown as {
  __macflowRateLimitStore?: Map<string, RateLimitRecord>;
};

let operationsSinceSweep = 0;

function getStore(): Map<string, RateLimitRecord> {
  globalForRateLimit.__macflowRateLimitStore ??= new Map();
  return globalForRateLimit.__macflowRateLimitStore;
}

function sweep(store: Map<string, RateLimitRecord>, now: number): void {
  for (const [key, record] of store) {
    if (record.resetAt <= now) store.delete(key);
  }

  // Если после очистки ключей всё ещё слишком много — удаляем самые старые.
  while (store.size >= MAX_ENTRIES) {
    const oldest = store.keys().next();
    if (oldest.done) break;
    store.delete(oldest.value);
  }
}

function sweepPeriodically(store: Map<string, RateLimitRecord>, now: number): void {
  operationsSinceSweep += 1;

  const shouldSweep = store.size >= MAX_ENTRIES || (operationsSinceSweep >= 256 && store.size > 0);

  if (!shouldSweep) return;

  operationsSinceSweep = 0;
  sweep(store, now);
}

function storeKey(ip: string, endpoint: string): string {
  return `rate_limit:${ip}:${endpoint}`;
}

/**
 * Проверить и одновременно учесть один запрос.
 *
 * Возвращает подробный результат: сколько осталось, когда сбросится окно
 * и сколько секунд ждать при превышении.
 */
export function consumeRateLimit(
  ip: string,
  endpoint: string,
  options: RateLimitOptions = {},
): RateLimitResult {
  const limit = Math.max(1, Math.floor(options.limit ?? DEFAULT_LIMIT));
  const windowMs = Math.max(1_000, Math.floor(options.windowMs ?? DEFAULT_WINDOW_MS));
  const now = Date.now();
  const store = getStore();

  sweepPeriodically(store, now);

  const key = storeKey(ip, endpoint);
  const record = store.get(key);

  if (!record || record.resetAt <= now) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });

    return {
      allowed: true,
      limit,
      remaining: limit - 1,
      resetAt,
      retryAfter: 0,
    };
  }

  if (record.count >= limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetAt: record.resetAt,
      retryAfter: Math.max(1, Math.ceil((record.resetAt - now) / 1_000)),
    };
  }

  record.count += 1;

  return {
    allowed: true,
    limit,
    remaining: Math.max(0, limit - record.count),
    resetAt: record.resetAt,
    retryAfter: 0,
  };
}

/**
 * Совместимый с задачей boolean-хелпер.
 *
 * `true` — запрос разрешён, `false` — лимит превышен.
 */
export function checkRateLimit(
  ip: string,
  endpoint: string,
  limit = DEFAULT_LIMIT,
  windowMs = DEFAULT_WINDOW_MS,
): boolean {
  return consumeRateLimit(ip, endpoint, { limit, windowMs }).allowed;
}

/** IP клиента с учётом reverse proxy / CDN (Cloudflare, nginx). */
export function getClientIp(request: Request): string {
  const headers = request.headers;

  const cfConnectingIp = headers.get('cf-connecting-ip')?.trim();
  if (cfConnectingIp) return cfConnectingIp;

  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim();
    if (first) return first;
  }

  const realIp = headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;

  return 'unknown';
}

/** Заголовки состояния лимита для успешных ответов. */
export function rateLimitHeaders(result: RateLimitResult): Headers {
  const headers = new Headers();
  const resetInSeconds = Math.max(0, Math.ceil((result.resetAt - Date.now()) / 1_000));

  headers.set('RateLimit-Limit', String(result.limit));
  headers.set('RateLimit-Remaining', String(result.remaining));
  headers.set('RateLimit-Reset', String(resetInSeconds));

  // Дублируем в X-RateLimit-* для клиентов, которые ещё читают старый формат.
  headers.set('X-RateLimit-Limit', String(result.limit));
  headers.set('X-RateLimit-Remaining', String(result.remaining));
  headers.set('X-RateLimit-Reset', String(resetInSeconds));

  return headers;
}

/** Ответ 429 с `Retry-After` и стандартными RateLimit-заголовками. */
export function rateLimitResponse(result: RateLimitResult): Response {
  const headers = rateLimitHeaders(result);
  headers.set('Retry-After', String(Math.max(1, result.retryAfter)));
  headers.set('Cache-Control', 'no-store');
  headers.set('Content-Type', 'application/json; charset=utf-8');

  return new Response(
    JSON.stringify({
      error: 'rate_limited',
      message: 'Too Many Requests',
      retryAfter: Math.max(1, result.retryAfter),
    }),
    { status: 429, headers },
  );
}

/**
 * Удобная обёртка для Route Handlers.
 *
 * ```ts
 * const guard = guardRateLimit(request, 'wallpapers');
 * if (guard.response) return guard.response;
 * return json(data, { headers: guard.headers });
 * ```
 */
export function guardRateLimit(
  request: Request,
  endpoint: string,
  options: RateLimitOptions = {},
): RateLimitGuard {
  const result = consumeRateLimit(getClientIp(request), endpoint, options);

  return {
    result,
    response: result.allowed ? null : rateLimitResponse(result),
    headers: rateLimitHeaders(result),
  };
}

/** Очистить счётчики (используется в тестах). */
export function resetRateLimitStore(): void {
  getStore().clear();
  operationsSinceSweep = 0;
}
