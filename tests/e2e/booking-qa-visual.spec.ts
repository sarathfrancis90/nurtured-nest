import { expect, type Page, test } from '@playwright/test';

const slots = [
  {
    start_at_utc: new Date(Date.now() + 1000 * 60 * 60 * 10).toISOString(),
    end_at_utc: new Date(Date.now() + 1000 * 60 * 60 * 10 + 15 * 60 * 1000).toISOString(),
    local_label: '08:00 AM',
  },
  {
    start_at_utc: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
    end_at_utc: new Date(Date.now() + 1000 * 60 * 60 * 12 + 15 * 60 * 1000).toISOString(),
    local_label: '10:00 AM',
  },
];

async function seedBookingStubs(page: Page) {
  let confirmed = false;

  await page.route('**/api/bookings/availability*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        data: {
          slots,
        },
      }),
    });
  });

  await page.route('**/api/bookings', (route) => {
    route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        data: {
          booking_id: '00000000-0000-4000-8000-00000000ad91',
          reference_code: 'NN-20260729-QA',
          status: confirmed ? 'confirmed' : 'pending_confirmation',
          starts_at_utc: slots[0].start_at_utc,
          manage_token: 'manage-qa',
          confirm_token: 'confirm-qa',
          client_manage_url: '/book/manage/00000000-0000-4000-8000-00000000ad91?token=manage-qa',
        },
        request_id: 'qa-visual',
      }),
    });
  });

  await page.route('**/api/bookings/*/manage*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        data: {
          booking_id: '00000000-0000-4000-8000-00000000ad91',
          reference_code: 'NN-20260729-QA',
          status: 'pending_confirmation',
          service_type: 'free-15-min-call',
          starts_at_utc: slots[0].start_at_utc,
          local_label: 'Today · 10:00',
          timezone: 'America/Toronto',
          client_name: 'QA User',
          client_email: 'qa@example.com',
          channel_preference: 'email',
        },
        request_id: 'qa-manage',
      }),
    });
  });

  await page.route('**/api/bookings/*/confirm', (route) => {
    confirmed = true;
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        data: {
          booking_id: '00000000-0000-4000-8000-00000000ad91',
          status: 'confirmed',
        },
        request_id: 'qa-confirm',
      }),
    });
  });
}

type Viewport = {
  key: string;
  width: number;
  height: number;
  hasMobileNav: boolean;
};

const viewports: Viewport[] = [
  { key: 'desktop', width: 1440, height: 960, hasMobileNav: false },
  { key: 'tablet', width: 834, height: 1190, hasMobileNav: false },
  { key: 'mobile', width: 390, height: 844, hasMobileNav: true },
];

for (const viewport of viewports) {
  test.describe(`Adversarial visual QA - ${viewport.key}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test('Booking screen keeps spacing, contrast, and control accessibility', async ({ page }) => {
      await seedBookingStubs(page);
      await page.goto('/book');

      await expect(page.getByRole('heading', { name: /book a calm, connected conversation/i })).toBeVisible();
      await expect(page.locator('button.primary-btn.signature-gradient').first()).toBeVisible();

      const primaryButton = page.getByRole('button', { name: /continue to your details/i }).first();
      await expect(primaryButton).toHaveCSS('min-height', '48px');
      await expect(primaryButton).toHaveCSS('border-radius', '999px');

      const cardWidth = await page.locator('.surface-card.asymmetric-shape').first().evaluate((node) => node.getBoundingClientRect().width);
      expect(cardWidth).toBeLessThanOrEqual(viewport.width - 20);

      const noOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth <= window.innerWidth;
      });
      expect(noOverflow).toBe(true);

      const image = await page.screenshot({ fullPage: true });
      await test.info().attach(`booking-step1-${viewport.key}`, {
        body: image,
        contentType: 'image/png',
      });
    });

    test('Step2 and success states remain readable at target breakpoints', async ({ page }) => {
      await seedBookingStubs(page);
      await page.goto('/book');

      await page.locator('button.slot-button').first().click();
      await page.getByRole('button', { name: /continue to your details/i }).click();

      await expect(page.getByRole('heading', { name: /tell us how to reach you/i })).toBeVisible();

  await page.getByLabel(/full name/i).fill('QA Vision');
  await page.getByRole('textbox', { name: /email address/i }).fill('vision.qa@example.com');
      await page.getByRole('button', { name: /review booking/i }).click();
      await expect(page.getByRole('heading', { name: /review before you confirm/i })).toBeVisible();
      await page.getByRole('button', { name: /confirm booking/i }).click();

      await expect(page.getByRole('heading', { name: /booking request received/i })).toBeVisible();
      await expect(page.getByText(/NN-20260729-QA/i)).toBeVisible();

      const successImage = await page.screenshot({ fullPage: true });
      await test.info().attach(`booking-success-${viewport.key}`, {
        body: successImage,
        contentType: 'image/png',
      });
    });

    test('Manage page supports keyboard and motion-safe interactions', async ({ page }) => {
      await seedBookingStubs(page);
      await page.goto('/book/manage/00000000-0000-4000-8000-00000000ad91?token=manage-qa');

      await expect(page.getByRole('heading', { name: /manage your appointment/i })).toBeVisible();
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      const confirm = page.getByRole('button', { name: /confirm appointment/i });
      const cancel = page.getByRole('button', { name: /cancel appointment/i });
      await expect(confirm).toBeVisible();
      await expect(cancel).toBeVisible();

      const mobileNavVisible = await page.locator('.mobile-nav').isVisible();
      const bookingFlowHidesMobileNav = page.url().includes('/book/');
      expect(mobileNavVisible).toBe(viewport.hasMobileNav && !bookingFlowHidesMobileNav);

      await page.getByRole('button', { name: /confirm appointment/i }).click();
      await expect(page.getByText(/appointment is confirmed/i)).toBeVisible();

      const manageImage = await page.screenshot({ fullPage: true });
      await test.info().attach(`manage-page-${viewport.key}`, {
        body: manageImage,
        contentType: 'image/png',
      });
    });
  });
}
