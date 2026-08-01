import { expect, test } from '@playwright/test';

test('Original static homepage remains unchanged and booking flow is a separate route', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Nurtured Nest.*Compassionate Doula Support/i);
  await expect(page.locator('#home')).toBeVisible();
  await expect(page.locator('#desktop-nav')).toBeVisible();
  await expect(page.locator('h1')).toContainText(/birth/i);

  const legacyConsultationLink = page.getByRole('link', { name: /book a free 15mins consultation call/i }).first();
  await expect(legacyConsultationLink).toHaveAttribute('href', '#contact');
  await expect(page.locator('a[href="/book"]')).toHaveCount(0);

  await page.goto('/book');
  await expect(page).toHaveURL(/\/book$/);
  await expect(page.getByRole('heading', { name: /book your appointment/i })).toBeVisible();
});
