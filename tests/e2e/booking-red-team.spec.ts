import { expect, test, type APIRequestContext } from '@playwright/test';
import { DateTime } from 'luxon';

test.describe.configure({ mode: 'serial' });

function futureLocal(days: number, hour: number) {
  let value = DateTime.now().setZone('America/Toronto').plus({ days }).set({ hour, minute: 0, second: 0, millisecond: 0 });
  while (value.weekday === 7) value = value.plus({ days: 1 });
  return value;
}

async function createBooking(request: APIRequestContext, start: DateTime, email: string, phone?: string) {
  const response = await request.post('/api/bookings', {
    data: {
      service_type: 'free-15-min-call',
      client_name: 'Red Team Test',
      client_email: email,
      client_phone_e164: phone,
      start_at_utc: start.toUTC().toISO(),
      timezone: 'America/Toronto',
      idempotency_key: `red-team-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      channel_preference: 'email',
    },
  });
  return { response, body: await response.json() };
}

test('Availability rejects impossible calendar dates and accepts multi-segment IANA zones', async ({ request }) => {
  const invalid = await request.get('/api/bookings/availability', { params: { service_type: 'free-15-min-call', timezone: 'America/Toronto', date: '2026-02-30' } });
  expect(invalid.status()).toBe(422);
  const valid = await request.get('/api/bookings/availability', { params: { service_type: 'free-15-min-call', timezone: 'America/Argentina/Buenos_Aires', date: '2026-08-10' } });
  expect(valid.status()).toBe(200);
});

test('Concurrent create requests cannot claim the same slot', async ({ request }) => {
  const start = futureLocal(12, 11);
  const first = createBooking(request, start, `red-team-create-a-${Date.now()}@example.com`);
  const second = createBooking(request, start, `red-team-create-b-${Date.now()}@example.com`);
  const results = await Promise.all([first, second]);
  expect(results.map(({ response }) => response.status()).sort()).toEqual([201, 409]);

  const winner = results.find(({ response }) => response.status() === 201);
  if (winner) {
    await request.post(`/api/bookings/${winner.body.data.booking_id}/cancel`, { data: { token: winner.body.data.manage_token, reason: 'red-team cleanup' } });
  }
});

test('Lookup requires a one-time code and formatted phone numbers normalize consistently', async ({ request }) => {
  const email = `red-team-phone-${Date.now()}@example.com`;
  const created = await createBooking(request, futureLocal(13, 12), email, '(416) 555-0199');
  expect(created.response.status()).toBe(201);

  const lookup = await request.post('/api/bookings/lookup', { data: { phone: '(416) 555-0199' } });
  expect(lookup.status()).toBe(202);
  const lookupBody = await lookup.json();
  expect(lookupBody.data.challenge_id).toBeTruthy();
  expect(JSON.stringify(lookupBody)).not.toContain('client_manage_url');

  const unauthorized = await request.post('/api/bookings/lookup/verify', { data: { phone: '(416) 555-0199', challenge_id: lookupBody.data.challenge_id, code: '000000' } });
  expect(unauthorized.status()).toBe(403);

  const verified = await request.post('/api/bookings/lookup/verify', { data: { phone: '(416) 555-0199', challenge_id: lookupBody.data.challenge_id, code: lookupBody.data.dev_code } });
  expect(verified.status()).toBe(200);
  expect((await verified.json()).data.bookings[0].client_manage_url).toContain('/book/manage/');
  await request.post(`/api/bookings/${created.body.data.booking_id}/cancel`, { data: { token: created.body.data.manage_token, reason: 'red-team cleanup' } });
});

test('Concurrent reschedules cannot move two bookings into the same slot', async ({ request }) => {
  const first = await createBooking(request, futureLocal(14, 10), `red-team-reschedule-a-${Date.now()}@example.com`);
  const second = await createBooking(request, futureLocal(15, 10), `red-team-reschedule-b-${Date.now()}@example.com`);
  expect(first.response.status()).toBe(201);
  expect(second.response.status()).toBe(201);
  const target = futureLocal(16, 11);
  const responses = await Promise.all([
    request.post(`/api/bookings/${first.body.data.booking_id}/reschedule`, { data: { token: first.body.data.manage_token, start_at_utc: target.toUTC().toISO(), timezone: 'America/Toronto' } }),
    request.post(`/api/bookings/${second.body.data.booking_id}/reschedule`, { data: { token: second.body.data.manage_token, start_at_utc: target.toUTC().toISO(), timezone: 'America/Toronto' } }),
  ]);
  expect(responses.map((response) => response.status()).sort()).toEqual([200, 409]);
  await request.post(`/api/bookings/${first.body.data.booking_id}/cancel`, { data: { token: first.body.data.manage_token, reason: 'red-team cleanup' } });
  await request.post(`/api/bookings/${second.body.data.booking_id}/cancel`, { data: { token: second.body.data.manage_token, reason: 'red-team cleanup' } });
});
