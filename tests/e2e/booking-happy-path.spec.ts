import { expect, test } from '@playwright/test';

const tomorrowSlot = new Date(Date.now() + 60 * 60 * 1000 * 8).toISOString();

const buildSuccessBooking = () => ({
  ok: true,
  data: {
    booking_id: '00000000-0000-4000-8000-000000000001',
    reference_code: 'NN-20260729-TEST',
    status: 'pending_confirmation',
    starts_at_utc: tomorrowSlot,
    manage_token: 'manage-token-happy-flow',
    confirm_token: 'confirm-token-happy-flow',
    client_manage_url: '/book/manage/00000000-0000-4000-8000-000000000001?token=manage-token-happy-flow',
  },
  request_id: 'e2e-happy-request',
});

test('Booking happy path works with stable UX and clear success state', async ({ page }) => {
  await page.route('**/api/bookings/availability*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        data: {
          slots: [
            {
              start_at_utc: tomorrowSlot,
              end_at_utc: new Date(Date.now() + 1000 * 60 * 60 * 8 + 30 * 60 * 1000).toISOString(),
              local_label: '08:00 AM',
            },
          ],
        },
      }),
    });
  });

  await page.route('**/api/bookings', (route) => {
    route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify(buildSuccessBooking()),
    });
  });

  await page.goto('/book');
  await expect(page.getByRole('heading', { name: /book a calm, connected conversation/i })).toBeVisible();

  await expect(page.getByRole('button', { name: /continue to your details/i })).toBeEnabled();
  await page.locator('button.slot-button').click();
  await page.getByRole('button', { name: /continue to your details/i }).click();

  await page.getByLabel(/full name/i).fill('Jordan Rivera');
  await page.getByRole('textbox', { name: /email address/i }).fill('jordan.rivera@example.com');
  await page.getByLabel(/phone/i).fill('+14165551234');
  await page.getByRole('button', { name: /review booking/i }).click();
  await expect(page.getByRole('heading', { name: /review before you confirm/i })).toBeVisible();
  await page.getByRole('button', { name: /confirm booking/i }).click();

  await expect(page.getByRole('heading', { name: /booking request received/i })).toBeVisible();
  await expect(page.getByText(/nn-20260729-test/i)).toBeVisible();
  await expect(page.getByRole('link', { name: /open my booking page/i })).toHaveAttribute(
    'href',
    '/book/manage/00000000-0000-4000-8000-000000000001?token=manage-token-happy-flow'
  );
});
