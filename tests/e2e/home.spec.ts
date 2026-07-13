import { expect, test } from '@playwright/test';

test.describe('Home page layout', () => {
  test('renders editor and viewer anchors inside the split workspace', async ({ page }) => {
    await page.goto('/en');

    await expect(page.locator('.split-workspace')).toBeVisible();
    await expect(page.locator('#editor')).toBeVisible();
    await expect(page.locator('#viewer')).toBeVisible();
    await expect(page.getByText('Editor', { exact: true })).toBeVisible();
    await expect(page.getByText('Preview', { exact: true })).toBeVisible();
  });

  test('aligns swagger workspace with the header content column', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto('/en');

    const headerInner = page.locator('.sticky-header__inner.app-container');
    const swaggerContainer = page.locator('main .app-container').first();

    await expect(headerInner).toBeVisible();
    await expect(swaggerContainer).toBeVisible();

    const headerBox = await headerInner.boundingBox();
    const swaggerBox = await swaggerContainer.boundingBox();

    expect(headerBox).not.toBeNull();
    expect(swaggerBox).not.toBeNull();
    expect(headerBox!.x).toBeCloseTo(swaggerBox!.x, 0);
    expect(headerBox!.width).toBeCloseTo(swaggerBox!.width, 0);
  });

  test('uses a horizontal split in landscape viewports', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/en');

    const flexDirection = await page
      .locator('.split-workspace')
      .evaluate((element) => getComputedStyle(element).flexDirection);

    expect(flexDirection).toBe('row');
  });

  test('uses a vertical split in portrait viewports', async ({ page }) => {
    await page.setViewportSize({ width: 720, height: 1280 });
    await page.goto('/en');

    const flexDirection = await page
      .locator('.split-workspace')
      .evaluate((element) => getComputedStyle(element).flexDirection);

    expect(flexDirection).toBe('column');
  });
});

test('loads the home page', async ({ page }) => {
  await page.goto('/en');

  await expect(page.getByText('Editor', { exact: true })).toBeVisible();
  await expect(page.getByText('Preview', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Sign Up' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'About' }).first()).toBeVisible();
});

test('loads the Russian home page', async ({ page }) => {
  await page.goto('/ru');

  await expect(page.getByText('Редактор', { exact: true })).toBeVisible();
  await expect(page.getByText('Превью', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Войти' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Регистрация' })).toBeVisible();
});

test('switches language on the current route', async ({ page }) => {
  await page.goto('/en/about');

  await page.getByRole('link', { name: 'ru' }).click();

  await expect(page).toHaveURL(/\/ru\/about$/);
  await expect(page.getByRole('heading', { name: 'О Swagger Editor App' })).toBeVisible();
});
