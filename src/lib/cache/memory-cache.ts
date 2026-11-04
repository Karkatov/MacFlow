/**
 * In-memory кэш с TTL.
 *
 * Нужен как fallback для окружений, где Next.js Data Cache недоступен
 * (например, локальные скрипты или нестандартный runtime), а также как
 * быстрый L1-слой перед `unstable_cache`.
 *
 * Хранилище живёт в `globalThis`, чтобы переживать HMR в dev-режиме и
 * не создавать по экземпляру на каждый модуль.
 */

interface MemoryCacheEntry {
  value: unknown;
  expiresAt: number;
}

const globalForCache = globalThis as unknown as {
  __macflowMemoryCache?: Map<string, MemoryCacheEntry>;
};

/** Жёсткий предел числа ключей: защита от неограниченного роста памяти. */
const MAX_ENTRIES = 5_000;

function getStore(): Map<string, MemoryCacheEntry> {
  globalForCache.__macflowMemoryCache ??= new Map();
  return globalForCache.__macflowMemoryCache;
}

function sweep(store: Map<string, MemoryCacheEntry>, now: number): void {
  for (const [key, entry] of store) {
    if (entry.expiresAt <= now) store.delete(key);
  }
}

/**
 * Вернуть значение из кэша или загрузить его и закэшировать на `ttlSeconds`.
 *
 * Важно: функция не кэширует ошибки и не кэширует Promise — только
 * успешно вычисленное значение, поэтому «залипших» rejected-промисов нет.
 */
export async function withMemoryCache<T>(
  key: string,
  loader: () => T | Promise<T>,
  ttlSeconds: number,
): Promise<T> {
  const store = getStore();
  const now = Date.now();
  const entry = store.get(key);

  if (entry && entry.expiresAt > now) {
    return entry.value as T;
  }

  const value = await loader();

  if (store.size >= MAX_ENTRIES) {
    sweep(store, now);

    // Если после очистки всё ещё переполнено — удаляем самые старые ключи
    // (Map сохраняет порядок вставки).
    while (store.size >= MAX_ENTRIES) {
      const oldest = store.keys().next();
      if (oldest.done) break;
      store.delete(oldest.value);
    }
  }

  store.set(key, { value, expiresAt: now + Math.max(1, ttlSeconds) * 1_000 });
  return value;
}

/** Удалить ключи кэша по префиксу (или весь кэш без аргумента). */
export function invalidateMemoryCache(prefix?: string): void {
  const store = getStore();

  if (!prefix) {
    store.clear();
    return;
  }

  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}

/** Полностью очистить кэш (используется в тестах). */
export function clearMemoryCache(): void {
  getStore().clear();
}

/** Текущее количество ключей (для диагностики). */
export function memoryCacheSize(): number {
  return getStore().size;
}
