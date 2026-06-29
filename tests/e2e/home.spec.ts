import { expect, test } from '@playwright/test';

test('loads the home page', async ({ page }) => {
  await page.goto('/en');

  await expect(page.getByRole('heading', { name: 'Swagger Editor App' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Sign Up' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'About' }).first()).toBeVisible();
});

test('loads the Russian home page', async ({ page }) => {
  await page.goto('/ru');

  await expect(page.getByText(/вставляйте, редактируйте/i)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Войти' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Регистрация' })).toBeVisible();
});

test('switches language on the current route', async ({ page }) => {
  await page.goto('/en/about');

  await page.getByRole('link', { name: 'ru' }).click();

  await expect(page).toHaveURL(/\/ru\/about$/);
  await expect(page.getByRole('heading', { name: 'О Swagger Editor App' })).toBeVisible();
});
