import { expect, test } from '@playwright/test';

test.describe('Sign in', () => {
  test('loads the sign-in page from the header link', async ({ page }) => {
    await page.goto('/en');
    await page.getByRole('link', { name: 'Sign In' }).click();

    await expect(page).toHaveURL(/\/en\/sign-in$/);
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('shows client-side validation errors when submitted empty', async ({ page }) => {
    await page.goto('/en/sign-in');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByText('Invalid email address')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('shows only the password error when email is valid', async ({ page }) => {
    await page.goto('/en/sign-in');
    await page.getByPlaceholder('john@email.com').fill('user@example.com');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByText('Invalid email address')).not.toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });
});

test.describe('Sign up', () => {
  test('loads the sign-up page from the header link', async ({ page }) => {
    await page.goto('/en');
    await page.getByRole('link', { name: 'Sign Up' }).click();

    await expect(page).toHaveURL(/\/en\/sign-up$/);
    await expect(page.getByRole('heading', { name: 'Sign Up' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible();
  });

  test('shows name validation while typing', async ({ page }) => {
    await page.goto('/en/sign-up');
    await page.getByRole('textbox', { name: 'Name' }).fill('a');

    await expect(page.getByText('Name must be at least 2 characters')).toBeVisible();
  });

  test('shows password mismatch without contacting the server', async ({ page }) => {
    await page.goto('/en/sign-up');
    await page.getByLabel('Password', { exact: true }).fill('Password1!');
    await page.getByLabel('Confirm password').fill('Different1!');

    await expect(page.getByText('Passwords do not match')).toBeVisible();
  });

  test('shows password rule feedback while typing', async ({ page }) => {
    await page.goto('/en/sign-up');
    await page.getByLabel('Password', { exact: true }).fill('aB1!');

    await expect(page.getByText('Password must contain at least 8 characters')).toBeVisible();
  });
});

test.describe('Sign up (Russian locale)', () => {
  test('loads localized validation messages', async ({ page }) => {
    await page.goto('/ru/sign-up');
    await page.getByRole('textbox', { name: 'Имя' }).fill('a');

    await expect(page.getByText('Имя должно содержать не менее 2 символов')).toBeVisible();
  });
});
