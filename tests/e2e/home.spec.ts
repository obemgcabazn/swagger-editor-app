import { expect, test } from '@playwright/test';

test('loads the home page', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /to get started/i })).toBeVisible();
});

test('displays the welcome message', async ({ page }) => {
  await page.goto('/');

  // This checks for some text that is present on the default Next.js or starter home page.
  // Adjust this selector as needed for your own home page content.
  await expect(page.getByText(/welcome/i)).toBeVisible();
});
