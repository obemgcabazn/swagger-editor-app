import { expect, test } from '@playwright/test';

test('redirects unauthenticated users from /history to main page', async ({ page }) => {
  await page.goto('/en/history');

  await expect(page).toHaveURL(/\/en\/?$/);
});
