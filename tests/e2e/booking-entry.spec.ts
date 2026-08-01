import { expect, test } from '@playwright/test';

test('Homepage entrypoints consistently route into in-app booking flow', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /compassionate doula support/i })).toBeVisible();

  const inAppBookAnchors = page.locator('a[href="/book"]');
  const count = await inAppBookAnchors.count();
  expect(count).toBeGreaterThanOrEqual(2);

  for (let index = 0; index < count; index += 1) {
    await expect(inAppBookAnchors.nth(index)).toHaveAttribute('href', '/book');
  }

  for (let index = 0; index < count; index += 1) {
    const href = await inAppBookAnchors.nth(index).getAttribute('href');
    expect(href).toBe('/book');
  }

  await expect(page.getByRole('link', { name: /book a free 15-min consultation/i })).toHaveAttribute('href', '/book');

  await page.getByRole('link', { name: /book a free 15-min consultation/i }).click();
  await expect(page).toHaveURL(/\/?book/);

  await page.goBack();
  await page.getByRole('link', { name: /^book$/i }).first().click();
  await expect(page).toHaveURL(/\/?book/);
});
