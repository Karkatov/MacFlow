#!/usr/bin/env node
/**
 * Удаляет артефакты предыдущей сборки.
 *
 * Next.js иногда переиспользует `.next`-кэш после изменения
 * `src/generated/media-manifest.json` и падает при статической генерации
 * (`a[d] is not a function`). Чистый `.next` перед сборкой это исключает.
 */

import fs from 'node:fs';

for (const dir of ['.next', 'out']) {
  fs.rmSync(dir, { recursive: true, force: true });
}
