import { siteConfig } from '@/config/site';

/**
 * Единый фетчер для всех обращений к бэкенду.
 *
 * Логика:
 *  - при `siteConfig.USE_MOCK_DATA === true` данные берутся из локальных моков;
 *  - иначе выполняется реальный `fetch` на `siteConfig.API_BASE_URL`.
 *
 * Чтобы подключить боевой API, достаточно:
 *  1) задать `NEXT_PUBLIC_USE_MOCK_DATA=false`;
 *  2) прописать `NEXT_PUBLIC_API_BASE_URL=https://api.macflow.app`;
 *  3) реализовать эндпоинты из TODO.md.
 * Код страниц при этом не меняется.
 */

export class ApiError extends Error {
  readonly status: number;
  readonly path: string;

  constructor(message: string, status: number, path: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.path = path;
  }
}

export interface ApiFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  /** Таймаут запроса в миллисекундах. */
  timeoutMs?: number;
  /** ISR: время кэширования в секундах. */
  revalidate?: number;
  /** Теги Next.js Data Cache для точечной инвалидации. */
  tags?: string[];
  signal?: AbortSignal;
}

const DEFAULT_TIMEOUT = 12_000;

/** Сборка URL: базовый адрес + путь + query. */
export function buildUrl(
  path: string,
  query?: Record<string, string | number | boolean | undefined>,
): string {
  const base = siteConfig.API_BASE_URL.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  let url = `${base}${normalizedPath}`;

  if (query) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '') params.set(key, String(value));
    }
    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;
  }

  return url;
}

/**
 * Реальный HTTP-запрос к API.
 *
 * Rate limiting входящих запросов живёт в Route Handlers и middleware-слое:
 * см. `src/lib/rate-limit.ts`. Здесь — только исходящие запросы к API.
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const {
    method = 'GET',
    body,
    headers = {},
    timeoutMs = DEFAULT_TIMEOUT,
    revalidate,
    tags,
    signal,
  } = options;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  if (signal) signal.addEventListener('abort', () => controller.abort(), { once: true });

  try {
    const response = await fetch(buildUrl(path), {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
      ...(revalidate !== undefined ? { next: { revalidate, ...(tags ? { tags } : {}) } } : {}),
    });

    if (!response.ok) {
      throw new ApiError(`API error ${response.status} на ${path}`, response.status, path);
    }

    if (response.status === 204) return undefined as T;

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка сети';
    throw new ApiError(message, 0, path);
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Универсальная точка входа: мок или сеть.
 *
 * @param path     путь на бэкенде
 * @param mock     функция, возвращающая мок-данные
 * @param options  параметры реального запроса
 */
export async function fetchData<T>(
  path: string,
  mock: () => T | Promise<T>,
  options: ApiFetchOptions = {},
): Promise<T> {
  if (siteConfig.USE_MOCK_DATA) {
    return mock();
  }
  return apiFetch<T>(path, options);
}

/** Задержка-имитация загрузки — чтобы скелетоны успевали отработать в демо. */
export function delay(ms = 120): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
