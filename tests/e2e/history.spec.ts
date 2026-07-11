import { expect, test } from '@playwright/test';

test('redirects unauthenticated users from /history to /sign-in', async ({ page }) => {
  await page.goto('/en/history');

  await expect(page).toHaveURL(/\/en\/sign-in$/);
  await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
});
