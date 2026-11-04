import { expect, test } from '@playwright/test';

/**
 * Дымовые E2E-тесты ключевых страниц.
 */

/**
 * Пропускаем онбординг-модалку: она перекрывает страницу и помечает
 * остальной контент как aria-hidden, из-за чего не работают выборки по ролям.
 */
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('macflow:onboarding-seen', '1');
  });
});

test.describe('MacFlow', () => {
  test('главная открывается и содержит ключевые блоки', async ({ page }) => {
    await page.goto('/ru');

    await expect(page).toHaveTitle(/MacFlow/);
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.getByRole('link', { name: /цены/i }).first()).toBeVisible();
    await expect(page.locator('#gallery')).toBeVisible();
  });

  test('страница скачивания доступна', async ({ page }) => {
    await page.goto('/ru/download');

    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('английская версия отдаётся по /en', async ({ page }) => {
    await page.goto('/en');

    await expect(page).toHaveTitle(/MacFlow/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('корень редиректит на русскую локаль', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/ru$/);
  });

  test('несуществующий путь отдаёт 404', async ({ page }) => {
    const response = await page.goto('/ru/does-not-exist');

    expect(response?.status()).toBe(404);
  });
});
