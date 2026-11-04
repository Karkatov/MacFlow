import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 3210);
const baseURL = `http://127.0.0.1:${PORT}`;

/**
 * Дополнительные флаги Chromium для окружений с ограничениями (контейнеры,
 * sandbox-сессии). В обычном окружении переменная не задана и запуск штатный.
 */
const chromiumArgs = (process.env.E2E_CHROMIUM_ARGS ?? '').split(/\s+/).filter(Boolean);

/**
 * E2E-тесты (Playwright).
 *
 * Собирается продакшен-версия — так проверяется именно то, что уедет на хостинг.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  timeout: 30_000,
  use: {
    baseURL,
    trace: 'on-first-retry',
    locale: 'ru-RU',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: { args: chromiumArgs },
      },
    },
  ],
  webServer: {
    // Собираем в серверном режиме: по умолчанию сборка даёт статический экспорт.
    command: `NEXT_OUTPUT=server npm run build && NEXT_OUTPUT=server npm run start -- --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
