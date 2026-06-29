import { expect, test } from '@playwright/test';

test('loads the home page', async ({ page }) => {
  await page.goto('/en');

  await expect(page.getByRole('heading', { name: 'Swagger Editor App' })).toBeVisible();
});

test('loads the Russian home page', async ({ page }) => {
  await page.goto('/ru');

  await expect(page.getByText(/вставляйте, редактируйте/i)).toBeVisible();
});
