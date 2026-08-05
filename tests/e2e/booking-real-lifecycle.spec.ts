import { expect, test } from '@playwright/test';
import { DateTime } from 'luxon';

function nextWeekday(hour: number) {
  let local = DateTime.now().setZone('America/Toronto').plus({ days: 2 }).set({ hour, minute: 0, second: 0, millisecond: 0 });
  while (local.weekday === 7) local = local.plus({ days: 1 });
  return local;
}

test('Real local API lifecycle supports lookup, reschedule, and cancellation for the provided email', async ({ request }) => {
  const original = nextWeekday(11);
  const replacement = original.plus({ days: 1 });
  const idempotencyKey = `local-enhancement-${Date.now()}`;

  const create = await request.post('/api/bookings', {
    data: {
      service_type: 'free-15-min-call',
      client_name: 'Sarath Francis',
      client_email: 'sarathfrancis90@gmail.com',
      start_at_utc: original.toUTC().toISO(),
      timezone: 'America/Toronto',
      idempotency_key: idempotencyKey,
      notes: 'Local enhancement verification',
      channel_preference: 'email',
    },
  });
  expect(create.status()).toBe(201);
  const created = await create.json();
  expect(created.ok).toBe(true);

  const bookingId = created.data.booking_id as string;
  const token = created.data.manage_token as string;
  const lookup = await request.post('/api/bookings/lookup', { data: { email: 'sarathfrancis90@gmail.com' } });
  expect(lookup.status()).toBe(202);
  const lookupBody = await lookup.json();
  expect(lookupBody.data.challenge_id).toBeTruthy();
  expect(lookupBody.data.dev_code).toMatch(/^\d{6}$/);
  const verifiedLookup = await request.post('/api/bookings/lookup/verify', {
    data: {
      email: 'sarathfrancis90@gmail.com',
      challenge_id: lookupBody.data.challenge_id,
      code: lookupBody.data.dev_code,
    },
  });
  expect(verifiedLookup.status()).toBe(200);
  const verifiedLookupBody = await verifiedLookup.json();
  expect(verifiedLookupBody.data.bookings.some((booking: { booking_id: string }) => booking.booking_id === bookingId)).toBe(true);
  expect(JSON.stringify(lookupBody)).not.toContain('client_manage_url');

  const reschedule = await request.post(`/api/bookings/${bookingId}/reschedule`, {
    data: { token, start_at_utc: replacement.toUTC().toISO(), timezone: 'America/Toronto' },
  });
  expect(reschedule.status()).toBe(200);
  expect((await reschedule.json()).data.status).toBe('pending_confirmation');

  const cancel = await request.post(`/api/bookings/${bookingId}/cancel`, { data: { token, reason: 'Local verification cleanup' } });
  expect(cancel.status()).toBe(200);
  expect((await cancel.json()).data.status).toBe('cancelled');
});
