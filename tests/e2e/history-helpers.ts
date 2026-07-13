import { expect, type Page } from '@playwright/test';

import { getSupabaseDevCredentials } from './helpers/env';

const SAMPLE_REQUEST = {
  body: null,
  headers: {},
  method: 'GET' as const,
  url: 'https://jsonplaceholder.typicode.com/todos/1',
};

export function hasDevCredentials() {
  const { email, password } = getSupabaseDevCredentials();
  return Boolean(email && password);
}

export function getDevCredentials() {
  const { email, password } = getSupabaseDevCredentials();

  if (!email || !password) {
    throw new Error(
      'Set SUPABASE_DEV_USER_EMAIL and SUPABASE_DEV_USER_PASSWORD in .env to run authenticated history E2E tests.'
    );
  }

  return { email, password };
}

export async function signInWithDevUser(page: Page) {
  const { email, password } = getDevCredentials();

  await page.goto('/en/sign-in', { waitUntil: 'networkidle' });
  await expect(page.getByTestId('sign-in-form')).toBeVisible();

  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await expect(page.locator('#sign-in-email')).toHaveValue(email);
  await expect(page.locator('#sign-in-password')).toHaveValue(password);
  await page.getByTestId('sign-in-submit').click();

  try {
    await expect(page.getByRole('link', { name: 'History' })).toBeVisible({ timeout: 20_000 });
  } catch {
    const formError = page.locator('[data-testid="sign-in-form"] [role="alert"]');
    const message =
      (
        await formError.isVisible().then((visible) => (visible ? formError.textContent() : null))
      )?.trim() || 'Timed out waiting for authenticated session';
    throw new Error(`Sign-in failed: ${message}`);
  }
}

export async function executeSampleRequest(page: Page) {
  const response = await page.request.post('/api/requests/execute', {
    data: SAMPLE_REQUEST,
    headers: { 'content-type': 'application/json' },
  });

  expect(response.ok()).toBeTruthy();

  const payload = (await response.json()) as { analytics?: { recorded: boolean } };
  expect(payload.analytics?.recorded).toBe(true);

  return SAMPLE_REQUEST.url;
}
