import { expect, test } from '@playwright/test';

import { executeSampleRequest, hasDevCredentials, signInWithDevUser } from './history-helpers';

test.describe('History access control', () => {
  test('redirects unauthenticated users from /history to main page', async ({ page }) => {
    await page.goto('/en/history');

    await expect(page).toHaveURL(/\/en\/?$/);
  });

  test('redirects unauthenticated users from /history detail to main page', async ({ page }) => {
    await page.goto('/en/history/00000000-0000-4000-8000-000000000001');

    await expect(page).toHaveURL(/\/en\/?$/);
  });
});

test.describe('History and analytics', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }, testInfo) => {
    if (!hasDevCredentials()) {
      testInfo.skip(
        true,
        'Set SUPABASE_DEV_USER_EMAIL and SUPABASE_DEV_USER_PASSWORD in .env to run authenticated history E2E tests.'
      );
    }

    await signInWithDevUser(page);
  });

  test('shows empty state or request list for authenticated users', async ({ page }) => {
    await page.goto('/en/history');

    await expect(page.getByRole('heading', { name: 'Request history' })).toBeVisible();
    await expect(page.getByText('Review past API requests and performance metrics.')).toBeVisible();

    const emptyMessage = page.getByText("You haven't executed any requests yet.");
    const listSummary = page.getByText(/\d+ requests? recorded/);

    await expect(emptyMessage.or(listSummary)).toBeVisible();
  });

  test('shows empty state links to editor and viewer when history is empty', async ({ page }) => {
    await page.goto('/en/history');

    const emptyMessage = page.getByText("You haven't executed any requests yet.");

    if (!(await emptyMessage.isVisible())) {
      test.skip(true, 'Dev user already has request history; empty state not applicable.');
    }

    await expect(page.getByRole('link', { name: 'Go to Editor' })).toHaveAttribute(
      'href',
      /#editor$/
    );
    await expect(page.getByRole('link', { name: 'Go to Viewer' })).toHaveAttribute(
      'href',
      /#viewer$/
    );
  });

  test('displays recorded requests sorted with links to detail pages', async ({ page }) => {
    const endpointUrl = await executeSampleRequest(page);

    await page.goto('/en/history');

    const detailLink = page.getByRole('link', { name: /View details/i }).first();
    await expect(detailLink).toBeVisible();
    await expect(page.getByText(endpointUrl).first()).toBeVisible();

    await detailLink.click();
    await expect(page).toHaveURL(/\/en\/history\/[0-9a-f-]+$/);
  });

  test('renders request analytics on the detail page', async ({ page }) => {
    const endpointUrl = await executeSampleRequest(page);

    await page.goto('/en/history');
    await page
      .getByRole('link', { name: /View details/i })
      .first()
      .click();

    await expect(page.getByRole('heading', { name: 'Request analytics' })).toBeVisible();
    await expect(page.getByText(endpointUrl).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Back to history/i })).toBeVisible();

    await expect(page.getByText('Method')).toBeVisible();
    await expect(page.getByText('GET', { exact: true })).toBeVisible();
    await expect(page.getByText('Endpoint / URL')).toBeVisible();
    await expect(page.getByText('Response status code')).toBeVisible();
    await expect(page.getByText('200', { exact: true })).toBeVisible();
    await expect(page.getByText('Request timestamp')).toBeVisible();
    await expect(page.getByText('Request duration')).toBeVisible();
    await expect(page.getByText('Request size')).toBeVisible();
    await expect(page.getByText('No body')).toBeVisible();
    await expect(page.getByText('Response size')).toBeVisible();
    await expect(page.getByText('Error details')).toBeVisible();
    await expect(page.getByText('None')).toBeVisible();
  });

  test('server-renders history content in the initial HTML', async ({ page }) => {
    const endpointUrl = await executeSampleRequest(page);

    const response = await page.goto('/en/history');
    expect(response?.ok()).toBeTruthy();

    const html = await page.content();
    expect(html).toContain(endpointUrl);
    expect(html).toContain('Request history');
  });
});
