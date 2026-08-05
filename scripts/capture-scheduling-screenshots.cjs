const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');

const baseURL = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3002';
const outputDir = path.resolve(process.cwd(), 'artifacts/scheduling');
const bookingId = '00000000-0000-4000-8000-00000000cafe';
const token = 'screenshot-manage-token';
const slot = new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString();
const replacementSlot = new Date(Date.now() + 1000 * 60 * 60 * 14).toISOString();

fs.mkdirSync(outputDir, { recursive: true });

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, locale: 'en-CA', timezoneId: 'America/Toronto' });
  const screenshot = async (name) => {
    await page.evaluate(() => window.scrollTo(0, 0));
    return page.screenshot({ path: path.join(outputDir, name), fullPage: true });
  };

  await page.route('**/api/bookings/availability*', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: { slots: [{ start_at_utc: slot, end_at_utc: new Date(new Date(slot).getTime() + 15 * 60_000).toISOString(), local_label: '10:00 AM' }, { start_at_utc: replacementSlot, end_at_utc: new Date(new Date(replacementSlot).getTime() + 15 * 60_000).toISOString(), local_label: '12:00 PM' }] } }) }));
  await page.route('**/api/bookings', (route) => route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ ok: true, data: { booking_id: bookingId, reference_code: 'NN-SCREENSHOT', status: 'pending_confirmation', starts_at_utc: slot, manage_token: token, confirm_token: 'confirm-screenshot-token', client_manage_url: `/book/manage/${bookingId}?token=${token}` } }) }));

  await page.goto(`${baseURL}/book`);
  await page.waitForLoadState('networkidle');
  await screenshot('01-book-choose-time.png');
  await page.locator('button.slot-button').first().click();
  await page.getByRole('button', { name: /continue to your details/i }).click();
  await page.waitForTimeout(700);
  await screenshot('02-book-your-details.png');
  await page.getByLabel(/full name/i).fill('Sarath Francis');
  await page.getByRole('textbox', { name: /email address/i }).fill('sarathfrancis90@gmail.com');
  await page.getByRole('button', { name: /review booking/i }).click();
  await page.waitForTimeout(700);
  await screenshot('03-book-review.png');
  await page.getByRole('button', { name: /confirm booking/i }).click();
  await screenshot('04-book-success.png');

  await page.route('**/api/bookings/lookup', (route) => route.fulfill({ status: 202, contentType: 'application/json', body: JSON.stringify({ ok: true, data: { challenge_id: '00000000-0000-4000-8000-00000000cafe', delivery_channel: 'email', dev_code: '123456' } }) }));
  await page.route('**/api/bookings/lookup/verify', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: { bookings: [{ booking_id: bookingId, reference_code: 'NN-SCREENSHOT', status: 'pending_confirmation', service_type: 'free-15-min-call', local_label: 'Tue, Aug 5 · 10:00 AM', timezone: 'America/Toronto', client_manage_url: `/book/manage/${bookingId}?token=${token}` }] } }) }));
  await page.goto(`${baseURL}/book/lookup`);
  await page.getByLabel(/email address/i).fill('sarathfrancis90@gmail.com');
  await page.getByRole('button', { name: /send verification code/i }).click();
  await screenshot('05-book-lookup-verification.png');
  await page.getByLabel(/verification code/i).fill('123456');
  await page.getByRole('button', { name: /verify and show bookings/i }).click();
  await screenshot('06-book-lookup-results.png');

  await page.route('**/api/bookings/*/manage?*', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: { booking_id: bookingId, reference_code: 'NN-SCREENSHOT', status: 'confirmed', service_type: 'free-15-min-call', starts_at_utc: slot, local_label: 'Tue, Aug 5 · 10:00 AM', timezone: 'America/Toronto', client_name: 'Sarath Francis', client_email: 'sarathfrancis90@gmail.com', channel_preference: 'email' } }) }));
  await page.goto(`${baseURL}/book/manage/${bookingId}?token=${token}`);
  await screenshot('07-book-manage.png');
  await page.getByRole('button', { name: /cancel appointment/i }).click();
  await screenshot('08-book-cancel-dialog.png');

  await page.route('**/api/bookings/*/reschedule', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: { booking_id: bookingId, status: 'confirmed', start_at_utc: replacementSlot } }) }));
  await page.goto(`${baseURL}/book/reschedule/${bookingId}?token=${token}`);
  await page.waitForLoadState('networkidle');
  await screenshot('09-book-reschedule.png');
  await page.locator('button.slot-button').nth(1).click();
  await page.getByRole('button', { name: /save new time/i }).click();
  await screenshot('10-book-reschedule-success.png');

  await browser.close();
  console.log(outputDir);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
