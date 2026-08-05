import { expect, test } from '@playwright/test';

test('Original static homepage remains unchanged and booking flow is a separate route', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Nurtured Nest.*Compassionate Doula Support/i);
  await expect(page.locator('#home')).toBeVisible();
  await expect(page.locator('#desktop-nav')).toBeVisible();
  await expect(page.locator('h1')).toContainText(/compassionate\s+doula\s+support/i);

  const bookingLinks = page.locator('a[href="/book"]');
  await expect(bookingLinks).toHaveCount(2);
  const bookingCta = page.getByRole('link', { name: 'Book a free 15mins Consultation call', exact: true });
  await expect(bookingCta).toHaveCount(1);
  await expect(bookingCta).toBeVisible();
  await bookingCta.click();
  await expect(page).toHaveURL(/\/book$/);
  await expect(page.getByRole('heading', { name: /book a calm, connected conversation/i })).toBeVisible();

  await page.goto('/book');
  await expect(page).toHaveURL(/\/book$/);
  await expect(page.getByRole('heading', { name: /book a calm, connected conversation/i })).toBeVisible();
});

test('Mobile homepage booking CTA routes to the booking page', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const mobileBookingCta = page.getByRole('link', { name: 'Book a Free 15mins Consultation Call', exact: true });
  await expect(mobileBookingCta).toHaveCount(1);
  await expect(mobileBookingCta).toBeVisible();
  await mobileBookingCta.click();
  await expect(page).toHaveURL(/\/book$/);
  await expect(page.getByRole('heading', { name: /book a calm, connected conversation/i })).toBeVisible();
});
