import { expect, test } from '@playwright/test';
import contract from '../../contracts/booking-validation.json';

test('Contract contract: availability requires timezone', async ({ request }) => {
  const response = await request.get('/api/bookings/availability', {
    params: {
      service_type: 'free-15-min-call',
      date: '2026-08-01',
    },
  });

  expect(response.status()).toBe(422);
  const body = (await response.json()) as any;
  expect(body).toMatchObject({ ok: false });
  expect(body.error.code).toBe('validation_failed');
  expect(body.error.field).toBe('timezone');
});

test('Contract contract: booking requires valid JSON body', async ({ request }) => {
  const response = await request.post('/api/bookings', {
    headers: { 'content-type': 'application/json' },
    data: '{not-json',
  } as any);

  expect(response.status()).toBe(400);
  const body = (await response.json()) as any;
  expect(body).toMatchObject({ ok: false });
  expect(body.error.code).toBe('invalid_json');
});

test('Contract contract: booking payload validation is deterministic', async ({ request }) => {
  const response = await request.post('/api/bookings', {
    headers: { 'content-type': 'application/json' },
    data: {
      service_type: 'prenatal-consult',
      client_name: 'A',
    },
  });

  expect(response.status()).toBe(422);
  const body = (await response.json()) as any;
  expect(body).toMatchObject({ ok: false });
  expect(body.error.code).toBe('validation_error');
  expect(typeof body.error.message).toBe('string');
});

test('Contract contract: manage endpoint rejects missing token with validation_error', async ({ request }) => {
  const response = await request.get('/api/bookings/00000000-0000-4000-8000-000000000000/manage');
  expect(response.status()).toBe(422);
  const body = (await response.json()) as any;
  expect(body).toMatchObject({ ok: false });
  expect(body.error.code).toBe('validation_error');
});

test('Contract contract: confirm endpoint validates token', async ({ request }) => {
  const response = await request.post('/api/bookings/00000000-0000-4000-8000-000000000000/confirm', {
    headers: { 'content-type': 'application/json' },
    data: {
      token: 'short',
    },
  });

  expect(response.status()).toBe(422);
  const body = (await response.json()) as any;
  expect(body).toMatchObject({ ok: false });
  expect(body.error.code).toBe('validation_error');
});

test('Contract contract: cancel endpoint validates token', async ({ request }) => {
  const response = await request.post('/api/bookings/00000000-0000-4000-8000-000000000000/cancel', {
    headers: { 'content-type': 'application/json' },
    data: {
      token: 'short',
    },
  });

  expect(response.status()).toBe(422);
  const body = (await response.json()) as any;
  expect(body).toMatchObject({ ok: false });
  expect(body.error.code).toBe('validation_error');
});

test('Contract contract: cancel endpoint requires valid JSON body', async ({ request }) => {
  const response = await request.post('/api/bookings/00000000-0000-4000-8000-000000000000/cancel', {
    headers: { 'content-type': 'application/json' },
    data: '{not-json',
  } as any);

  expect(response.status()).toBe(400);
  const body = (await response.json()) as any;
  expect(body).toMatchObject({ ok: false });
  expect(body.error.code).toBe('invalid_json');
});

test('Contract contract includes notification metadata expectations', async () => {
  const contractShape = contract as { api: { contracts: { notificationProviders: Record<string, string>; notificationRemindersHours: number[] } } };
  expect(Array.isArray(contractShape.api.contracts.notificationRemindersHours)).toBe(true);
  expect(contractShape.api.contracts.notificationRemindersHours).toEqual(expect.arrayContaining([24, 1]));
  expect(contractShape.api.contracts.notificationProviders.email).toContain('resend');
});
