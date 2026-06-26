import { expect, test } from '@playwright/test';

test('loads the home page', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /to get started/i })).toBeVisible();
});

test('displays the welcome message', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText(/looking for a starting point/i)).toBeVisible();
});
