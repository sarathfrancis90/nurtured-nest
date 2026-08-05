import { expect, test } from '@playwright/test';

const bookingId = '00000000-0000-4000-8000-00000000beef';
const token = 'manage-enhancement-token';
const originalSlot = new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString();
const replacementSlot = new Date(Date.now() + 1000 * 60 * 60 * 14).toISOString();

const managePayload = (status: 'pending_confirmation' | 'confirmed' | 'cancelled' = 'confirmed') => ({
  ok: true,
  data: {
    booking_id: bookingId,
    reference_code: 'NN-ENHANCEMENT',
    status,
    service_type: 'free-15-min-call',
    starts_at_utc: originalSlot,
    local_label: 'Tue, Aug 5 · 10:00 AM',
    timezone: 'America/Toronto',
    client_name: 'Sarath Francis',
    client_email: 'sarathfrancis90@gmail.com',
    channel_preference: 'email',
  },
});

test('Booking lookup works with the provided email and returns a secure booking page', async ({ page }) => {
  await page.route('**/api/bookings/lookup', async (route) => {
    const request = route.request();
    expect(JSON.parse(request.postData() ?? '{}')).toMatchObject({ email: 'sarathfrancis90@gmail.com' });
    await route.fulfill({ status: 202, contentType: 'application/json', body: JSON.stringify({ ok: true, data: { challenge_id: '00000000-0000-4000-8000-00000000beef', delivery_channel: 'email', dev_code: '123456' } }) });
  });
  await page.route('**/api/bookings/lookup/verify', async (route) => {
    expect(JSON.parse(route.request().postData() ?? '{}')).toMatchObject({ email: 'sarathfrancis90@gmail.com', challenge_id: '00000000-0000-4000-8000-00000000beef', code: '123456' });
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: { bookings: [{ booking_id: bookingId, reference_code: 'NN-ENHANCEMENT', status: 'confirmed', service_type: 'free-15-min-call', local_label: 'Tue, Aug 5 · 10:00 AM', timezone: 'America/Toronto', client_manage_url: `/book/manage/${bookingId}?token=${token}` }] } }) });
  });

  await page.goto('/book/lookup');
  await page.getByLabel(/email address/i).fill('sarathfrancis90@gmail.com');
  await page.getByRole('button', { name: /send verification code/i }).click();
  await expect(page.getByText(/local development code/i)).toBeVisible();
  await page.getByLabel(/verification code/i).fill('123456');
  await page.getByRole('button', { name: /verify and show bookings/i }).click();
  await expect(page.getByText('NN-ENHANCEMENT')).toBeVisible();
  await expect(page.getByRole('link', { name: /open booking page/i })).toHaveAttribute('href', `/book/manage/${bookingId}?token=${token}`);
});

test('Manage page requires explicit cancellation confirmation and reason', async ({ page }) => {
  let cancelled = false;
  await page.route('**/api/bookings/*/manage?*', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(managePayload(cancelled ? 'cancelled' : 'confirmed')) }));
  await page.route('**/api/bookings/*/cancel', async (route) => {
    expect(JSON.parse(route.request().postData() ?? '{}')).toMatchObject({ token, reason: 'No longer needed' });
    cancelled = true;
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: { booking_id: bookingId, status: 'cancelled' } }) });
  });

  await page.goto(`/book/manage/${bookingId}?token=${token}`);
  await page.getByRole('button', { name: /cancel appointment/i }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('dialog').getByLabel(/reason/i).selectOption({ label: 'No longer needed' });
  await page.getByRole('dialog').getByRole('button', { name: /yes, cancel it/i }).click();
  await expect(page.getByText(/appointment has been cancelled/i)).toBeVisible();
});

test('Reschedule page shows the large calendar and saves a new time', async ({ page }) => {
  await page.route('**/api/bookings/*/manage?*', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(managePayload()) }));
  await page.route('**/api/bookings/availability*', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: { slots: [{ start_at_utc: replacementSlot, end_at_utc: new Date(new Date(replacementSlot).getTime() + 15 * 60_000).toISOString(), local_label: '12:00 PM' }] } }) }));
  await page.route('**/api/bookings/*/reschedule', async (route) => {
    expect(JSON.parse(route.request().postData() ?? '{}')).toMatchObject({ token, start_at_utc: replacementSlot });
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: { booking_id: bookingId, status: 'confirmed', start_at_utc: replacementSlot } }) });
  });

  await page.goto(`/book/reschedule/${bookingId}?token=${token}`);
  await expect(page.locator('.calendar-widget')).toBeVisible();
  await page.locator('button.slot-button').click();
  await page.getByRole('button', { name: /save new time/i }).click();
  await expect(page.getByRole('heading', { name: /new time is saved/i })).toBeVisible();
});
