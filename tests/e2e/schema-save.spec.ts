import { expect, test, type Page } from '@playwright/test';

import { getSupabaseDevCredentials, hasSupabaseDevCredentials } from './helpers/env';

const BASE_SCHEMA = {
  openapi: '3.0.0',
  info: { title: 'E2E Schema', version: '1.0.0' },
  paths: {},
} as const;

function buildSchema(title: string) {
  return JSON.stringify({
    ...BASE_SCHEMA,
    info: { ...BASE_SCHEMA.info, title },
  });
}

async function fillMonacoEditor(page: Page, value: string) {
  await page.locator('.monaco-editor').waitFor({ state: 'visible' });

  const filled = await page.evaluate((text) => {
    const monaco = (
      window as Window & {
        monaco?: { editor: { getModels: () => Array<{ setValue: (v: string) => void }> } };
      }
    ).monaco;

    const model = monaco?.editor.getModels()[0];
    if (!model) {
      return false;
    }

    model.setValue(text);
    return true;
  }, value);

  if (filled) {
    return;
  }

  const editor = page.locator('.monaco-editor');
  await editor.click({ position: { x: 40, y: 40 } });
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.evaluate(async (text) => {
    await navigator.clipboard.writeText(text);
  }, value);
  await page.keyboard.press('ControlOrMeta+V');
}

async function waitForValidSchema(page: Page) {
  await expect(page.getByText('Valid', { exact: true })).toBeVisible({ timeout: 10_000 });
}

async function expectMonacoEditorValue(page: Page, value: string) {
  await expect(page.locator('.monaco-editor')).toContainText(value);
}

async function signIn(page: Page) {
  const { email, password } = getSupabaseDevCredentials();

  await page.goto('/en/sign-in');
  await page.getByPlaceholder('john@email.com').fill(email!);
  await page.getByLabel('Password', { exact: true }).fill(password!);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL(/\/en\/?$/);
}

async function signOut(page: Page) {
  await page.getByRole('button', { name: 'Sign Out' }).click();
  await expect(page).toHaveURL(/\/en\/?$/);
  await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible();
}

test.describe('Schema persistence', () => {
  test('does not show Save for unauthenticated users', async ({ page }) => {
    await page.goto('/en');

    await expect(page.getByRole('button', { name: 'Save' })).not.toBeVisible();
  });

  test('saves a schema and restores it after signing in again', async ({ page }) => {
    test.skip(!hasSupabaseDevCredentials(), 'Supabase dev credentials are required');
    test.setTimeout(90_000);

    const uniqueId = String(Date.now());
    const uniqueTitle = `E2E Schema ${uniqueId}`;
    const schema = buildSchema(uniqueTitle);

    await signIn(page);
    await expect(page.getByText('Restoring saved schema...')).toBeHidden({ timeout: 15_000 });

    await fillMonacoEditor(page, schema);
    await waitForValidSchema(page);

    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByRole('button', { name: 'Saved!' })).toBeVisible();

    await signOut(page);
    await signIn(page);

    await expect(page.getByText('Restoring saved schema...')).toBeHidden({ timeout: 15_000 });
    await expectMonacoEditorValue(page, uniqueId);
  });
});
