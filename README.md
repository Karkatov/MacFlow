# MacFlow — сайт

Промо-сайт приложения **MacFlow** (живые обои для macOS): каталог обоев, тарифы,
страница загрузки, поддержка, личный кабинет и демо-админка.

## Стек

| Слой        | Технологии                                                              |
| ----------- | ----------------------------------------------------------------------- |
| Framework   | Next.js 15 (App Router), React 19, TypeScript (strict)                  |
| Стили       | Tailwind CSS v4, CSS-переменные в `src/styles/globals.css`              |
| UI          | shadcn/ui (Radix UI) — компоненты собраны вручную в `src/components/ui` |
| Анимации    | Framer Motion (`src/components/shared/motion.tsx`)                      |
| Иконки      | Lucide React                                                            |
| Локализация | next-intl 3 (сегмент пути `/[locale]`)                                  |
| Состояние   | Zustand (+ `persist` для избранного и корзины)                          |
| Тема        | next-themes                                                             |
| Формы       | React Hook Form-ready, валидация Zod 4                                  |
| Тесты       | Vitest (юнит) + Playwright (E2E)                                        |
| Линтинг     | ESLint 9 (flat config), Prettier, Husky + lint-staged                   |

## Быстрый старт

```bash
npm install
cp .env.example .env.local   # опционально: ключи API и Sentry
npm run dev                  # http://localhost:3000 → редирект на /ru
```

## Команды

| Команда                            | Что делает                                        |
| ---------------------------------- | ------------------------------------------------- |
| `npm run dev`                      | Dev-сервер с HMR                                  |
| `npm run build`                    | Статический экспорт → `out/` (режим по умолчанию) |
| `NEXT_OUTPUT=server npm run build` | Серверная сборка → `.next`                        |
| `NEXT_OUTPUT=server npm run start` | Запуск собранного серверного приложения           |
| `npm run typecheck`                | `tsc --noEmit`                                    |
| `npm run lint` / `lint:fix`        | ESLint                                            |
| `npm run format` / `format:check`  | Prettier                                          |
| `npm test`                         | Юнит-тесты (Vitest)                               |
| `npm run test:e2e`                 | E2E-тесты (Playwright, собирает приложение сама)  |
| `npm run assets`                   | Перегенерация плейсхолдеров и иконок в `public/`  |

## Режимы сборки

**По умолчанию — статический экспорт.** Если `NEXT_OUTPUT` не задан или равен
`export`, `next.config.ts` включает `output: 'export'`: каталог `out/` обязателен
для Cloudflare Pages, GitHub Pages и любого статического хостинга. Серверные
режимы включаются явно:

| `NEXT_OUTPUT`           | Результат                              | Куда деплоить                                             |
| ----------------------- | -------------------------------------- | --------------------------------------------------------- |
| `export` (по умолчанию) | Полностью статический экспорт в `out/` | Cloudflare Pages, GitHub Pages, любой статический хостинг |
| `server`                | Обычный Next.js-сервер, ISR            | Vercel, Netlify, VPS                                      |
| `standalone`            | `output: 'standalone'`                 | Docker / VPS (запуск `node .next/standalone/server.js`)   |

```bash
npm run build                                   # статический экспорт → out/
NEXT_OUTPUT=server npm run build                # серверный режим → .next
NEXT_OUTPUT=standalone npm run build            # Docker → .next/standalone
NEXT_OUTPUT=export NEXT_BASE_PATH=/MacFlowSite NEXT_ASSET_PREFIX=/MacFlowSite npm run build
```

В режиме `export`:

- `images.unoptimized` включён автоматически (нет image-сервера);
- серверные редиректы недоступны — корень `/` закрывает `public/index.html`
  (мета-редирект + JS на `/ru`); `scripts/postbuild.mjs` перезаписывает его
  с учётом `NEXT_BASE_PATH`;
- `next.config.ts` → `headers()` не применяются — для статических хостингов
  используйте `public/_headers` (Netlify / Cloudflare Pages);
- `next-intl` и `searchParams` работают: на странице каталога `searchParams`
  читается только в серверном режиме, в экспорте — уже в браузере.

## API и кэширование

Route Handlers лежат в `src/app/api/**/route.server.ts`. Расширение `.server.ts`
включено в `pageExtensions` только для серверных сборок, поэтому в статический
экспорт каталог `/api/**` не попадает (в браузере данные берутся из моков).

| Endpoint                            | Кэш                                           |
| ----------------------------------- | --------------------------------------------- |
| `GET /api/wallpapers`               | `s-maxage=60, stale-while-revalidate=300`     |
| `GET /api/wallpapers/featured`      | `s-maxage=60, stale-while-revalidate=300`     |
| `GET /api/wallpapers/:slug`         | `s-maxage=60, stale-while-revalidate=300`     |
| `GET /api/wallpapers/:slug/similar` | `s-maxage=60, stale-while-revalidate=300`     |
| `GET /api/categories`               | `s-maxage=3600, stale-while-revalidate=86400` |
| `GET /api/auth/me`                  | `private, no-store`                           |
| `POST /api/auth/sign-in`            | `private, no-store`                           |
| `POST /api/payments/create`         | `private, no-store`                           |

- Каталог и категории кэшируются через `unstable_cache` с тегами
  `wallpapers`, `wallpapers:list`, `wallpapers:featured`, `categories`
  и in-memory L1-слоем (`src/lib/cache`).
- Rate Limiting — in-memory, 60 запросов/мин на IP и endpoint; для входа и
  создания платежа — 10/мин. При превышении возвращается `429` с `Retry-After`.
  Для нескольких инстансов нужен общий счётчик (Redis) или `limit_req` в nginx.
- Медиа отдаётся с CDN/S3, если задан `NEXT_PUBLIC_CDN_BASE_URL` или
  `NEXT_PUBLIC_S3_BASE_URL`; иначе используются локальные плейсхолдеры.
- Создание платежей сериализовано очередью (`src/lib/queue`), при переполнении
  возвращается `503` с `Retry-After: 5`.

## Структура

```
src/
  app/
    [locale]/          — все страницы (локаль в сегменте пути)
    global-not-found.tsx — 404 для маршрутов вне локалей (рендерится без layout)
    robots.ts, sitemap.ts
  components/
    ui/                — shadcn/ui-примитивы
    layout/, home/, wallpaper/, faq/, support/, account/, admin/, legal/, shared/, onboarding/
  config/site.ts       — единый конфиг: цены, навигация, API, S3/CDN, легал
  data/mock/           — демо-данные (обои, категории, пользователи, покупки)
  data/legal/          — тексты legal-документов (RU/EN)
  i18n/                — routing, request, navigation
  lib/
    api/               — клиент API (мок-режим, реальный режим — за флагом)
    catalog/filters.ts — чистая логика фильтров/сортировки/пагинации
    seo/               — metadata и JSON-LD
    store/, hooks/, utils/
  messages/            — ru.json, en.json
  styles/              — theme.ts, fonts.ts, animations.ts, wallspace.css
  types/               — доменные типы
wallpapers/            — исходники медиа (images, videos, posters, showcase)
scripts/               — sync-media, генерация демо-медиа/плейсхолдеров, postbuild
tests/                 — unit/ и e2e/
```

## Медиа

Файлы кладутся в `wallpapers/{images,videos,posters,showcase}/`.
`npm run media` (автоматически в `predev` и `prebuild`) копирует их в
`public/media/` и обновляет `src/generated/media-manifest.json`.
`public/media/` не коммитится — генерируется при каждой сборке.

## Локализация

- Локали: `ru` (по умолчанию) и `en`, префикс в URL всегда: `/ru/...`, `/en/...`.
- Middleware нет намеренно — локаль лежит в сегменте пути, поэтому всё работает
  и на сервере, и в статическом экспорте.
- Все пользовательские строки — в `src/messages/*.json`; UI не должен содержать «сырых» строк.
- Ссылки внутри приложения — только через `Link` из `@/i18n/navigation`,
  иначе потеряется префикс локали.

## Демо-режим

Сейчас сайт работает на моках (`src/data/mock`). Переключение на реальный API —
в `src/lib/api/*` (флаги `siteConfig.API.mode`). Ключевые заглушки:
корзина, оплата, личный кабинет, админка (вход по паролю `ADMIN_PASSWORD`,
в статическом экспорте — через SHA-256-хеш на клиенте).

## Цены

Заданы в `src/config/site.ts` → `pricing` (в рублях):
пробный период 24 ч, пожизненный доступ 890 ₽, год 490 ₽,
скидка на Premium во время пробного периода 690 ₽ (−22%).

## Деплой

**Cloudflare Pages** (основная цель):

- Build command: `npm run build`, Output directory: `out`, Node.js: 20+.
  (По умолчанию Cloudflare подставляет `npx next build` — он тоже даёт `out/`,
  но без `postbuild`; рекомендуется именно `npm run build`.)
- Переменные окружения оставьте пустыми — статический экспорт включён в коде.
- Заголовки безопасности — из `public/_headers`, корень `/` редиректит
  `public/index.html` на `/ru`.
- Свой домен: Cloudflare → DNS → Custom domain.

- **Vercel**: Framework Preset = Next.js, env `NEXT_OUTPUT=server`. Build → `npm run build`.
- **Netlify**: `netlify.toml` уже в репозитории (build `npm run build`, publish `.next`,
  заголовки и редиректы). Env: `NEXT_OUTPUT=server`.
- **Docker / VPS**: `NEXT_OUTPUT=standalone npm run build`, затем
  `node .next/standalone/server.js` (не забудьте скопировать `.next/static` и `public`).
- **GitHub Pages**: `NEXT_OUTPUT=export NEXT_BASE_PATH=/<repo> NEXT_ASSET_PREFIX=/<repo> npm run build`,
  публиковать содержимое `out/`.

Проверка перед деплоем:

```bash
npm run lint && npm run typecheck && npm test && npm run build
npm run test:e2e          # Playwright: собирает и поднимает приложение сама
```

## Лицензия и контент

Сторонний контент в сайт не переносится: демо-изображения — собственные
SVG-плейсхолдеры, сгенерированные скриптом `npm run assets`.
