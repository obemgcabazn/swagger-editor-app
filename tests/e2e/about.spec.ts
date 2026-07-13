import { expect, test } from '@playwright/test';

test.describe('About page', () => {
  test('is publicly accessible without authentication', async ({ page }) => {
    await page.goto('/en/about');

    await expect(page).toHaveURL(/\/en\/about$/);
    await expect(page.getByRole('heading', { name: 'About Swagger Editor App' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign Up' })).toBeVisible();
  });

  test('shows team members, technologies, course info, and resources', async ({ page }) => {
    await page.goto('/en/about');

    await expect(page.getByRole('heading', { name: 'Development team' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Aleksandr Khokhryakov' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Palina Yarkevich' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Alex Freen' })).toBeVisible();
    await expect(page.getByText('Team Lead')).toBeVisible();
    await expect(page.getByRole('link', { name: 'GitHub' }).first()).toHaveAttribute(
      'href',
      'https://github.com/obemgcabazn'
    );

    await expect(page.getByRole('heading', { name: 'Technology stack' })).toBeVisible();
    await expect(page.getByText('Next.js', { exact: true })).toBeVisible();
    await expect(page.getByText('Supabase', { exact: true })).toBeVisible();

    await expect(page.getByRole('heading', { name: 'RS School course' })).toBeVisible();
    await expect(
      page
        .getByRole('heading', { name: 'RS School course' })
        .locator('..')
        .getByRole('link', { name: 'RS School React course' })
    ).toHaveAttribute('href', 'https://rs.school/courses/reactjs');

    await expect(page.getByRole('heading', { name: 'Useful resources' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'RS School', exact: true })).toHaveAttribute(
      'href',
      'https://rs.school/'
    );
    await expect(
      page
        .getByRole('heading', { name: 'Useful resources' })
        .locator('..')
        .getByRole('link', { name: 'OpenAPI Specification' })
    ).toHaveAttribute('href', 'https://www.openapis.org/');
  });
});
